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

export function getAllProgress(userId) {
  return read(userId)
}

export function getCompletedDayNumbers(userId) {
  const state = read(userId)
  return Object.entries(state)
    .map(([key, value]) => {
      const match = /^day(\d+)$/.exec(key)
      return match && value?.completed ? parseInt(match[1], 10) : null
    })
    .filter((day) => day && day > 0)
    .sort((a, b) => a - b)
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

export function isDayUnlocked(userId, dayNumber) {
  if (dayNumber <= 1) return true
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
