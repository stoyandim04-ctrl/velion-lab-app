import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/layout/Screen.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'

function mapAuthError(err) {
  if (!err) return ''
  const msg = err.message || ''
  const code = err.code || err.error || ''
  if (/email not confirmed/i.test(msg) || code === 'email_not_confirmed') {
    return 'Акаунтът ти не е потвърден. Провери имейла си за линка за потвърждение.'
  }
  if (/invalid login|invalid_credentials|invalid grant/i.test(msg) || code === 'invalid_credentials') {
    return 'Грешен имейл или парола.'
  }
  if (/user already registered|already exists|user_already_exists/i.test(msg) || code === 'user_already_exists') {
    return 'Този имейл вече е регистриран. Влез вместо това.'
  }
  if (/over_email_send_rate_limit|rate limit/i.test(msg)) {
    return 'Твърде много опити. Изчакай малко.'
  }
  if (/weak password|password should be/i.test(msg)) {
    return 'Паролата е твърде слаба. Поне 6 символа.'
  }
  if (/valid email|email format/i.test(msg)) {
    return 'Невалиден имейл адрес.'
  }
  return msg || 'Възникна грешка. Опитай отново.'
}

export default function AuthScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, signOut, resetPassword, user, isAuthenticated, loading, accessLoading, hasPaidAccess } = useAuth()
  // Default to SIGNUP — this is an onboarding-focused app, most /auth visitors
  // are new users. Caller can override via location.state.mode = 'login'.
  const initialMode = location.state?.mode === 'login' ? 'login' : 'signup'
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  // Capture whether the user was ALREADY authenticated when this screen
  // mounted (cached Supabase session from a previous visit). We only want
  // to show the "Active session — sign out first?" warning in that case.
  // A fresh signup also flips isAuthenticated to true, but we must NOT
  // treat that as a cached session — those users should be redirected
  // forward, not shown an "are you sure?" panel.
  const hadCachedSessionRef = useRef(null)
  if (hadCachedSessionRef.current === null && !loading) {
    hadCachedSessionRef.current = isAuthenticated
  }
  const hadCachedSession = hadCachedSessionRef.current === true
  const blockedByCachedSession = mode === 'signup' && hadCachedSession && isAuthenticated && !loading

  const handleSignOutAndStartFresh = async () => {
    setSigningOut(true)
    await signOut()
    // After signOut the auth listener will re-render this component with
    // isAuthenticated=false; the signup form then becomes usable.
    setSigningOut(false)
  }

  const handleResetPassword = async () => {
    setError('')
    setInfo('')
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError('Въведи имейла си в полето отгоре.')
      return
    }
    setResetting(true)
    const { error: err } = await resetPassword(trimmedEmail)
    setResetting(false)
    if (err) {
      setError(mapAuthError(err))
      return
    }
    setInfo('Изпратихме ти линк за смяна на паролата. Провери имейла си.')
  }

  const intendedTarget = location.state?.from && location.state.from !== '/auth'
    ? location.state.from
    : null

  // After auth completes (login OR signup): wait for paid-access check,
  // then route based on subscription status.
  // - Paid → dashboard (or original intended target)
  // - Not paid → paywall
  // EXCEPTION: a cached session already existed when the screen mounted
  // AND the user explicitly arrived in signup mode. In that single case
  // we show the "Active session — sign out first?" panel instead of
  // auto-redirecting, so the user can decide which account to use.
  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) return
    if (mode === 'signup' && hadCachedSession) return
    if (accessLoading) return
    if (hasPaidAccess) {
      navigate(intendedTarget || ROUTES.dashboard, { replace: true })
    } else {
      navigate(ROUTES.paywall, { replace: true, state: { from: '/auth' } })
    }
  }, [mode, loading, isAuthenticated, accessLoading, hasPaidAccess, hadCachedSession, navigate, intendedTarget])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      setError('Имейл и парола са задължителни.')
      return
    }
    if (password.length < 6) {
      setError('Паролата трябва да е поне 6 символа.')
      return
    }

    setBusy(true)

    if (mode === 'signup') {
      const trimmedName = fullName.trim()
      if (!trimmedName) {
        setError('Името е задължително.')
        setBusy(false)
        return
      }
      const { data, error: err } = await signUp(trimmedEmail, password, { fullName: trimmedName })
      setBusy(false)
      if (err) {
        console.error('[Velion] signUp error:', err)
        setError(mapAuthError(err))
        return
      }
      // After signup, the auth state effect above handles routing once
      // the session and paid-access check resolve.
      if (data?.user && !data.session) {
        setInfo('Провери имейла си, за да потвърдиш акаунта. След потвърждение се върни тук и влез.')
        setMode('login')
        setPassword('')
      }
      return
    }

    // mode === 'login' — routing handled by the auth state effect above.
    const { error: err } = await signIn(trimmedEmail, password)
    setBusy(false)
    if (err) {
      console.error('[Velion] signIn error:', err)
      setError(mapAuthError(err))
    }
  }

  return (
    <Screen background="bg-forest-deep">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(255,106,0,0.18) 0%, rgba(255,106,0,0.06) 30%, transparent 65%), #0A0A0A'
        }}
      />

      <div className="relative z-10 flex flex-col h-full px-6 pt-[max(56px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="flex-1 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-display font-semibold text-accent text-[10px] tracking-[0.15em] uppercase mb-3">
              Velion Lab
            </div>
            <h1 className="font-display font-bold text-ink text-[28px] sm:text-[32px] leading-[1.08] tracking-display uppercase mb-3">
              {mode === 'login' ? 'Влез в акаунта си' : 'Създай акаунт'}
            </h1>
            <p className="text-ink-muted text-[15px] leading-[1.55] mb-6 max-w-[340px]">
              {mode === 'login'
                ? 'Продължи от мястото, на което си спрял. Прогресът ти е запазен.'
                : 'Запиши се за нов акаунт. Прогресът ти ще се пази в облака и достъпно на всяко устройство.'}
            </p>

            {/* PROMINENT MODE TABS — always visible, primary navigation */}
            {!blockedByCachedSession && (
              <div className="grid grid-cols-2 gap-2 mb-6 rounded-2xl border border-forest-line bg-forest-card/40 p-1">
                <button
                  onClick={() => { setError(''); setInfo(''); setMode('signup') }}
                  className={[
                    'min-h-[44px] rounded-xl font-display text-[12px] font-bold tracking-[0.1em] uppercase transition-all',
                    mode === 'signup'
                      ? 'bg-accent text-forest-deep shadow-[0_0_20px_rgba(255,106,0,0.3)]'
                      : 'bg-transparent text-ink-muted active:text-ink'
                  ].join(' ')}
                >
                  Създай акаунт
                </button>
                <button
                  onClick={() => { setError(''); setInfo(''); setMode('login') }}
                  className={[
                    'min-h-[44px] rounded-xl font-display text-[12px] font-bold tracking-[0.1em] uppercase transition-all',
                    mode === 'login'
                      ? 'bg-accent text-forest-deep shadow-[0_0_20px_rgba(255,106,0,0.3)]'
                      : 'bg-transparent text-ink-muted active:text-ink'
                  ].join(' ')}
                >
                  Влез
                </button>
              </div>
            )}
          </motion.div>

          {blockedByCachedSession ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-5 py-5 mb-4"
            >
              <div className="font-display font-semibold text-amber-300 text-[11px] tracking-[0.14em] uppercase mb-2">
                Активна сесия
              </div>
              <p className="text-ink text-[14px] leading-[1.55] mb-1">
                Влязъл си като:
              </p>
              <p className="font-display text-ink text-[15px] font-semibold mb-4 break-all">
                {user?.email || 'непознат акаунт'}
              </p>
              <p className="text-ink-muted text-[12.5px] leading-[1.55] mb-4">
                За да създадеш НОВ акаунт първо излез от текущия. Прогресът на текущия акаунт се запазва — можеш да се върнеш с „Влез" по всяко време.
              </p>
              <button
                onClick={handleSignOutAndStartFresh}
                disabled={signingOut}
                className="w-full min-h-[48px] rounded-2xl bg-amber-400 text-forest-deep font-display text-[13px] font-bold tracking-[0.1em] uppercase active:scale-[0.98] transition disabled:opacity-60"
              >
                {signingOut ? 'Излизане…' : 'Излез и създай нов акаунт'}
              </button>
              <button
                onClick={() => setMode('login')}
                className="w-full min-h-[40px] text-ink-muted text-[12.5px] mt-2 active:text-ink"
              >
                Откажи · продължи с текущия акаунт
              </button>
            </motion.div>
          ) : (
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 mb-4"
          >
            {mode === 'signup' && (
              <input
                type="text"
                autoCapitalize="words"
                autoComplete="name"
                placeholder="име"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={60}
                className="w-full min-h-[52px] bg-forest-card border border-forest-line rounded-2xl px-4 py-3.5 text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(255,106,0,0.10)] transition-all"
                style={{ fontSize: 16 }}
              />
            )}
            <input
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="имейл"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[52px] bg-forest-card border border-forest-line rounded-2xl px-4 py-3.5 text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(255,106,0,0.10)] transition-all"
              style={{ fontSize: 16 }}
            />
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="парола"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[52px] bg-forest-card border border-forest-line rounded-2xl px-4 py-3.5 text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(255,106,0,0.10)] transition-all"
              style={{ fontSize: 16 }}
            />

            {info && (
              <div className="text-[13px] text-accent bg-accent/10 border border-accent/30 rounded-xl px-4 py-2.5 leading-[1.5]">
                {info}
              </div>
            )}

            {error && (
              <div className="text-[13px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 leading-[1.5]">
                {error}
              </div>
            )}

            <Button type="submit" disabled={busy}>
              {busy ? 'Обработваме…' : mode === 'login' ? 'ВЛЕЗ' : 'СЪЗДАЙ АКАУНТ'}
            </Button>
          </motion.form>
          )}

          {mode === 'login' && !blockedByCachedSession && (
            <button
              onClick={handleResetPassword}
              disabled={resetting}
              className="w-full min-h-[40px] text-ink-dim text-[12.5px] active:text-ink-muted mt-2 disabled:opacity-50"
              style={{ touchAction: 'manipulation' }}
            >
              {resetting ? 'Изпращане…' : 'Забравена парола?'}
            </button>
          )}
        </div>
      </div>
    </Screen>
  )
}
