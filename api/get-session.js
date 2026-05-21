import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe is not configured on the server' })
  }

  const id = req.query?.id
  if (!id || typeof id !== 'string' || !id.startsWith('cs_')) {
    return res.status(400).json({ error: 'Missing or invalid session id' })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' })

  try {
    const session = await stripe.checkout.sessions.retrieve(id)
    return res.status(200).json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      mode: session.mode,
      customer_email: session.customer_details?.email || null,
      amount_total: session.amount_total,
      currency: session.currency
    })
  } catch (err) {
    console.error('[stripe] get-session error:', err?.message)
    return res.status(404).json({ error: 'Session not found' })
  }
}
