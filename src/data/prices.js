// Velion Lab single-plan pricing.
// One offer, one price, lifetime access. €19.99 unique payment.
//
// The Stripe Payment Link below is the fast-checkout fallback that can be
// opened directly without our /api/create-checkout-session step. Use it
// from the native (Reader Mode) app or as a no-auth shortcut.

export const PRICE = {
  id: 'lifetime',
  name: 'ПЪЛЕН ДОСТЪП',
  subtitle: 'Еднократно плащане. Lifetime достъп.',
  price: '€19.99',
  amountCents: 1999,
  currency: 'EUR',
  mode: 'payment',
  priceId: import.meta.env.VITE_PRICE_LIFETIME,
  paymentLink: 'https://buy.stripe.com/7sYaEW8ZxcvGf7x2LrbMQ01'
}

// Backwards-compat for any old code path that still iterates PLANS.
export const PLANS = [PRICE]

export const PAYWALL_FEATURES = [
  '60 структурирани дни',
  '8 модула с упражнения',
  'Progress tracking и streak',
  'Всички бъдещи updates'
]

export const MODULES_OVERVIEW = [
  { id: 'I', title: 'Осъзнатост', range: 'Дни 1-7' },
  { id: 'II', title: 'Контрол', range: 'Дни 8-14' },
  { id: 'III', title: 'Дишане и темпо', range: 'Дни 15-21' },
  { id: 'IV', title: 'Тяло и навици', range: 'Дни 22-28' },
  { id: 'V', title: 'Психология', range: 'Дни 29-35' },
  { id: 'VI', title: 'Партньорство', range: 'Дни 36-42' },
  { id: 'VII', title: 'Привличане', range: 'Дни 43-49' },
  { id: 'VIII', title: 'Нова идентичност', range: 'Дни 50-60' }
]
