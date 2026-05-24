// 5 quiz questions + 3 breather screens between them.
// Order:
//   Q1  → Breather 1 → Q2 → Q3 → Breather 2 → Q4 → Q5 → Breather 3 → /results
//
// Result logic uses:
//   Q1 (контрол/честота)
//   Q3 (тревожност/преди близост)
//   Q5 (присъствие)

export const QUIZ = [
  {
    id: 1,
    key: 'frequency',
    question: 'КОЛКО ЧЕСТО ГУБИШ КОНТРОЛ В ВАЖНИ МОМЕНТИ?',
    options: ['Рядко', 'Понякога', 'Често', 'Почти винаги']
  },
  {
    id: 2,
    key: 'age',
    question: 'НА КАКВА ВЪЗРАСТ СИ?',
    options: ['18-24', '25-34', '35-44', '45+']
  },
  {
    id: 3,
    key: 'anxiety',
    question: 'КАК СЕ ЧУВСТВАШ ПРЕДИ ВАЖЕН МОМЕНТ НА БЛИЗОСТ?',
    options: ['Спокойно', 'Леко напрегнато', 'Тревожно', 'Много тревожно']
  },
  {
    id: 4,
    key: 'inadequacy',
    question: 'ИМА ЛИ МОМЕНТИ В КОИТО СЕ ЧУВСТВАШ НЕАДЕКВАТЕН?',
    options: ['Никога', 'Рядко', 'Понякога', 'Твърде често']
  },
  {
    id: 5,
    key: 'presence',
    question: 'КАК БИ ОЦЕНИЛ МЪЖКОТО СИ ПРИСЪСТВИЕ?',
    options: ['Много силно', 'Средно', 'Слабо', 'Не знам какво е това']
  }
]

export const QUIZ_TOTAL = QUIZ.length

// Breather screens shown between questions.
// position = the question number after which this breather appears.
export const BREATHERS = [
  {
    id: 1,
    position: 1,
    image: '/quiz/breather-1.webp',
    title: 'РАЗБИРАМЕ ТЕ.',
    subtitle: 'Повечето мъже никога не признават това дори пред себе си.',
    cta: 'Продължи'
  },
  {
    id: 2,
    position: 3,
    image: '/quiz/breather-2.webp',
    title: 'НЕ СИ САМ.',
    subtitle: 'Над 70% от мъжете между 25 и 45 г. споделят същото. Просто никой не говори за това.',
    cta: 'Продължи'
  },
  {
    id: 3,
    position: 5,
    image: '/quiz/breather-3.webp',
    title: 'ИЗГРАЖДАМЕ ТВОЯ ЛИЧЕН ПРОТОКОЛ.',
    subtitle: 'Анализираме отговорите ти. Това отнема няколко секунди.',
    cta: null, // auto-advances after loading animation
    autoAdvance: true,
    loadingMs: 2800
  }
]

export function getBreatherAfter(questionId) {
  return BREATHERS.find((b) => b.position === questionId) || null
}
