import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/layout/Screen.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'

export default function AuthScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, isAuthenticated } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const redirectTo = location.state?.from && location.state.from !== '/auth'
    ? location.state.from
    : ROUTES.dashboard

  if (isAuthenticated) {
    navigate(redirectTo, { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Имейл и парола са задължителни.')
      return
    }
    if (password.length < 6) {
      setError('Паролата трябва да е поне 6 символа.')
      return
    }
    setBusy(true)
    const fn = mode === 'login' ? signIn : signUp
    const { error: err } = await fn(email.trim(), password)
    setBusy(false)
    if (err) {
      const msg = err.message || 'Възникна грешка.'
      if (/invalid login/i.test(msg)) setError('Грешен имейл или парола.')
      else if (/already registered|already exists/i.test(msg)) setError('Този имейл вече е регистриран. Влез вместо това.')
      else if (/email/i.test(msg) && /valid/i.test(msg)) setError('Невалиден имейл адрес.')
      else setError(msg)
      return
    }
    navigate(redirectTo, { replace: true })
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
              className="w-full min-h-[52px] bg-forest-card border border-forest-line rounded-2xl px-4 py-3.5 text-ink text-base placeholder:text-ink-dim focus:outline-none focus:border-accent/50 transition-colors"
              style={{ fontSize: 16 }}
            />
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="парола"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[52px] bg-forest-card border border-forest-line rounded-2xl px-4 py-3.5 text-ink text-base placeholder:text-ink-dim focus:outline-none focus:border-accent/50 transition-colors"
              style={{ fontSize: 16 }}
            />

            {error && (
              <div className="text-[13px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <Button type="submit" disabled={busy}>
              {busy ? 'Обработваме…' : mode === 'login' ? 'ВЛЕЗ' : 'СЪЗДАЙ АКАУНТ'}
            </Button>
          </motion.form>

          <button
            onClick={() => { setError(''); setMode(mode === 'login' ? 'signup' : 'login') }}
            className="w-full min-h-[44px] text-ink-muted text-[14px] active:text-ink"
            style={{ touchAction: 'manipulation' }}
          >
            {mode === 'login'
              ? 'Нямаш акаунт? Създай нов'
              : 'Вече имаш акаунт? Влез'}
          </button>
        </div>
      </div>
    </Screen>
  )
}
