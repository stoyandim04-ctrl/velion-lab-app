import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { fetchPaidAccess } from '../lib/paidAccess.js'

const AuthContext = createContext(null)

// Keys that were used before per-user scoping. We purge them on every auth event
// so account A's leftover data can never leak into account B.
const LEGACY_GLOBAL_KEYS = ['velion_course_progress', 'velion_profile', 'velion_onboarding_v1']

function purgeLegacyKeys() {
  if (typeof window === 'undefined') return
  try {
    for (const k of LEGACY_GLOBAL_KEYS) window.localStorage.removeItem(k)
  } catch {}
}

function purgeUserScopedKeys(userId) {
  if (!userId || typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(`velion_course_progress_${userId}`)
    window.localStorage.removeItem(`velion_profile_${userId}`)
    window.localStorage.removeItem(`velion_engagement_${userId}`)
  } catch {}
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessLoading, setAccessLoading] = useState(true)
  const [paidAccess, setPaidAccess] = useState({ hasPaidAccess: false, subscription: null })
  const lastUserIdRef = useRef(null)

  const refreshAccess = useCallback(async (nextUserId = lastUserIdRef.current) => {
    if (!nextUserId) {
      setPaidAccess({ hasPaidAccess: false, subscription: null })
      setAccessLoading(false)
      return { hasPaidAccess: false, subscription: null }
    }

    setAccessLoading(true)
    const access = await fetchPaidAccess(nextUserId)
    setPaidAccess({
      hasPaidAccess: Boolean(access.hasPaidAccess),
      subscription: access.subscription || null
    })
    setAccessLoading(false)
    return access
  }, [])

  useEffect(() => {
    let mounted = true

    purgeLegacyKeys()

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return
      setSession(s)
      setUser(s?.user ?? null)
      lastUserIdRef.current = s?.user?.id || null
      setLoading(false)
      refreshAccess(s?.user?.id || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      const newUserId = s?.user?.id || null
      const prevUserId = lastUserIdRef.current

      // When the signed-in user changes (different account OR sign-out),
      // wipe the previous user's scoped cache so nothing leaks across accounts.
      if (prevUserId && prevUserId !== newUserId) {
        purgeUserScopedKeys(prevUserId)
      }
      if (event === 'SIGNED_OUT') {
        purgeUserScopedKeys(prevUserId)
        purgeLegacyKeys()
      }

      setSession(s)
      setUser(s?.user ?? null)
      lastUserIdRef.current = newUserId
      setLoading(false)
      refreshAccess(newUserId)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [refreshAccess])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }, [])

  const signUp = useCallback(async (email, password, options = {}) => {
    const { fullName } = options
    const trimmedName = typeof fullName === 'string' ? fullName.trim() : ''
    const signUpOptions = trimmedName ? { data: { full_name: trimmedName } } : undefined
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: signUpOptions
    })
    // Mirror the name into the profiles row so the rest of the app
    // (ProfileDrawer, landing greeting) can read it without going through
    // user_metadata. Upsert handles both: profile row already created by
    // a trigger, or not yet — we always end up with display_name set.
    if (!error && data?.user?.id && trimmedName) {
      try {
        await supabase
          .from('profiles')
          .upsert(
            { id: data.user.id, display_name: trimmedName, updated_at: new Date().toISOString() },
            { onConflict: 'id' }
          )
      } catch (e) {
        console.warn('[Velion] profile upsert after signup failed:', e?.message)
      }
    }
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    const prevUserId = lastUserIdRef.current
    await supabase.auth.signOut()
    purgeUserScopedKeys(prevUserId)
    purgeLegacyKeys()
  }, [])

  const resetPassword = useCallback(async (email) => {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth`
        : undefined
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    })
    return { data, error }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      accessLoading,
      isAuthenticated: Boolean(user),
      hasPaidAccess: paidAccess.hasPaidAccess,
      subscription: paidAccess.subscription,
      refreshAccess,
      signIn,
      signUp,
      signOut,
      resetPassword
    }),
    [session, user, loading, accessLoading, paidAccess, refreshAccess, signIn, signUp, signOut, resetPassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
