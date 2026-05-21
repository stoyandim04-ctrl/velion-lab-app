// Per-user scoped course progress.
// Every function REQUIRES a userId. If userId is falsy, reads return defaults
// and writes are no-ops (so we never leak data between accounts).

function storageKey(userId) {
  return `velion_course_progress_${userId}`
}

function read(userId) {
  if (!userId || typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function write(userId, state) {
  if (!userId || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(state))
  } catch {}
}

export function getDayProgress(userId, dayNumber) {
  const state = read(userId)
  const day = state[`day${dayNumber}`] || {}
  return {
    tracker: day.tracker || {},
    journal: day.journal || '',
    completed: day.completed === true
  }
}

export function setTrackerItem(userId, dayNumber, itemId, value) {
  if (!userId) return
  const state = read(userId)
  const key = `day${dayNumber}`
  state[key] = state[key] || {}
  state[key].tracker = { ...(state[key].tracker || {}), [itemId]: value }
  write(userId, state)
}

export function setJournal(userId, dayNumber, text) {
  if (!userId) return
  const state = read(userId)
  const key = `day${dayNumber}`
  state[key] = state[key] || {}
  state[key].journal = text
  write(userId, state)
}

export function markDayCompleted(userId, dayNumber) {
  if (!userId) return
  const state = read(userId)
  const key = `day${dayNumber}`
  state[key] = state[key] || {}
  state[key].completed = true
  state[key].completedAt = new Date().toISOString()
  write(userId, state)
}

const ALWAYS_UNLOCKED = new Set([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45])

export function isDayUnlocked(userId, dayNumber) {
  if (dayNumber <= 1) return true
  if (ALWAYS_UNLOCKED.has(dayNumber)) return true
  const prev = getDayProgress(userId, dayNumber - 1)
  return prev.completed
}

export function replaceAllProgress(userId, state) {
  if (!userId) return
  write(userId, state || {})
}

export function clearProgress(userId) {
  if (!userId || typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(storageKey(userId))
  } catch {}
}
