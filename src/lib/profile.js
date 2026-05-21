import { supabase } from './supabaseClient.js'

// Per-user scoped profile. Supabase profiles table is the source of truth;
// localStorage holds a per-user cache for fast first-paint.

function cacheKey(userId) {
  return `velion_profile_${userId}`
}

function readCache(userId) {
  if (!userId || typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(cacheKey(userId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCache(userId, patch) {
  if (!userId || typeof window === 'undefined') return
  const curr = readCache(userId)
  const next = { ...curr, ...patch }
  try {
    window.localStorage.setItem(cacheKey(userId), JSON.stringify(next))
  } catch {}
  return next
}

export function clearProfileCache(userId) {
  if (!userId || typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(cacheKey(userId))
  } catch {}
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() || '?'
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Defaults shape returned everywhere
function emptyProfile() {
  return { name: '', avatar: '', createdAt: null }
}

// Synchronous: returns cached profile for THIS user only (or empty).
export function getCachedProfile(userId) {
  if (!userId) return emptyProfile()
  const c = readCache(userId)
  return {
    name: c.name || '',
    avatar: c.avatar || '',
    createdAt: c.createdAt || null
  }
}

// Async: fetch from Supabase, refresh cache, return latest.
export async function fetchProfile(userId) {
  if (!userId) return emptyProfile()
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, created_at')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[Velion] fetchProfile error:', error.message)
    return getCachedProfile(userId)
  }
  const profile = {
    name: data?.display_name || '',
    avatar: data?.avatar_url || '',
    createdAt: data?.created_at || null
  }
  writeCache(userId, profile)
  return profile
}

// Async: save a patch to Supabase + cache.
export async function saveProfile(userId, patch) {
  if (!userId) return emptyProfile()
  const updates = {}
  if (patch.name !== undefined) updates.display_name = patch.name
  if (patch.avatar !== undefined) updates.avatar_url = patch.avatar
  updates.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  if (error) console.warn('[Velion] saveProfile error:', error.message)

  return writeCache(userId, patch)
}
