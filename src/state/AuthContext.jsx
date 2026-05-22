import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

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
  const lastUserIdRef = useRef(null)

  useEffect(() => {
    let mounted = true

    purgeLegacyKeys()

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return
      setSession(s)
      setUser(s?.user ?? null)
      lastUserIdRef.current = s?.user?.id || null
      setLoading(false)
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
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }, [])

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    const prevUserId = lastUserIdRef.current
    await supabase.auth.signOut()
    purgeUserScopedKeys(prevUserId)
    purgeLegacyKeys()
  }, [])

  const value = useMemo(
    () => ({ session, user, loading, isAuthenticated: Boolean(user), signIn, signUp, signOut }),
    [session, user, loading, signIn, signUp, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
