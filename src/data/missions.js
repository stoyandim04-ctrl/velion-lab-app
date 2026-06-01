// Weekly mission catalog. Issued automatically on the first login of
// each calendar week. Each mission has a stable id, a target (e.g.
// "5 days"), and an XP reward on completion. The progress is tracked
// against the same engagement / gamification signals we already log.
//
// `track` is the metric to count. The missions lib increments progress
// when the matching event fires (e.g. a day completion bumps every
// active 'days_completed' mission for the week).

export const WEEKLY_MISSIONS = [
  {
    id: 'consistency_5',
    title: 'Постоянство',
    description: 'Завърши 5 дни от протокола през тази седмица.',
    icon: 'calendar-check',
    target: 5,
    reward_xp: 75,
    track: 'days_completed'
  },
  {
    id: 'breath_3',
    title: 'Дъх под контрол',
    description: '3 завършени сесии дишане през седмицата.',
    icon: 'wind',
    target: 3,
    reward_xp: 50,
    track: 'breath_sessions'
  },
  {
    id: 'journal_2',
    title: 'Журнал',
    description: 'Попълни 2 дневни журнали.',
    icon: 'pen-line',
    target: 2,
    reward_xp: 40,
    track: 'journal_entries'
  }
]

export const MISSIONS_BY_ID = Object.fromEntries(WEEKLY_MISSIONS.map((m) => [m.id, m]))
