// XP + Levels + Badges. The single entry point for "the user just did
// something gamification-worthy" is awardForDayCompletion(userId,
// dayNumber, context). It handles all of:
//
//   - awarding XP for the action
//   - recomputing the level
//   - updating streak counters (with a 1-day grace window — same logic
//     as the existing engagement.recordDayCompletion, but persisted)
//   - checking every badge's unlock criteria and writing newly earned
//     ones to public.user_badges
//
// Returns a result object the caller can use to drive celebration UI:
//   { xpGained, totalXp, level, leveledUp, streak, newBadges: [...] }
//
// All Supabase writes are best-effort: if the network is down or RLS
// rejects the write, we fall back to a localStorage cache so the local
// dashboard widget still reflects the gain. The next successful auth
// event flushes pending state back to the server.

import { supabase } from './supabaseClient.js'
import { BADGES, BADGES_BY_ID } from '../data/badges.js'
import { MODULES, TOTAL_DAYS } from '../data/course.js'

// Level curve. Each entry is the XP threshold to *reach* that level.
// Level 1 is implied (0 XP). 10 levels in v1; we can extend later.
const LEVEL_THRESHOLDS = [
  0,     // L1
  100,   // L2
  250,   // L3
  500,   // L4
  850,   // L5
  1300,  // L6
  1850,  // L7
  2500,  // L8
  3250,  // L9
  4100,  // L10
  5050   // L11 (sentinel for progress bar)
]

export const MAX_LEVEL = LEVEL_THRESHOLDS.length - 1

const XP_REWARDS = {
  dayCompleted: 25,
  initialQuiz: 50,
  moduleCompleted: 100,
  weekStreakBonus: 75,
  monthStreakBonus: 300
}

const CACHE_KEY = (userId) => `velion_gamification_${userId}`
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const STREAK_GRACE_DAYS = 1

function todayKey(date = new Date()) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return local.toISOString().slice(0, 10)
}

function daysBetween(a, b) {
  if (!a || !b) return null
  const start = new Date(`${a}T00:00:00`)
  const end = new Date(`${b}T00:00:00`)
  return Math.round((end - start) / ONE_DAY_MS)
}

export function levelForXp(xp) {
  if (xp == null || xp < 0) return 1
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }
  return Math.min(level, MAX_LEVEL)
}

export function progressWithinLevel(xp, level) {
  const safeLevel = Math.max(1, Math.min(MAX_LEVEL, level || levelForXp(xp)))
  const base = LEVEL_THRESHOLDS[safeLevel - 1] ?? 0
  const next = LEVEL_THRESHOLDS[safeLevel] ?? base + 1
  const span = Math.max(1, next - base)
  const into = Math.max(0, (xp ?? 0) - base)
  return {
    base,
    next,
    span,
    into,
    pct: Math.min(100, Math.max(0, Math.round((into / span) * 100))),
    atMax: safeLevel >= MAX_LEVEL
  }
}

// ── local cache (fallback when Supabase write fails) ─────────────────

function readCache(userId) {
  if (!userId || typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(userId, state) {
  if (!userId || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY(userId), JSON.stringify(state))
  } catch {}
}

function emptyState() {
  return {
    xp: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0,
    last_completion_date: null,
    current_week_streak: 0,
    longest_week_streak: 0,
    last_week_active: null,
    current_month_streak: 0,
    longest_month_streak: 0,
    last_month_active: null
  }
}

function isoWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function nextWeekKey(weekKey) {
  // weekKey format: "2026-W22"
  const [year, w] = weekKey.split('-W')
  const next = parseInt(w, 10) + 1
  if (next > 52) return `${parseInt(year, 10) + 1}-W01`
  return `${year}-W${String(next).padStart(2, '0')}`
}

function nextMonthKey(monthK) {
  const [year, m] = monthK.split('-').map((s) => parseInt(s, 10))
  if (m === 12) return `${year + 1}-01`
  return `${year}-${String(m + 1).padStart(2, '0')}`
}

// ── public reads ─────────────────────────────────────────────────────

export async function fetchGamification(userId) {
  if (!userId) return emptyState()
  const { data, error } = await supabase
    .from('user_gamification')
    .select('xp, level, current_streak, longest_streak, last_completion_date, current_week_streak, longest_week_streak, last_week_active, current_month_streak, longest_month_streak, last_month_active')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[Velion] fetchGamification error:', error.message)
    return readCache(userId) || emptyState()
  }
  const state = data || emptyState()
  writeCache(userId, state)
  return state
}

export function getCachedGamification(userId) {
  return readCache(userId) || emptyState()
}

export async function fetchUnlockedBadges(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id, unlocked_at, context')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })
  if (error) {
    console.warn('[Velion] fetchUnlockedBadges error:', error.message)
    return []
  }
  return data || []
}

// ── core write: award day completion ─────────────────────────────────

