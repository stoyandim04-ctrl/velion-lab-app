export const ROUTES = {
  welcome: '/',
  landing: '/',
  auth: '/auth',
  goals: '/goals',
  notAlone: '/not-alone',
  quiz: '/quiz/:step',
  breather: '/quiz/breather/:id',
  results: '/results',
  education: '/education',
  future: '/future',
  building: '/building',
  result: '/result',
  paywall: '/paywall',
  success: '/success',
  dailyOnboarding: '/daily-onboarding',
  dashboard: '/dashboard',
  stats: '/stats',
  day: '/course/day-:day',
  day1: '/course/day-1',
  days: '/days',
  privacy: '/privacy',
  terms: '/terms',
  about: '/about'
}

// New funnel: landing → quiz (5 questions with 3 breathers) → results → auth → paywall → dashboard
export const ONBOARDING_FLOW = [
  '/',
  '/quiz/1',
  '/quiz/breather/1',
  '/quiz/2',
  '/quiz/3',
  '/quiz/breather/2',
  '/quiz/4',
  '/quiz/5',
  '/quiz/breather/3',
  '/results',
  '/auth',
  '/paywall',
  '/dashboard'
]

export function nextRoute(current) {
  const i = ONBOARDING_FLOW.indexOf(current)
  if (i === -1 || i === ONBOARDING_FLOW.length - 1) return null
  return ONBOARDING_FLOW[i + 1]
}

export function prevRoute(current) {
  const i = ONBOARDING_FLOW.indexOf(current)
  if (i <= 0) return null
  return ONBOARDING_FLOW[i - 1]
}
