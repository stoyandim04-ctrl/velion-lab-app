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

// Called once per authenticated session after signup/login. If a pending
// pre-signup quiz is cached AND the user doesn't already have an 'initial'
// row, copy the cache into Supabase and clear it. Idempotent: safe to call
// on every auth state change.
export async function flushPendingQuizToSupabase(userId) {
  if (!userId) return null
  const pending = readPendingQuiz()
  if (!pending) return null

  // Avoid creating duplicate 'initial' rows on repeated auth events.
  const existing = await fetchLatestQuizResult(userId, 'initial')
  if (existing) {
    clearPendingQuiz()
    return existing
  }

  const { data, error } = await recordQuizResult(userId, {
    kind: 'initial',
    score: pending.score,
    tier: pending.tier,
    answers: pending.answers
  })
  if (!error) clearPendingQuiz()
  return data
}
