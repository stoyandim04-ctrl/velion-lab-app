export const DAY_45 = {
  module: 'VII · Привличане и мъжко присъствие',
  tags: ['body-language', 'posture', 'nonverbal-self'],
  duration: '~13 мин',
  title: 'Body language',
  dayNumber: 45,

  theme: {
    icon: '🎯',
    text: 'Преди да отвориш уста, тялото ти вече е казало 80% от това, което хората ще възприемат за теб.'
  },

  lesson: {
    icon: '📖',
    title: 'УРОК',
    duration: '~5 мин',
    image: '/course/day-45/lesson.png',
    paragraphs: [
      'Тялото ти изразява реалното състояние, което си изградил вътре. Това не е „поза за впечатляване".',
      '6 ключови елемента на премиум body language:',
      '1) Stance — Стъпала на ширината на раменете. Гръб изправен, не стегнат.',
      '2) Hands — Отстрани или леко напред. НЕ скрити в джобовете.',
      '3) Movement — Бавно, целенасочено. Без fidgeting.',
      '4) Face — Релаксирана челюст. Релаксирано чело.',
      '5) Eye contact — Спокоен, не пробиващ. Задържан, но не вторачен.',
      '6) Congruence — Глас + тяло едно послание.'
    ],
    highlight: 'обитавай тялото си'
  },

  fact: {
    icon: '🔥',
    title: 'ПИКАНТЕН ФАКТ',
    text: '2 минути в power pose: тестостерон ↑ 20%, кортизол ↓ 25%. Тялото влияе на ума, не само обратно (Cuddy, Harvard).'
  },

  exercise: {
    icon: '🧘',
    title: 'УПРАЖНЕНИЕ',
    duration: '5 мин',
    subtitle: 'Body language audit',
    goal: 'Виждаш разликата между естествената си поза и upgrade-натата.',
    image: '/course/day-45/exercise.png',
    steps: [
      'Снимай себе си стоейки нестествено (10 сек таймер).',
      'Гледай снимката.',
      'Постави 6-те елемента.',
      'Снимай отново.',
      'Сравни двете снимки. Това е твоят upgrade.'
    ],
    effect: 'Виждаш черно на бяло какво се променя при съзнателна поза.'
  },

  dailyTask: {
    icon: '✅',
    title: 'МИНИ ЗАДАЧА',
    text: 'Днес 3 пъти провери позата си през деня. Коригирай без обвинение.'
  },

  journal: {
    icon: '💭',
    title: 'РАЗМИСЪЛ',
    prompt: 'Когато се чувствам най-уверен — как стои тялото ми? Когато не — какво се променя?',
    placeholder: 'Пиши свободно. Никой няма да го прочете освен теб.'
  },

  tracker: {
    icon: '📊',
    title: 'TRACKER',
    items: [
      { id: 'lesson', label: 'Урок прочетен' },
      { id: 'exercise', label: 'Body language audit (2 снимки)' },
      { id: 'task', label: '3 поза проверки през деня' },
      { id: 'journal', label: 'Журнал', optional: true }
    ]
  },

  victory: {
    icon: '🏆',
    title: 'ПОБЕДА',
    text: 'Започваш да обитаваш тялото си, не да го влачиш.'
  },

  tomorrow: {
    icon: '➡️',
    label: 'УТРЕ',
    dayNumber: 46,
    title: 'Гласът',
    teaser: 'Тон, темпо, паузи.'
  },

  navigation: [
    { day: 44, title: 'Energy management', status: 'completed', icon: '⬅️', route: '/course/day-44' },
    { day: 45, title: 'Body language', status: 'current', icon: '📍', route: '/course/day-45' },
    { day: 46, title: 'Гласът', status: 'locked', icon: '🔒', hint: 'съдържанието идва скоро' }
  ]
}
