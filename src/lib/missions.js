// Weekly mission tracking. Each user gets 3 missions issued on the
// first request of the calendar week. Progress increments come from
// existing signals (day completion, breath session, journal entry).
// Completing a mission awards XP and marks completed_at.

import { supabase } from './supabaseClient.js'
import { WEEKLY_MISSIONS } from '../data/missions.js'
import { fetchGamification } from './gamification.js'

function startOfWeekISO(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  // ISO week: Monday is 1
  const dow = d.getDay() === 0 ? 7 : d.getDay()
  d.setDate(d.getDate() - (dow - 1))
  return d.toISOString().slice(0, 10)
}

export async function ensureWeeklyMissions(userId) {
  if (!userId) return []
  const weekStart = startOfWeekISO()
  const { data: existing } = await supabase
    .from('user_missions')
    .select('id, mission_id, progress, target, completed_at, reward_xp')
    .eq('user_id', userId)
    .eq('week_start', weekStart)

  const have = new Set((existing || []).map((m) => m.mission_id))
  const toInsert = WEEKLY_MISSIONS.filter((m) => !have.has(m.id)).map((m) => ({
    user_id: userId,
    mission_id: m.id,
    week_start: weekStart,
    progress: 0,
    target: m.target,
    reward_xp: m.reward_xp
  }))

  if (toInsert.length === 0) return existing || []

  const { data: inserted } = await supabase
    .from('user_missions')
    .insert(toInsert)
    .select()

  return [...(existing || []), ...(inserted || [])]
}

export async function fetchActiveMissions(userId) {
  if (!userId) return []
  const weekStart = startOfWeekISO()
  const { data } = await supabase
    .from('user_missions')
    .select('id, mission_id, progress, target, completed_at, reward_xp')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
  return data || []
}

// Increment progress on every mission whose 'track' field matches the
// given signal. Awards XP + marks completed if the mission crosses the
// target. Returns the list of newly completed mission ids.
export async function recordMissionSignal(userId, signal, delta = 1) {
  if (!userId || !signal) return []
  const weekStart = startOfWeekISO()
  const matching = WEEKLY_MISSIONS.filter((m) => m.track === signal).map((m) => m.id)
  if (matching.length === 0) return []

  const { data: rows } = await supabase
    .from('user_missions')
    .select('id, mission_id, progress, target, completed_at, reward_xp')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .in('mission_id', matching)

  const completed = []

  for (const row of rows || []) {
    if (row.completed_at) continue
    const nextProgress = Math.min(row.target, (row.progress || 0) + delta)
    const justFinished = nextProgress >= row.target
    await supabase
      .from('user_missions')
      .update({
        progress: nextProgress,
        completed_at: justFinished ? new Date().toISOString() : null
      })
      .eq('id', row.id)

    if (justFinished) {
      completed.push(row.mission_id)
      // Award the XP through the gamification table directly. We don't
      // unlock badges here (missions have their own XP pool).
      try {
        const current = await fetchGamification(userId)
        await supabase
          .from('user_gamification')
          .upsert(
            {
              user_id: userId,
              xp: (current.xp || 0) + (row.reward_xp || 0),
              level: current.level || 1,
              current_streak: current.current_streak || 0,
              longest_streak: current.longest_streak || 0,
              last_completion_date: current.last_completion_date || null,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
          )
      } catch (e) {
        console.warn('[Velion] mission XP award failed:', e?.message)
      }
    }
  }

  return completed
}