function recomputeStreak(prevDate, today) {
  const gap = daysBetween(prevDate, today)
  if (!prevDate) return { delta: 1, reset: false }
  if (gap === 0) return { delta: 0, reset: false }
  if (gap === 1) return { delta: 1, reset: false }
  if (gap <= STREAK_GRACE_DAYS + 1) return { delta: 1, reset: false }
  return { delta: 1, reset: true }
}

async function upsertGamification(userId, next) {
  const payload = {
    user_id: userId,
    xp: next.xp,
    level: next.level,
    current_streak: next.current_streak,
    longest_streak: next.longest_streak,
    last_completion_date: next.last_completion_date,
    current_week_streak: next.current_week_streak || 0,
    longest_week_streak: next.longest_week_streak || 0,
    last_week_active: next.last_week_active || null,
    current_month_streak: next.current_month_streak || 0,
    longest_month_streak: next.longest_month_streak || 0,
    last_month_active: next.last_month_active || null,
    updated_at: new Date().toISOString()
  }
  const { error } = await supabase
    .from('user_gamification')
    .upsert(payload, { onConflict: 'user_id' })
  if (error) {
    console.warn('[Velion] upsertGamification error:', error.message)
  }
  writeCache(userId, next)
  return next
}

async function unlockBadgesIfNeeded(userId, candidates) {
  // candidates: [{ id, context }]
  if (!userId || candidates.length === 0) return []
  const { data: existing } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
    .in('badge_id', candidates.map((c) => c.id))
  const known = new Set((existing || []).map((r) => r.badge_id))
  const fresh = candidates.filter((c) => !known.has(c.id))
  if (fresh.length === 0) return []
  const rows = fresh.map((c) => ({
    user_id: userId,
    badge_id: c.id,
    context: c.context || {}
  }))
  const { error } = await supabase.from('user_badges').insert(rows)
  if (error) {
    console.warn('[Velion] unlockBadgesIfNeeded error:', error.message)
    return []
  }
  return fresh.map((c) => BADGES_BY_ID[c.id]).filter(Boolean)
}

function moduleForDay(dayNumber) {
  return MODULES.find((m) => dayNumber >= m.range[0] && dayNumber <= m.range[1]) || null
}

