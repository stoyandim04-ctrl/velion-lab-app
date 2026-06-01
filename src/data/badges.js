// Achievement badge catalog.
// Each badge has a deterministic id (used as the row key in
// public.user_badges) plus display copy and an icon hint that the UI
// can resolve to a lucide-react icon. The criteria field is purely
// descriptive — actual unlock checks live in src/lib/gamification.js
// where they have access to the runtime state (completed days, scores,
// streaks, level).

export const BADGES = [
  {
    id: 'first_day',
    title: 'Първа крачка',
    description: 'Завърши Ден 1 — началото е винаги най-трудно.',
    icon: 'flag',
    rarity: 'common',
    xpReward: 25
  },
  {
    id: 'week_streak',
    title: 'Седмичен щит',
    description: '7 поредни дни. Това вече не е случайно.',
    icon: 'shield',
    rarity: 'common',
    xpReward: 75
  },
  {
    id: 'month_streak',
    title: 'Месечник',
    description: '30 поредни дни. Идентичността се променя.',
    icon: 'flame',
    rarity: 'rare',
    xpReward: 200
  },
  {
    id: 'module_complete',
    title: 'Завършен модул',
    description: 'Премина 7 дни от един модул. Темпото е твое.',
    icon: 'check-circle',
    rarity: 'common',
    xpReward: 50
  },
  {
    id: 'halfway',
    title: 'Половината',
    description: '30 дни от 60. Невъзвратима зона.',
    icon: 'milestone',
    rarity: 'rare',
    xpReward: 150
  },
  {
    id: 'full_protocol',
    title: 'Велион',
    description: '60 дни. Протоколът е завършен. Сега си нова версия.',
    icon: 'trophy',
    rarity: 'legendary',
    xpReward: 500
  },
  {
    id: 'quiz_taken',
    title: 'Стартова точка',
    description: 'Записа своя начален Контрол индекс.',
    icon: 'target',
    rarity: 'common',
    xpReward: 50
  },
  {
    id: 'quiz_improved_20',
    title: 'Трансформация +20',
    description: 'Индексът ти се покачи с поне 20 точки от старта.',
    icon: 'trending-up',
    rarity: 'rare',
    xpReward: 150
  },
  {
    id: 'level_5',
    title: 'Дисциплина',
    description: 'Достигна ниво 5. Системата вече работи за теб.',
    icon: 'zap',
    rarity: 'rare',
    xpReward: 100
  },
  {
    id: 'level_10',
    title: 'Майстор',
    description: 'Ниво 10. Малцина стигат толкова далеч.',
    icon: 'crown',
    rarity: 'legendary',
    xpReward: 300
  }
]

export const BADGES_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]))

export const RARITY_COLORS = {
  common: '#9CA3AF',
  rare: '#FF6A00',
  legendary: '#FFD56E'
}
