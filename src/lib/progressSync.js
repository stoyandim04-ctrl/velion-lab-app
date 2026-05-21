import { supabase } from './supabaseClient.js'

const LOCAL_KEY = 'velion_course_progress'

function readLocal() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLocal(state) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(state))
  } catch {}
}

function progressFromRow(row) {
  if (!row) return null
  const state = {}
  const lessons = row.completed_lessons || {}
  for (const dayNum of row.completed_days || []) {
    const day = lessons[dayNum] || lessons[`day${dayNum}`] || {}
    state[`day${dayNum}`] = {
      tracker: day.tracker || {},
      journal: day.journal || '',
      completed: true,
      completedAt: day.completedAt || null
    }
  }
  // Also include in-progress days from lessons jsonb
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
    completedDays: row.completed_days || []
  }
}

function rowFromLocal(local) {
  const completedDays = []
  const completedLessons = {}
  let maxDay = 1

  for (const [key, value] of Object.entries(local)) {
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

  completedDays.sort((a, b) => a - b)
  return {
    current_day: maxDay,
    last_opened_day: maxDay,
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

export async function pullToLocal(userId) {
  const remote = await fetchRemoteProgress(userId)
  if (!remote) return null
  // Merge: remote completion is source of truth, but keep local in-progress data if richer
  const local = readLocal()
  const merged = { ...local, ...remote.state }
  writeLocal(merged)
  return remote
}

export async function pushFromLocal(userId) {
  if (!userId) return
  const local = readLocal()
  const row = rowFromLocal(local)
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
  const local = readLocal()
  local[`day${dayNumber}`] = {
    ...(local[`day${dayNumber}`] || {}),
    completed: true,
    completedAt: new Date().toISOString()
  }
  writeLocal(local)
  await pushFromLocal(userId)
}

export async function syncDayState(userId, dayNumber, patch) {
  if (!userId) return
  const local = readLocal()
  local[`day${dayNumber}`] = { ...(local[`day${dayNumber}`] || {}), ...patch }
  writeLocal(local)
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

export function clearLocalProgress() {
  try {
    window.localStorage.removeItem(LOCAL_KEY)
  } catch {}
}
