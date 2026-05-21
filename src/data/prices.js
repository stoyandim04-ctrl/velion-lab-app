export const PLANS = [
  {
    id: 'lifetime',
    name: 'LIFETIME',
    subtitle: 'Еднократно плащане — достъп завинаги',
    price: '€69.99',
    period: 'еднократно',
    badge: '🔥 НАЙ-ИЗГОДНО',
    note: 'Без месечни такси. Достъп до всички бъдещи update-и.',
    mode: 'payment',
    priceId: import.meta.env.VITE_PRICE_LIFETIME
  },
  {
    id: 'monthly',
    name: 'МЕСЕЧЕН',
    subtitle: 'Заплащане всеки месец',
    price: '€24.99',
    period: '/ месец',
    note: 'Отмени по всяко време от настройките.',
    mode: 'subscription',
    priceId: import.meta.env.VITE_PRICE_MONTHLY
  }
]

export const PAYWALL_FEATURES = [
  '60-дневна персонализирана система',
  'Дневни уроци и упражнения (~13 мин/ден)',
  'Дишане и нервна система — техники',
  'Pelvic floor тренировки',
  'Tracker за прогрес и победи',
  'Премиум общност от мъже'
]
