import Stripe from 'stripe'
import { requireUser } from './_supabase.js'

const ALLOWED_PRICE_IDS = new Set(
  [process.env.VITE_PRICE_MONTHLY, process.env.VITE_PRICE_LIFETIME].filter(Boolean)
)

function planFromPrice(priceId) {
  if (priceId === process.env.VITE_PRICE_LIFETIME) return 'lifetime'
  if (priceId === process.env.VITE_PRICE_MONTHLY) return 'monthly'
  return 'unknown'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe is not configured on the server' })
  }

  let auth
  try {
    auth = await requireUser(req)
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: 'Трябва да влезеш в акаунта си преди плащане.' })
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

  const stripe = new Stripe(secretKey, { apiVersion: '2026-02-25.clover' })

  const origin =
    req.headers.origin ||
    (req.headers.host ? `https://${req.headers.host}` : 'https://velion-lab.vercel.app')

  try {
    const metadata = {
      user_id: auth.user.id,
      plan: planFromPrice(priceId),
      price_id: priceId
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paywall`,
      locale: 'bg',
      client_reference_id: auth.user.id,
      customer_email: auth.user.email || undefined,
      metadata,
      ...(mode === 'subscription' ? { subscription_data: { metadata } } : {}),
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
