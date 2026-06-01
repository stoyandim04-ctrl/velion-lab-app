// Frontend coach client. Reads conversation history straight from the
// ai_coach_messages table via the authenticated Supabase client (RLS
// limits the user to their own rows) and posts new messages through
// the /api/coach Vercel function which wraps Anthropic.

import { supabase } from './supabaseClient.js'

export async function fetchCoachHistory(userId, { limit = 30 } = {}) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('ai_coach_messages')
    .select('id, role, content, created_at')
    .eq('user_id', userId)
    .in('role', ['user', 'assistant'])
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.warn('[Velion] fetchCoachHistory error:', error.message)
    return []
  }
  return (data || []).reverse()
}

export async function sendCoachMessage(token, message) {
  if (!token) throw new Error('Missing auth token')
  const res = await fetch('/api/coach', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  })
  let payload = null
  try {
    payload = await res.json()
  } catch {}
  if (!res.ok) {
    const err = new Error(payload?.message || payload?.error || `HTTP ${res.status}`)
    err.status = res.status
    err.code = payload?.error || null
    throw err
  }
  return payload
}

export async function fetchTodayUsage(userId) {
  if (!userId) return 0
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  const { count } = await supabase
    .from('ai_coach_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', since.toISOString())
  return count || 0
}

export const DAILY_LIMIT = 5
