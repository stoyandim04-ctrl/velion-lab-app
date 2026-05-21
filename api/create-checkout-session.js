import Stripe from 'stripe'

const ALLOWED_PRICE_IDS = new Set(
  [process.env.VITE_PRICE_MONTHLY, process.env.VITE_PRICE_LIFETIME].filter(Boolean)
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe is not configured on the server' })
  }

  const { priceId, mode } = req.body || {}

  if (!priceId || !mode) {
    return res.status(400).json({ error: 'Missing priceId or mode' })
  }
  if (mode !== 'subscription' && mode !== 'payment') {
    return res.status(400).json({ error: 'Invalid mode' })
  }
  if (ALLOWED_PRICE_IDS.size > 0 && !ALLOWED_PRICE_IDS.has(priceId)) {
    return res.status(400).json({ error: 'Unknown priceId' })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' })

  const origin =
    req.headers.origin ||
    (req.headers.host ? `https://${req.headers.host}` : 'https://velion-lab.vercel.app')

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paywall`,
      locale: 'bg',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      automatic_tax: { enabled: false },
      billing_address_collection: 'auto'
    })

    return res.status(200).json({ id: session.id, url: session.url })
  } catch (err) {
    console.error('[stripe] create-checkout-session error:', err?.message)
    return res.status(500).json({ error: 'Could not create checkout session' })
  }
}
