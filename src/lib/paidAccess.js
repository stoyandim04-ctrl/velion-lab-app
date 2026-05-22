import { supabase } from './supabaseClient.js'

export function isActivePaidAccess(row) {
  if (!row) return false
  if (!['active', 'trialing'].includes(row.status)) return false
  if (!row.current_period_end) return true
  return new Date(row.current_period_end).getTime() > Date.now()
}

export async function fetchPaidAccess(userId) {
  if (!userId) return { hasPaidAccess: false, subscription: null }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id,status,plan,current_period_end,cancel_at_period_end,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5)

  if (error) {
    console.warn('[Velion] fetchPaidAccess error:', error.message)
    return { hasPaidAccess: false, subscription: null, error }
  }

  const subscription = (data || []).find(isActivePaidAccess) || null
  return { hasPaidAccess: Boolean(subscription), subscription }
}
