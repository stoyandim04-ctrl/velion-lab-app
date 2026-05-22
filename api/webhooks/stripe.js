import Stripe from 'stripe'
import {
  getSupabaseAdmin,
  updateAccessFromSubscription,
  upsertAccessFromCheckoutSession
} from '../_supabase.js'

export const config = {
  api: { bodyParser: false }
}

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) {
    return res.status(500).json({ error: 'Stripe is not configured' })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-02-25.clover' })
  const sig = req.headers['stripe-signature']

  let event
  try {
    const raw = await readRawBody(req)
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret)
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err?.message)
    return res.status(400).json({ error: `Webhook Error: ${err?.message}` })
  }

  try {
    const supabase = getSupabaseAdmin()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
          expand: ['subscription']
        })
        await upsertAccessFromCheckoutSession(supabase, session)
        console.log('[stripe-webhook] checkout.session.completed', {
          id: session.id,
          user_id: session.metadata?.user_id || session.client_reference_id,
          mode: session.mode,
          customer: session.customer,
          email: session.customer_details?.email,
          amount_total: session.amount_total
        })
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        await updateAccessFromSubscription(supabase, sub)
        console.log(`[stripe-webhook] ${event.type}`, {
          id: sub.id,
          status: sub.status,
          customer: sub.customer,
          current_period_end: sub.current_period_end
        })
        break
      }
      default:
        console.log('[stripe-webhook] unhandled event:', event.type)
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('[stripe-webhook] handler error:', err?.message)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}
