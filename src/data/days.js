import { DAY_1 } from './day1.js'
import { DAY_2 } from './day2.js'
import { DAY_3 } from './day3.js'
import { DAY_4 } from './day4.js'
import { DAY_5 } from './day5.js'
import { DAY_6 } from './day6.js'
import { DAY_7 } from './day7.js'
import { DAY_21 } from './day21.js'
import { DAY_22 } from './day22.js'
import { DAY_23 } from './day23.js'
import { DAY_24 } from './day24.js'
import { DAY_25 } from './day25.js'

export const DAYS = {
  1: DAY_1,
  2: DAY_2,
  3: DAY_3,
  4: DAY_4,
  5: DAY_5,
  6: DAY_6,
  7: DAY_7,
  21: DAY_21,
  22: DAY_22,
  23: DAY_23,
  24: DAY_24,
  25: DAY_25
}

export const ALWAYS_UNLOCKED_DAYS = new Set([21, 22, 23, 24, 25])

export const AVAILABLE_DAYS = Object.keys(DAYS).map(Number).sort((a, b) => a - b)
export const MAX_AVAILABLE_DAY = Math.max(...AVAILABLE_DAYS)

export function getDayData(dayNumber) {
  return DAYS[dayNumber] || null
}

export function getDayRoute(dayNumber) {
  if (!DAYS[dayNumber]) return null
  return `/course/day-${dayNumber}`
}

export function getNextDayRoute(currentDay) {
  return getDayRoute(currentDay + 1)
}
