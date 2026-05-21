const STORAGE_KEY = 'velion_course_progress'

function read() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function write(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function getDayProgress(dayNumber) {
  const state = read()
  const day = state[`day${dayNumber}`] || {}
  return {
    tracker: day.tracker || {},
    journal: day.journal || '',
    completed: day.completed === true
  }
}

export function setTrackerItem(dayNumber, itemId, value) {
  const state = read()
  const key = `day${dayNumber}`
  state[key] = state[key] || {}
  state[key].tracker = { ...(state[key].tracker || {}), [itemId]: value }
  write(state)
}

export function setJournal(dayNumber, text) {
  const state = read()
  const key = `day${dayNumber}`
  state[key] = state[key] || {}
  state[key].journal = text
  write(state)
}

export function markDayCompleted(dayNumber) {
  const state = read()
  const key = `day${dayNumber}`
  state[key] = state[key] || {}
  state[key].completed = true
  state[key].completedAt = new Date().toISOString()
  write(state)
}

const ALWAYS_UNLOCKED = new Set([8, 9, 10, 21, 22, 23, 24, 25])

export function isDayUnlocked(dayNumber) {
  if (dayNumber <= 1) return true
  if (ALWAYS_UNLOCKED.has(dayNumber)) return true
  const prev = getDayProgress(dayNumber - 1)
  return prev.completed
}
