import { supabase } from './supabaseClient.js'
import { replaceAllProgress } from './courseProgress.js'

// Per-user scoped progress sync between Supabase user_progress and localStorage.
// All Supabase queries filter by user_id. Local cache key is scoped by user id.

function localKey(userId) {
  return `velion_course_progress_${userId}`
}

function engagementKey(userId) {
  return `velion_engagement_${userId}`
}

function readLocal(userId) {
  if (!userId || typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(localKey(userId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function readEngagementLocal(userId) {
  if (!userId || typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(engagementKey(userId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeEngagementLocal(userId, state) {
  if (!userId || typeof window === 'undefined' || !state) return
  try {
    window.localStorage.setItem(engagementKey(userId), JSON.stringify(state))
  } catch {}
}

function writeLocal(userId, state) {
  if (!userId || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(localKey(userId), JSON.stringify(state))
  } catch {}
}

function progressFromRow(row) {
  if (!row) return null
  const state = {}
  const lessons = row.completed_lessons || {}
  for (const dayNum of row.completed_days || []) {
    const day = lessons[`day${dayNum}`] || lessons[dayNum] || {}
    state[`day${dayNum}`] = {
      tracker: day.tracker || {},
      journal: day.journal || '',
      completed: true,
      completedAt: day.completedAt || null
    }
  }
  for (const key of Object.keys(lessons)) {
    if (!key.startsWith('day')) continue
    if (state[key]) continue
    const day = lessons[key]
    state[key] = {
      tracker: day.tracker || {},
      journal: day.journal || '',
      completed: false
    }
  }
  return {
    state,
    currentDay: row.current_day || 1,
    lastOpenedDay: row.last_opened_day || 1,
    streakCount: row.streak_count || 0,
    completedDays: row.completed_days || [],
    engagement: lessons.__engagement || null
  }
}

function rowFromLocal(userId, local) {
  const completedDays = []
  const completedLessons = {}
  let maxDay = 1
  const engagement = readEngagementLocal(userId)

  for (const [key, value] of Object.entries(local || {})) {
    const match = /^day(\d+)$/.exec(key)
    if (!match) continue
    const dayNum = parseInt(match[1], 10)
    if (value?.completed) {
      completedDays.push(dayNum)
      if (dayNum + 1 > maxDay && dayNum + 1 <= 60) maxDay = dayNum + 1
    }
    completedLessons[`day${dayNum}`] = {
      tracker: value?.tracker || {},
      journal: value?.journal || '',
      completed: Boolean(value?.completed),
      completedAt: value?.completedAt || null
    }
  }

  if (engagement && Object.keys(engagement).length > 0) {
    completedLessons.__engagement = {
      ...engagement,
      syncedAt: new Date().toISOString()
    }
  }

  const lastOpenedDay = Math.min(
    60,
    Math.max(1, Number(engagement?.lastOpenedDay || maxDay || 1))
  )

  completedDays.sort((a, b) => a - b)
  return {
    current_day: maxDay,
    last_opened_day: lastOpenedDay,
    streak_count: engagement?.streak?.count || 0,
    completed_days: completedDays,
    completed_lessons: completedLessons,
    updated_at: new Date().toISOString()
  }
}

export async function fetchRemoteProgress(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[Velion] fetchRemoteProgress error:', error.message)
    return null
  }
  return progressFromRow(data)
}

// Pull remote into local cache for this user. Overwrites the local cache for
// the same userId — does NOT merge with another user's data.
export async function pullToLocal(userId) {
  if (!userId) return null
  const remote = await fetchRemoteProgress(userId)
  if (!remote) {
    // No remote row → ensure local cache is empty so we don't leak old data.
    replaceAllProgress(userId, {})
    return null
  }
  replaceAllProgress(userId, remote.state)
  if (remote.engagement) writeEngagementLocal(userId, remote.engagement)
  return remote
}

export async function pushFromLocal(userId) {
  if (!userId) return
  const local = readLocal(userId)
  const row = rowFromLocal(userId, local)
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      { user_id: userId, ...row, last_active_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  if (error) console.warn('[Velion] pushFromLocal error:', error.message)
}

export async function syncDayCompletion(userId, dayNumber) {
  if (!userId) return
  const local = readLocal(userId)
  local[`day${dayNumber}`] = {
    ...(local[`day${dayNumber}`] || {}),
    completed: true,
    completedAt: new Date().toISOString()
  }
  writeLocal(userId, local)
  await pushFromLocal(userId)
}

export async function syncLastOpened(userId, dayNumber) {
  if (!userId) return
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      { user_id: userId, last_opened_day: dayNumber, last_active_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  if (error) console.warn('[Velion] syncLastOpened error:', error.message)
}

export function clearLocalProgress(userId) {
  if (!userId || typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(localKey(userId))
    window.localStorage.removeItem(engagementKey(userId))
  } catch {}
}
