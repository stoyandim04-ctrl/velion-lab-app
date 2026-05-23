export const DAY_42 = {
  module: 'VI · Интеграция',
  tags: ['integration', 'week-6', 'partnership'],
  duration: '~15 мин',
  title: 'Интеграция Седмица 6 — Партньорството като контекст',
  dayNumber: 42,
  isIntegration: true,

  theme: {
    icon: '🎯',
    text: 'Контролът не е соло акт. Той се случва в отношение.'
  },

  lesson: {
    icon: '📖',
    title: 'УРОК',
    duration: '~5 мин',
    image: '/course/day-42/lesson.png',
    intro: 'Тази седмица научи:',
    bullets: [
      { day: 36, text: 'Биологични разлики' },
      { day: 37, text: 'Emotional safety' },
      { day: 38, text: 'Вербална и невербална комуникация' },
      { day: 39, text: 'Четене на невербални сигнали' },
      { day: 40, text: 'Feedback loops' },
      { day: 41, text: 'Mutual rhythm' }
    ],
    outro: 'Огромна промяна в perspective. Първите 5 седмици бяха за теб. Сега виждаш картина с двама хора. Защо тази смяна е критична: Performance anxiety е по същество страх да не разочароваш ДРУГ човек. Но ако реално не познаваш този човек — твоят „страх" е базиран на въображение. Когато наистина познаваш партньорката си — четеш я, общуваш, изграждаш ритъм — PE има по-малко място. Velion Partnership Protocol — ДНЕВНО (5 мин): 1 момент на споделен eye contact без думи, 1 въпрос с истинско любопитство, 1 невербално наблюдение. СЕДМИЧНО: 1 soft start ritual (5 мин дишане заедно), 1 разговор за връзката/близостта, 1 нов експеримент. ПРЕДИ ИНТИМЕН МОМЕНТ: transition ритуал заедно, settling (дишане, тиха близост), без бързане. ПО ВРЕМЕ: slow start, feedback loop active, невербални сигнали observed, mutual rhythm sought не forced. СЛЕД: присъствие (не телефон, не сън веднага), 1 кратко положително наблюдение, близост без задължение.'
  },

  fact: {
    icon: '🔥',
    title: 'ВАЖЕН ФАКТ',
    text: 'Качеството на връзката извън спалнята предсказва качеството на близостта вътре, в около 80% от случаите (Gottman, Schnarch). Спалнята не е изолирана зона.'
  },

  exercise: {
    icon: '🧘',
    title: 'УПРАЖНЕНИЕ',
    duration: '15 мин',
    subtitle: 'Partnership self-audit',
    goal: 'Честна оценка на текущата ти позиция.',
    image: '/course/day-42/exercise.png',
    sections: [
      {
        label: 'Минути 0-5 · Оценки',
        steps: [
          'Оцени себе си 1-10 за всяка от 6-те теми:',
          'Биология: ___',
          'Safety: ___',
          'Комуникация: ___',
          'Невербално: ___',
          'Feedback: ___',
          'Ритъм: ___'
        ]
      },
      {
        label: 'Минути 5-10 · Слаба област',
        steps: ['За най-слабата област — 1 конкретно действие тази седмица.']
      },
      {
        label: 'Минути 10-15 · Визия',
        steps: ['Как би изглеждала твоята връзка, ако всички 6 бяха на 8+?']
      }
    ],
    effect: 'Реална карта на твоята партньорска зона.'
  },

  dailyTask: {
    icon: '✅',
    title: 'МИНИ ЗАДАЧА',
    text: 'Избери едно от трите за настоящата седмица: soft start ritual с партньорка, разговор за нея, акт с пълен фокус на нея.'
  },

  journal: {
    icon: '💭',
    title: 'РАЗМИСЪЛ',
    prompt: 'Преди тази седмица, кой беше моят модел за „добър любовник"? Кой е сега?',
    placeholder: 'Пиши свободно. Никой няма да го прочете освен теб.'
  },

  tracker: {
    icon: '📊',
    title: 'TRACKER',
    items: [
      { id: 'lesson', label: 'Урок прочетен' },
      { id: 'exercise', label: 'Partnership self-audit (15 мин)' },
      { id: 'task', label: 'Действие избрано' },
      { id: 'journal', label: 'Журнал', optional: true }
    ]
  },

  victory: {
    icon: '🏆',
    title: 'ПОБЕДА',
    text: 'Виждаш реалния друг човек. Разликата между мъж и момче.',
    badge: 'КРАЙ НА СЕДМИЦА 6 — ПАРТНЬОРСТВО'
  },

  tomorrow: {
    icon: '➡️',
    label: 'СЕДМИЦА 7 ЗАПОЧВА',
    dayNumber: 43,
    title: 'Маскулинност vs мъжко присъствие',
    teaser: 'Седмица 7 — Мъжкото присъствие извън спалнята.',
    moduleStart: 'Модул VII · Привличане и мъжко присъствие'
  },

  navigation: [
    { day: 41, title: 'Mutual rhythm', status: 'completed', icon: '⬅️', route: '/course/day-41' },
    { day: 42, title: 'Интеграция Седмица 6', status: 'current', icon: '📍', route: '/course/day-42' },
    { day: 43, title: 'Маскулинност vs присъствие', status: 'locked', icon: '🔒', route: '/course/day-43', hint: 'отключва се след завършване на Ден 42' }
  ]
}
