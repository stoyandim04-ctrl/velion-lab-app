// Контрол индекс — convert the 5-question onboarding quiz into a
// single 0-100 "Control Index" score plus a qualitative tier.
//
// Scoring rationale:
//   - Q1 (frequency of losing control): less often = better → higher score
//   - Q2 (age): demographic only, not scored
//   - Q3 (anxiety before intimacy): calmer = better → higher score
//   - Q4 (sense of inadequacy): rarer = better → higher score
//   - Q5 (perceived male presence): stronger = better → higher score
//
// Each scored question contributes 0-25 points (best option) so the
// theoretical max across the 4 scored questions is 100. We render the
// result as a whole-number percentage.

const POINTS = {
  // Q1 — Колко често ГУБИШ контрол в важни моменти?
  1: { 'Рядко': 25, 'Понякога': 18, 'Често': 8, 'Почти винаги': 0 },
  // Q3 — Как се чувстваш ПРЕДИ важен момент на близост?
  3: { 'Спокойно': 25, 'Леко напрегнато': 18, 'Тревожно': 8, 'Много тревожно': 0 },
  // Q4 — Чувстваш ли се неадекватен?
  4: { 'Никога': 25, 'Рядко': 18, 'Понякога': 8, 'Твърде често': 0 },
  // Q5 — Как би оценил мъжкото си присъствие?
  5: { 'Много силно': 25, 'Средно': 18, 'Слабо': 8, 'Не знам какво е това': 0 }
}

const SCORED_QUESTION_IDS = [1, 3, 4, 5]

export const TIERS = {
  low: {
    id: 'low',
    label: 'ИНСТИНКТЕН РЕЖИМ',
    headline: 'Нервната система те води. Не ти нея.',
    description:
      'Това не е слабост — това е необучен мускул. Velion Lab е създаден точно за този стартов пункт. 60 дни структурирана работа и резултатът ще е видим.',
    color: '#FF4D2A',
    range: [0, 30]
  },
  medium: {
    id: 'medium',
    label: 'В РАЗВИТИЕ',
    headline: 'Имаш основа. Сега трябва система.',
    description:
      'В някои моменти държиш контрол, в други не. Това е най-честият старт. С правилния протокол ще консолидираш това което вече работи.',
    color: '#FFB100',
    range: [31, 60]
  },
  high: {
    id: 'high',
    label: 'СЪЗНАТЕЛЕН РЕЖИМ',
    headline: 'Силна базова осъзнатост.',
    description:
      'Имаш реален контрол в повечето ситуации. Velion Lab ще ти даде последните 20% — фината регулация която отличава добрите от великите.',
    color: '#3DD68C',
    range: [61, 100]
  }
}

function tierForScore(score) {
  if (score <= TIERS.low.range[1]) return TIERS.low
  if (score <= TIERS.medium.range[1]) return TIERS.medium
  return TIERS.high
}

export function calculateControlIndex(answers = {}) {
  let total = 0
  let answered = 0

  for (const qid of SCORED_QUESTION_IDS) {
    const answer = answers[qid]
    if (!answer) continue
    const points = POINTS[qid]?.[answer]
    if (typeof points === 'number') {
      total += points
      answered += 1
    }
  }

  // If the user hasn't completed all scored questions yet, scale by what
  // they did answer so partial-result previews don't artificially crash
  // to 0. Final results only get computed once all 5 questions are done.
  const denominator = answered > 0 ? answered * 25 : 1
  const score = Math.round((total / denominator) * 100)
  const clampedScore = Math.max(0, Math.min(100, score))
  const tier = tierForScore(clampedScore)

  return {
    score: clampedScore,
    tier,
    isComplete: answered === SCORED_QUESTION_IDS.length
  }
}
