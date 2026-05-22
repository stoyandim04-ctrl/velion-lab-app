import Stripe from 'stripe'
import {
  hasPaidAccess,
  requireUser,
  upsertAccessFromCheckoutSession
} from './_supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
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
    return res.status(err.statusCode || 500).json({ error: 'Не си влязъл в акаунта си.' })
  }

  const id = req.query?.id
  if (!id || typeof id !== 'string' || !id.startsWith('cs_')) {
    return res.status(400).json({ error: 'Missing or invalid session id' })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-02-25.clover' })

  try {
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ['subscription']
    })
    const sessionUserId = session.metadata?.user_id || session.client_reference_id
    if (sessionUserId !== auth.user.id) {
      return res.status(403).json({ error: 'Това плащане не е към текущия акаунт.' })
    }

    const isPaid =
      session.payment_status === 'paid' ||
      (session.mode === 'subscription' && session.status === 'complete')

    let activated = false
    if (isPaid) {
      await upsertAccessFromCheckoutSession(auth.supabase, session)
      activated = await hasPaidAccess(auth.supabase, auth.user.id)
    }

    return res.status(200).json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      mode: session.mode,
      customer_email: session.customer_details?.email || null,
      amount_total: session.amount_total,
      currency: session.currency,
      activated,
      has_access: activated
    })
  } catch (err) {
    console.error('[stripe] get-session error:', err?.message)
    return res.status(404).json({ error: 'Session not found' })
  }
}