export async function awardForDayCompletion(userId, dayNumber, context = {}) {
  if (!userId || !dayNumber) {
    return { xpGained: 0, totalXp: 0, level: 1, leveledUp: false, newBadges: [] }
  }

  const prev = await fetchGamification(userId)
  const today = todayKey()
  const { delta, reset } = recomputeStreak(prev.last_completion_date, today)
  const nextStreak = reset ? 1 : (prev.current_streak || 0) + delta
  const longest = Math.max(prev.longest_streak || 0, nextStreak)

  // Base reward for the day completion
  let xpGained = XP_REWARDS.dayCompleted

  // Streak bonuses fire on the day the user CROSSES the threshold
  if (nextStreak === 7 && (prev.current_streak || 0) < 7) {
    xpGained += XP_REWARDS.weekStreakBonus
  } else if (nextStreak === 30 && (prev.current_streak || 0) < 30) {
    xpGained += XP_REWARDS.monthStreakBonus
  }

  // Module-completion bonus on the final day of a module
  const module = moduleForDay(dayNumber)
  if (module && dayNumber === module.range[1]) {
    xpGained += XP_REWARDS.moduleCompleted
  }

  const totalXp = (prev.xp || 0) + xpGained
  const prevLevel = prev.level || levelForXp(prev.xp || 0)
  const newLevel = levelForXp(totalXp)
  const leveledUp = newLevel > prevLevel

  // Weekly + monthly streaks (independent of daily): increment when
  // we cross into a new ISO week / calendar month; reset to 1 when we
  // skip a week or month.
  const thisWeek = isoWeekKey()
  const thisMonth = monthKey()
  let weekStreak = prev.current_week_streak || 0
  let weekLongest = prev.longest_week_streak || 0
  let lastWeek = prev.last_week_active || null
  if (lastWeek !== thisWeek) {
    if (lastWeek && nextWeekKey(lastWeek) === thisWeek) {
      weekStreak = weekStreak + 1
    } else {
      weekStreak = 1
    }
    weekLongest = Math.max(weekLongest, weekStreak)
    lastWeek = thisWeek
  } else if (weekStreak === 0) {
    weekStreak = 1
    weekLongest = Math.max(weekLongest, 1)
  }

  let monthStreak = prev.current_month_streak || 0
  let monthLongest = prev.longest_month_streak || 0
  let lastMonth = prev.last_month_active || null
  if (lastMonth !== thisMonth) {
    if (lastMonth && nextMonthKey(lastMonth) === thisMonth) {
      monthStreak = monthStreak + 1
    } else {
      monthStreak = 1
    }
    monthLongest = Math.max(monthLongest, monthStreak)
    lastMonth = thisMonth
  } else if (monthStreak === 0) {
    monthStreak = 1
    monthLongest = Math.max(monthLongest, 1)
  }

  const next = {
    xp: totalXp,
    level: newLevel,
    current_streak: nextStreak,
    longest_streak: longest,
    last_completion_date: today,
    current_week_streak: weekStreak,
    longest_week_streak: weekLongest,
    last_week_active: lastWeek,
    current_month_streak: monthStreak,
    longest_month_streak: monthLongest,
    last_month_active: lastMonth
  }
  await upsertGamification(userId, next)

  // Badge checks. Each candidate carries the runtime context that
  // unlocked it; the criteria are evaluated here so the catalog stays
  // declarative.
  const completedDays = Number(context.completedCount || 0)
  const totalCompleted = Math.max(completedDays, 1)
  const candidates = []

  if (dayNumber === 1) {
    candidates.push({ id: 'first_day', context: { dayNumber } })
  }
  if (nextStreak >= 7) candidates.push({ id: 'week_streak', context: { streak: nextStreak } })
  if (nextStreak >= 30) candidates.push({ id: 'month_streak', context: { streak: nextStreak } })
  if (module && dayNumber === module.range[1]) {
    candidates.push({ id: 'module_complete', context: { moduleId: module.id, dayNumber } })
  }
  if (totalCompleted >= Math.floor(TOTAL_DAYS / 2)) {
    candidates.push({ id: 'halfway', context: { completedDays: totalCompleted } })
  }
  if (totalCompleted >= TOTAL_DAYS) {
    candidates.push({ id: 'full_protocol', context: { completedDays: totalCompleted } })
  }
  if (newLevel >= 5) candidates.push({ id: 'level_5', context: { level: newLevel } })
  if (newLevel >= 10) candidates.push({ id: 'level_10', context: { level: newLevel } })

  // SECRET BADGES — time-of-day + recovery + perfect-week checks
  const now = new Date()
  const hour = now.getHours()
  if (hour < 8) {
    candidates.push({ id: 'sunrise', context: { hour } })
  }
  if (hour >= 23) {
    candidates.push({ id: 'night_owl', context: { hour } })
  }
  // comeback: previous lastCompletion was 8+ days ago AND now we have
  // a fresh streak count of 1 (reset path)
  if (prev.last_completion_date) {
    const gap = daysBetween(prev.last_completion_date, today)
    if (gap >= 8 && nextStreak === 1) {
      candidates.push({ id: 'comeback', context: { gap } })
    }
  }
  // perfect_week: this week's count of days completed via context
  // weeklyCompletedCount (caller passes when known). If >= 7 unlock.
  if (Number(context.weeklyCompletedCount || 0) >= 7) {
    candidates.push({ id: 'perfect_week', context: { weeklyCompletedCount: context.weeklyCompletedCount } })
  }

  const newBadges = await unlockBadgesIfNeeded(userId, candidates)

  return {
    xpGained,
    totalXp,
    level: newLevel,
    leveledUp,
    streak: nextStreak,
    newBadges
  }
}

// One-off awards (separate from day completion) ─────────────────────

export async function awardInitialQuiz(userId, { score, tier } = {}) {
  if (!userId) return null
  const prev = await fetchGamification(userId)
  const xpGained = XP_REWARDS.initialQuiz
  const totalXp = (prev.xp || 0) + xpGained
  const newLevel = levelForXp(totalXp)
  await upsertGamification(userId, {
    ...prev,
    xp: totalXp,
    level: newLevel
  })
  const candidates = [{ id: 'quiz_taken', context: { score, tier } }]
  if (newLevel >= 5) candidates.push({ id: 'level_5', context: { level: newLevel } })
  if (newLevel >= 10) candidates.push({ id: 'level_10', context: { level: newLevel } })
  const newBadges = await unlockBadgesIfNeeded(userId, candidates)
  return { xpGained, totalXp, level: newLevel, newBadges }
}

export async function awardQuizImprovement(userId, { initialScore, finalScore } = {}) {
  if (!userId || initialScore == null || finalScore == null) return null
  const delta = finalScore - initialScore
  if (delta < 20) return null
  const newBadges = await unlockBadgesIfNeeded(userId, [
    { id: 'quiz_improved_20', context: { initialScore, finalScore, delta } }
  ])
  return { newBadges }
}

// Breath-session counter — bumps a localStorage tally, persists every
// session as an analytics event in user_events, and unlocks the
// secret 'breath_master' badge on the 25th completed session.
export async function awardBreathSession(userId) {
  if (!userId) return null
  const key = `velion_breath_count_${userId}`
  let count = 0
  try {
    if (typeof window !== 'undefined') {
      count = parseInt(window.localStorage.getItem(key) || '0', 10) || 0
      count += 1
      window.localStorage.setItem(key, String(count))
    }
  } catch {}

  if (count < 25) return { count, newBadges: [] }

  const newBadges = await unlockBadgesIfNeeded(userId, [
    { id: 'breath_master', context: { sessions: count } }
  ])
  return { count, newBadges }
}
