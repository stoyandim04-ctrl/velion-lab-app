import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

let adminClient = null

export function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role is not configured')
  }

  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  }

  return adminClient
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  const match = /^Bearer\s+(.+)$/i.exec(header)
  return match?.[1] || null
}

export async function requireUser(req) {
  const token = getBearerToken(req)
  if (!token) {
    const err = new Error('Missing authorization token')
    err.statusCode = 401
    throw err
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    const err = new Error('Invalid authorization token')
    err.statusCode = 401
    throw err
  }

  return { supabase, user: data.user }
}

export function isPaidSubscription(row) {
  if (!row) return false
  if (!['active', 'trialing'].includes(row.status)) return false
  if (!row.current_period_end) return true
  return new Date(row.current_period_end).getTime() > Date.now()
}

export async function hasPaidAccess(supabase, userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id,status,current_period_end,plan,updated_at')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('updated_at', { ascending: false })
    .limit(5)

  if (error) throw error
  return (data || []).some(isPaidSubscription)
}

function secondsToIso(value) {
  return value ? new Date(value * 1000).toISOString() : null
}

function mapPlan(session) {
  if (session.metadata?.plan) return session.metadata.plan
  if (session.mode === 'payment') return 'lifetime'
  return 'monthly'
}

function stripeId(value) {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

async function findExistingSubscription(supabase, { userId, checkoutSessionId, subscriptionId }) {
  if (checkoutSessionId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_checkout_session_id', checkoutSessionId)
      .maybeSingle()
    if (data?.id) return data.id
  }

  if (subscriptionId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle()
    if (data?.id) return data.id
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data?.id || null
}

export async function upsertAccessFromCheckoutSession(supabase, session) {
  const userId = session.metadata?.user_id || session.client_reference_id
  if (!userId) return null

  const subscription =
    session.subscription && typeof session.subscription === 'object'
      ? session.subscription
      : null
  const subscriptionId = stripeId(session.subscription)
  const row = {
    user_id: userId,
    stripe_customer_id: stripeId(session.customer),
    stripe_subscription_id: subscriptionId,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: stripeId(session.payment_intent),
    stripe_price_id: session.metadata?.price_id || session.line_items?.data?.[0]?.price?.id || null,
    status: 'active',
    plan: mapPlan(session),
    current_period_start: secondsToIso(subscription?.current_period_start),
    current_period_end:
      session.mode === 'payment' ? null : secondsToIso(subscription?.current_period_end),
    cancel_at_period_end: Boolean(subscription?.cancel_at_period_end),
    canceled_at: secondsToIso(subscription?.canceled_at),
    updated_at: new Date().toISOString()
  }

  const existingId = await findExistingSubscription(supabase, {
    userId,
    checkoutSessionId: session.id,
    subscriptionId
  })

  if (existingId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(row)
      .eq('id', existingId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAccessFromSubscription(supabase, subscription) {
  const userId = subscription.metadata?.user_id
  const subscriptionId = subscription.id
  if (!userId && !subscriptionId) return null

  const row = {
    ...(userId ? { user_id: userId } : {}),
    stripe_customer_id: stripeId(subscription.customer),
    stripe_subscription_id: subscriptionId,
    stripe_price_id: subscription.items?.data?.[0]?.price?.id || null,
    status: subscription.status,
    plan: subscription.metadata?.plan || 'monthly',
    current_period_start: secondsToIso(subscription.current_period_start),
    current_period_end: secondsToIso(subscription.current_period_end),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    canceled_at: secondsToIso(subscription.canceled_at),
    updated_at: new Date().toISOString()
  }

  const existingId = await findExistingSubscription(supabase, {
    userId,
    checkoutSessionId: null,
    subscriptionId
  })

  if (existingId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(row)
      .eq('id', existingId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  if (!userId) return null

  const { data, error } = await supabase
    .from('subscriptions')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return data
}
