export const DAY_35 = {
  module: 'V · Интеграция',
  tags: ['integration', 'week-5', 'psychology-protocol'],
  duration: '~15 мин',
  title: 'Интеграция Седмица 5 — Психологическият протокол',
  dayNumber: 35,
  isIntegration: true,

  theme: {
    icon: '🎯',
    text: 'Седем дни психология. Време да ги превърнеш в система, която работи преди, по време и след всеки важен момент.'
  },

  lesson: {
    icon: '📖',
    title: 'УРОК',
    duration: '~5 мин',
    image: '/course/day-35/lesson.png',
    intro: 'Тази седмица научи как психологията прави или разрушава представянето.',
    bullets: [
      { day: 29, text: 'Performance Anxiety — цикълът на страха' },
      { day: 30, text: 'Mindfulness midpoint — половината път' },
      { day: 31, text: 'Reframing — преобразяване на мисли' },
      { day: 32, text: 'Визуализация — mental rehearsal' },
      { day: 33, text: 'Self-talk — вътрешният диалог' },
      { day: 34, text: 'Ритуали на увереността — embodied confidence' }
    ],
    outro: 'Заедно те образуват Velion Psychology Protocol. ПРЕДИ: Power posture (2 мин) + Мантра + кратка визуализация (2 мин) + 4 цикъла 4-7-8. ПО ВРЕМЕ: awareness на self-talk, catch & reframe ако Critic се появи, фокус на партньорка, Inner Coach режим — „имам инструменти", грешка = информация, не катастрофа. СЛЕД (независимо от резултат): без auto-критика, без оплакване, запис „какво научих?", reframing на трудни моменти, mental note за следващ път. Без този протокол всеки интимен момент е тест. С него — възможност за развитие.'
  },

  fact: {
    icon: '🔥',
    title: 'ПИКАНТЕН ФАКТ',
    text: 'След 35 дни последователна работа върху психологията, мозъкът ти буквално променя структурата си. Не метафорично — невропластиката е реална. Сивото вещество в зоните на емоционална регулация се разраства, а в зоните на тревога — намалява. Това е измеримо в fMRI.'
  },

  exercise: {
    icon: '🧘',
    title: 'УПРАЖНЕНИЕ',
    duration: '15 мин',
    subtitle: 'Първа интегрирана психо-сесия',
    goal: 'Преживяваш целия Psychology Protocol като една последователност.',
    image: '/course/day-35/exercise.png',
    sections: [
      { label: 'Минути 0-3 · Power posture + мантра', steps: ['Power posture (2 мин) + мантрата ти.'] },
      { label: 'Минути 3-6 · Визуализация', steps: ['3 минути — сценарий с тревога → reframe → спокойствие.'] },
      { label: 'Минути 6-9 · Дишане', steps: ['4 цикъла 4-7-8 (3 мин).'] },
      { label: 'Минути 9-12 · Self-talk audit', steps: ['Кой глас доминира сега? Inner Coach?'] },
      { label: 'Минути 12-15 · Запис', steps: ['Кой инструмент усетих най-силно днес?'] }
    ],
    effect: 'В края: оцени Control/Calm/Confidence за днешния ден.'
  },

  dailyTask: {
    icon: '✅',
    title: 'МИНИ ЗАДАЧА',
    text: 'До края на седмицата приложи Psychology Protocol поне 1 път преди ВАЖЕН момент в живота — не задължително интимен. Виж как влияе на представянето ти.'
  },

  journal: {
    icon: '💭',
    title: 'РАЗМИСЪЛ',
    prompt: 'Преди 35 дни кой беше мъжът, който започна Модул V? Какво се промени в главата му? Не в света — в неговата глава.',
    placeholder: 'Пиши свободно. Никой няма да го прочете освен теб.'
  },

  tracker: {
    icon: '📊',
    title: 'TRACKER',
    items: [
      { id: 'lesson', label: 'Урок прочетен' },
      { id: 'exercise', label: 'Интегрирана психо-сесия (15 мин)' },
      { id: 'task', label: 'Personal Protocol приложен на важен момент' },
      { id: 'journal', label: 'Журнал', optional: true }
    ]
  },

  victory: {
    icon: '🏆',
    title: 'ПОБЕДА',
    text: 'Имаш психологическа система — не просто mood. Това е сериозен инструмент. Носиш го навсякъде.',
    badge: 'КРАЙ НА СЕДМИЦА 5 — ПСИХОЛОГИЯ'
  },

  tomorrow: {
    icon: '➡️',
    label: 'СЕДМИЦА 6 ЗАПОЧВА',
    dayNumber: 36,
    title: 'Женската възбуда vs мъжката',
    teaser: 'Влизаш в Модул VI — Партньорство и интимност. Първи урок: разбираш напълно другата страна.',
    moduleStart: 'Модул VI · Партньорство'
  },

  navigation: [
    { day: 34, title: 'Ритуали на увереността', status: 'completed', icon: '⬅️', route: '/course/day-34' },
    { day: 35, title: 'Интеграция Седмица 5', status: 'current', icon: '📍', route: '/course/day-35' },
    { day: 36, title: 'Женската възбуда vs мъжката', status: 'current', icon: '📍', route: '/course/day-36' }
  ]
}
