import { useEffect, useState } from 'react'
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
  const { signIn, signUp, resetPassword, isAuthenticated, loading, accessLoading, hasPaidAccess } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetting, setResetting] = useState(false)

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

  // After login: wait for paid-access check, then route based on subscription status.
  // - Paid → dashboard (or original intended target)
  // - Not paid → paywall (with clear messaging)
  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) return
    if (accessLoading) return
    if (hasPaidAccess) {
      navigate(intendedTarget || ROUTES.dashboard, { replace: true })
    } else {
      navigate(ROUTES.paywall, { replace: true, state: { from: '/auth' } })
    }
  }, [loading, isAuthenticated, accessLoading, hasPaidAccess, navigate, intendedTarget])

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
      const { data, error: err } = await signUp(trimmedEmail, password)
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
            <p className="text-ink-muted text-[15px] leading-[1.55] mb-8 max-w-[340px]">
              {mode === 'login'
                ? 'Продължи от мястото, на което си спрял. Прогресът ти е запазен.'
                : 'Запиши се за безплатен акаунт. Прогресът ти ще се пази на всяко устройство.'}
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 mb-4"
          >
            <input
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="имейл"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[52px] bg-forest-card border border-forest-line rounded-2xl px-4 py-3.5 text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent/50 transition-colors"
              style={{ fontSize: 16 }}
            />
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="парола"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[52px] bg-forest-card border border-forest-line rounded-2xl px-4 py-3.5 text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent/50 transition-colors"
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

          <button
            onClick={() => { setError(''); setInfo(''); setMode(mode === 'login' ? 'signup' : 'login') }}
            className="w-full min-h-[44px] text-ink-muted text-[14px] active:text-ink"
            style={{ touchAction: 'manipulation' }}
          >
            {mode === 'login'
              ? 'Нямаш акаунт? Създай нов'
              : 'Вече имаш акаунт? Влез'}
          </button>

          {mode === 'login' && (
            <button
              onClick={handleResetPassword}
              disabled={resetting}
              className="w-full min-h-[36px] text-ink-dim text-[12px] active:text-ink-muted mt-1 disabled:opacity-50"
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
