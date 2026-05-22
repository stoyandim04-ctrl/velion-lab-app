export const ROUTES = {
  welcome: '/',
  auth: '/auth',
  goals: '/goals',
  notAlone: '/not-alone',
  quiz: '/quiz/:step',
  education: '/education',
  future: '/future',
  building: '/building',
  result: '/result',
  social: '/social',
  paywall: '/paywall',
  success: '/success',
  dailyOnboarding: '/daily-onboarding',
  dashboard: '/dashboard',
  day: '/course/day-:day',
  day1: '/course/day-1',
  days: '/days',
  privacy: '/privacy',
  terms: '/terms'
}

export const ONBOARDING_FLOW = [
  '/',
  '/goals',
  '/not-alone',
  '/quiz/1',
  '/quiz/2',
  '/quiz/3',
  '/quiz/4',
  '/quiz/5',
  '/quiz/6',
  '/quiz/7',
  '/quiz/8',
  '/quiz/9',
  '/quiz/10',
  '/quiz/11',
  '/quiz/12',
  '/education',
  '/future',
  '/building',
  '/result',
  '/social',
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
