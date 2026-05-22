const ONE_DAY = 24 * 60 * 60 * 1000
const GRACE_DAYS = 1
const MAX_EVENTS = 120

function key(userId) {
  return `velion_engagement_${userId}`
}

function todayKey(date = new Date()) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return local.toISOString().slice(0, 10)
}

function daysBetween(a, b) {
  if (!a || !b) return null
  const start = new Date(`${a}T00:00:00`)
  const end = new Date(`${b}T00:00:00`)
  return Math.round((end - start) / ONE_DAY)
}

function nowEvent(type, payload = {}) {
  return { type, payload, at: new Date().toISOString() }
}

function emptyEngagement() {
  return {
    onboardingCompleted: false,
    onboardingAnswers: null,
    onboardingCompletedAt: null,
    lastOpenedDay: 1,
    lastOpenedAt: null,
    streak: {
      count: 0,
      best: 0,
      lastCompletedDate: null,
      missedDays: 0
    },
    analytics: []
  }
}

function normalize(data) {
  const base = emptyEngagement()
  if (!data || typeof data !== 'object') return base
  return {
    ...base,
    ...data,
    streak: { ...base.streak, ...(data.streak || {}) },
    analytics: Array.isArray(data.analytics) ? data.analytics.slice(-MAX_EVENTS) : []
  }
}

export function getCachedEngagement(userId) {
  if (!userId || typeof window === 'undefined') return emptyEngagement()
  try {
    const raw = window.localStorage.getItem(key(userId))
    return normalize(raw ? JSON.parse(raw) : null)
  } catch {
    return emptyEngagement()
  }
}

export function replaceEngagement(userId, data) {
  if (!userId || typeof window === 'undefined') return emptyEngagement()
  const next = normalize(data)
  try {
    window.localStorage.setItem(key(userId), JSON.stringify(next))
  } catch {}
  return next
}

export function updateEngagement(userId, updater) {
  if (!userId) return emptyEngagement()
  const current = getCachedEngagement(userId)
  const next = normalize(typeof updater === 'function' ? updater(current) : updater)
  return replaceEngagement(userId, next)
}

export function addAnalyticsEvent(userId, type, payload = {}) {
  if (!userId) return emptyEngagement()
  return updateEngagement(userId, (current) => ({
    ...current,
    analytics: [...current.analytics, nowEvent(type, payload)].slice(-MAX_EVENTS)
  }))
}

export function recordOpenedDay(userId, dayNumber) {
  if (!userId || !dayNumber) return emptyEngagement()
  return updateEngagement(userId, (current) => ({
    ...current,
    lastOpenedDay: dayNumber,
    lastOpenedAt: new Date().toISOString(),
    analytics: [...current.analytics, nowEvent('day_opened', { dayNumber })].slice(-MAX_EVENTS)
  }))
}

export function completePremiumOnboarding(userId, answers) {
  return updateEngagement(userId, (current) => ({
    ...current,
    onboardingCompleted: true,
    onboardingAnswers: answers,
    onboardingCompletedAt: new Date().toISOString(),
    analytics: [...current.analytics, nowEvent('onboarding_completed', answers)].slice(-MAX_EVENTS)
  }))
}

export function recordDayCompletion(userId, dayNumber) {
  if (!userId || !dayNumber) return emptyEngagement()
  const current = getCachedEngagement(userId)
  const today = todayKey()
  const last = current.streak.lastCompletedDate
  const gap = daysBetween(last, today)
  let count = current.streak.count || 0
  let missedDays = 0

  if (!last) {
    count = 1
  } else if (gap === 0) {
    count = Math.max(1, count)
  } else if (gap === 1) {
    count += 1
  } else if (gap <= GRACE_DAYS + 1) {
    count += 1
    missedDays = gap - 1
  } else {
    count = 1
    missedDays = gap - 1
  }

  return updateEngagement(userId, (state) => ({
    ...state,
    streak: {
      count,
      best: Math.max(state.streak.best || 0, count),
      lastCompletedDate: today,
      missedDays
    },
    analytics: [...state.analytics, nowEvent('day_completed', { dayNumber, streak: count })].slice(-MAX_EVENTS)
  }))
}

export function getStreakMessage(streakCount = 0) {
  if (streakCount <= 0) return 'Първата серия започва днес.'
  if (streakCount === 1) return 'Добър старт. Върни се утре и го заключи.'
  if (streakCount < 4) return 'Инерцията вече работи в твоя полза.'
  if (streakCount < 8) return 'Това вече е ритъм, не случайност.'
  return 'Серията ти изгражда идентичност.'
}

export function clearEngagement(userId) {
  if (!userId || typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key(userId))
  } catch {}
}
