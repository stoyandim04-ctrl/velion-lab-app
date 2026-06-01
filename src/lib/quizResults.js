// Pending quiz cache + Supabase persistence for Контрол индекс results.
//
// Why a cache: the user takes the quiz BEFORE signing up. The score must
// not be lost when they navigate to /auth, register, and finally hit the
// dashboard — but at quiz time they have no user_id yet.
//
// Flow:
//   1. ResultsScreen renders → savePendingQuiz(answers, score, tier)
//      stashes the result in localStorage under a global pending key.
//   2. After successful signup, AuthContext (or any first-load gate)
//      calls flushPendingQuizToSupabase(userId) which inserts a row of
//      kind='initial' and clears the cache.
//   3. Later quiz retakes (after Day 60 etc.) call recordQuizResult
//      directly with the authenticated user_id and the appropriate kind.

import { supabase } from './supabaseClient.js'
import { awardInitialQuiz } from './gamification.js'

const PENDING_KEY = 'velion_pending_initial_quiz'

function safeWindow() {
  return typeof window === 'undefined' ? null : window
}

export function savePendingQuiz({ answers, score, tier }) {
  const w = safeWindow()
  if (!w) return
  try {
    w.localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({
        answers: answers || {},
        score,
        tier,
        captured_at: new Date().toISOString()
      })
    )
  } catch {}
}

export function readPendingQuiz() {
  const w = safeWindow()
  if (!w) return null
  try {
    const raw = w.localStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearPendingQuiz() {
  const w = safeWindow()
  if (!w) return
  try {
    w.localStorage.removeItem(PENDING_KEY)
  } catch {}
}

// Direct write. Used both by flushPendingQuizToSupabase (kind='initial')
// and by future retake flows (kind='final' / 'retake').
export async function recordQuizResult(userId, { kind, score, tier, answers }) {
  if (!userId) return { data: null, error: new Error('Missing userId') }
  const tierId = typeof tier === 'string' ? tier : tier?.id
  if (!tierId) return { data: null, error: new Error('Missing tier') }

  const { data, error } = await supabase
    .from('user_quiz_results')
    .insert({
      user_id: userId,
      kind,
      score,
      tier: tierId,
      answers: answers || {}
    })
    .select()
    .single()

  if (error) {
    console.warn('[Velion] recordQuizResult error:', error.message)
  }
  return { data, error }
}

// Read latest result for this user of a specific kind (or any kind).
export async function fetchLatestQuizResult(userId, kind = null) {
  if (!userId) return null
  let query = supabase
    .from('user_quiz_results')
    .select('id, kind, score, tier, answers, taken_at')
    .eq('user_id', userId)
    .order('taken_at', { ascending: false })
    .limit(1)
  if (kind) query = query.eq('kind', kind)
  const { data, error } = await query.maybeSingle()
  if (error) {
    console.warn('[Velion] fetchLatestQuizResult error:', error.message)
    return null
  }
  return data
}

// Called once per authenticated session after signup/login. Inspects
// the cached pending quiz and decides which kind it should land under:
//   - no 'initial' row yet                 → kind='initial' (the
//     onboarding baseline; awards 'quiz_taken' badge + 50 XP)
//   - 'initial' exists AND user has done   → kind='final' (the
//     completion test for the before/after  narrative)
//     60+ day completions AND no 'final'
//   - otherwise                            → kind='retake' (any
//     quiz the user explicitly redoes from the dashboard)
//
// Idempotent: safe to call on every auth state change. If nothing is
// pending or the kind we'd write already exists, returns the existing
// row instead of inserting a duplicate.
export async function flushPendingQuizToSupabase(userId) {
  if (!userId) return null
  const pending = readPendingQuiz()
  if (!pending) return null

  const kind = await resolveQuizKind(userId)
  if (kind === 'initial') {
    const existing = await fetchLatestQuizResult(userId, 'initial')
    if (existing) {
      clearPendingQuiz()
      return existing
    }
  } else if (kind === 'final') {
    const existing = await fetchLatestQuizResult(userId, 'final')
    if (existing) {
      clearPendingQuiz()
      return existing
    }
  }
  // 'retake' is allowed to insert multiple rows over time, so no
  // dedup check there.

  const { data, error } = await recordQuizResult(userId, {
    kind,
    score: pending.score,
    tier: pending.tier,
    answers: pending.answers
  })
  if (!error) {
    clearPendingQuiz()
    if (kind === 'initial') {
      // Reward the user for completing their first Контрол индекс.
      // Fires the 'quiz_taken' badge and grants +50 XP — best-effort.
      awardInitialQuiz(userId, { score: pending.score, tier: pending.tier }).catch(() => {})
    } else if (kind === 'final') {
      const { awardQuizImprovement } = await import('./gamification.js')
      const initialRow = await fetchLatestQuizResult(userId, 'initial')
      if (initialRow) {
        awardQuizImprovement(userId, {
          initialScore: initialRow.score,
          finalScore: pending.score
        }).catch(() => {})
      }
    }
  }
  return data
}

async function resolveQuizKind(userId) {
  const initial = await fetchLatestQuizResult(userId, 'initial')
  if (!initial) return 'initial'

  const { count } = await supabase
    .from('user_day_completions')
    .select('day_number', { count: 'exact', head: true })
    .eq('user_id', userId)
  const completedDays = count || 0

  if (completedDays >= 60) {
    const final = await fetchLatestQuizResult(userId, 'final')
    if (!final) return 'final'
  }
  return 'retake'
}
