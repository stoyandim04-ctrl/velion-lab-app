import { DAYS, AVAILABLE_DAYS } from './days.js'

export const MODULES = [
  { id: 'I', name: 'ОСЪЗНАТОСТ', range: [1, 7], color: 'accent' },
  { id: 'II', name: 'КОНТРОЛ', range: [8, 21], color: 'accent' },
  { id: 'III', name: 'ИЗДРЪЖЛИВОСТ', range: [22, 42], color: 'accent' },
  { id: 'IV', name: 'ПРИСЪСТВИЕ', range: [43, 60], color: 'accent' }
]

const STATIC_NAMED = {
  0: 'Diagnostic Onboarding'
}

export function buildDays(progressFn) {
  const days = []
  for (let i = 0; i <= 60; i++) {
    const data = DAYS[i]
    const title = data?.title || STATIC_NAMED[i] || `Ден ${i}`
    const named = Boolean(data || STATIC_NAMED[i])
    const hasContent = i === 0 || AVAILABLE_DAYS.includes(i)

    let status = 'locked'
    if (i === 0) {
      status = 'completed'
    } else if (hasContent) {
      const completed = progressFn ? progressFn(i)?.completed : false
      const prevCompleted = i === 1 ? true : (progressFn ? progressFn(i - 1)?.completed : false)
      if (completed) status = 'completed'
      else if (prevCompleted) status = 'active'
      else status = 'locked'
    }

    days.push({ day: i, title, named, status, hasContent })
  }
  return days
}

export const TOTAL_DAYS = 60
