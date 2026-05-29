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

        // Resolve user_id from (in order):
        //   1. session.metadata.user_id (set by /api/create-checkout-session)
        //   2. session.client_reference_id (set by PaywallScreen on the
        //      Payment Link URL)
        //   3. fallback: look up auth.users by customer_details.email and
        //      copy the id into the session for the upsert.
        // The 3rd path lets us still grant access when somebody opens the
        // Payment Link without our query-string params (e.g. cached URL,
        // shared link), as long as they paid with the same email they used
        // to register.
        let userId = session.metadata?.user_id || session.client_reference_id || null
        if (!userId && session.customer_details?.email) {
          const email = session.customer_details.email.trim().toLowerCase()
          const { data: usersPage, error: lookupErr } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 200
          })
          if (lookupErr) {
            console.warn('[stripe-webhook] auth lookup failed:', lookupErr.message)
          } else {
            const match = usersPage?.users?.find(
              (u) => (u.email || '').toLowerCase() === email
            )
            if (match) {
              userId = match.id
              session.client_reference_id = match.id
              console.log('[stripe-webhook] resolved user_id via email fallback', {
                email,
                user_id: match.id
              })
            }
          }
        }

        if (!userId) {
          console.error('[stripe-webhook] checkout.session.completed missing user_id', {
            id: session.id,
            email: session.customer_details?.email,
            customer: session.customer,
            amount_total: session.amount_total
          })
          // Return 200 so Stripe stops retrying — we logged the gap; manual
          // backfill will be needed for this charge.
          return res.status(200).json({ received: true, note: 'no user_id' })
        }

        await upsertAccessFromCheckoutSession(supabase, session)
        console.log('[stripe-webhook] checkout.session.completed', {
          id: session.id,
          user_id: userId,
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
    console.error('[stripe-webhook] handler error:', {
      type: event?.type,
      event_id: event?.id,
      message: err?.message,
      code: err?.code,
      stack: err?.stack
    })
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}
