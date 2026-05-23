import { DAY_1 } from './day1.js'
import { DAY_2 } from './day2.js'
import { DAY_3 } from './day3.js'
import { DAY_4 } from './day4.js'
import { DAY_5 } from './day5.js'
import { DAY_6 } from './day6.js'
import { DAY_7 } from './day7.js'
import { DAY_8 } from './day8.js'
import { DAY_9 } from './day9.js'
import { DAY_10 } from './day10.js'
import { DAY_11 } from './day11.js'
import { DAY_12 } from './day12.js'
import { DAY_13 } from './day13.js'
import { DAY_14 } from './day14.js'
import { DAY_15 } from './day15.js'
import { DAY_16 } from './day16.js'
import { DAY_17 } from './day17.js'
import { DAY_18 } from './day18.js'
import { DAY_19 } from './day19.js'
import { DAY_20 } from './day20.js'
import { DAY_21 } from './day21.js'
import { DAY_22 } from './day22.js'
import { DAY_23 } from './day23.js'
import { DAY_24 } from './day24.js'
import { DAY_25 } from './day25.js'
import { DAY_26 } from './day26.js'
import { DAY_27 } from './day27.js'
import { DAY_28 } from './day28.js'
import { DAY_29 } from './day29.js'
import { DAY_30 } from './day30.js'
import { DAY_31 } from './day31.js'
import { DAY_32 } from './day32.js'
import { DAY_33 } from './day33.js'
import { DAY_34 } from './day34.js'
import { DAY_35 } from './day35.js'
import { DAY_36 } from './day36.js'
import { DAY_37 } from './day37.js'
import { DAY_38 } from './day38.js'
import { DAY_39 } from './day39.js'
import { DAY_40 } from './day40.js'
import { DAY_41 } from './day41.js'
import { DAY_42 } from './day42.js'
import { DAY_43 } from './day43.js'
import { DAY_44 } from './day44.js'
import { DAY_45 } from './day45.js'
import { DAY_46 } from './day46.js'
import { DAY_47 } from './day47.js'
import { DAY_48 } from './day48.js'
import { DAY_49 } from './day49.js'
import { DAY_50 } from './day50.js'
import { DAY_51 } from './day51.js'
import { DAY_52 } from './day52.js'
import { DAY_53 } from './day53.js'
import { DAY_54 } from './day54.js'
import { DAY_55 } from './day55.js'
import { DAY_56 } from './day56.js'
import { DAY_57 } from './day57.js'
import { DAY_58 } from './day58.js'
import { DAY_59 } from './day59.js'
import { DAY_60 } from './day60.js'

export const DAYS = {
  1: DAY_1,
  2: DAY_2,
  3: DAY_3,
  4: DAY_4,
  5: DAY_5,
  6: DAY_6,
  7: DAY_7,
  8: DAY_8,
  9: DAY_9,
  10: DAY_10,
  11: DAY_11,
  12: DAY_12,
  13: DAY_13,
  14: DAY_14,
  15: DAY_15,
  16: DAY_16,
  17: DAY_17,
  18: DAY_18,
  19: DAY_19,
  20: DAY_20,
  21: DAY_21,
  22: DAY_22,
  23: DAY_23,
  24: DAY_24,
  25: DAY_25,
  26: DAY_26,
  27: DAY_27,
  28: DAY_28,
  29: DAY_29,
  30: DAY_30,
  31: DAY_31,
  32: DAY_32,
  33: DAY_33,
  34: DAY_34,
  35: DAY_35,
  36: DAY_36,
  37: DAY_37,
  38: DAY_38,
  39: DAY_39,
  40: DAY_40,
  41: DAY_41,
  42: DAY_42,
  43: DAY_43,
  44: DAY_44,
  45: DAY_45,
  46: DAY_46,
  47: DAY_47,
  48: DAY_48,
  49: DAY_49,
  50: DAY_50,
  51: DAY_51,
  52: DAY_52,
  53: DAY_53,
  54: DAY_54,
  55: DAY_55,
  56: DAY_56,
  57: DAY_57,
  58: DAY_58,
  59: DAY_59,
  60: DAY_60
}

// Unlock policy lives in src/data/course.js + src/lib/courseProgress.js:
// days 1-7 always unlocked, day 8+ unlocked only if the previous day is completed.
// The legacy ALWAYS_UNLOCKED_DAYS set was dead code (not imported anywhere).

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
