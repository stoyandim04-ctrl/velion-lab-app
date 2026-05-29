import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { ROUTES } from '../lib/routes.js'
import { useAuth } from '../state/AuthContext.jsx'
import { addAnalyticsEvent } from '../lib/engagement.js'

// Stripe Payment Links redirect back without ?session_id, so we don't
// try to verify a session id on the frontend. The webhook
// (api/webhooks/stripe.js → checkout.session.completed) writes
// has_paid_access to Supabase. We just poll refreshAccess until that
// becomes true. Custom checkouts that DO pass session_id still work —
// we fast-path verify them via /api/get-session.

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 30000

export default function SuccessScreen() {
  const navigate = useNavigate()
  const { session, user, hasPaidAccess, refreshAccess } = useAuth()
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const [status, setStatus] = useState('loading')
  const analyticsFiredRef = useRef(false)

  // Fast path: if we DO have a session_id (custom checkout flow), verify
  // it server-side once. Successful verification fast-forwards us to
  // hasPaidAccess via refreshAccess, the polling effect then trips to
  // success on the next tick.
  useEffect(() => {
    if (!sessionId) return
    const token = session?.access_token
    if (!token) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/get-session?id=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok || cancelled) return
        await refreshAccess(user?.id)
      } catch {
        // Ignore — polling will still resolve via webhook.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sessionId, session?.access_token, refreshAccess, user?.id])

  // Polling: refresh paid access every 2s until either hasPaidAccess
  // becomes true (webhook landed) or we hit the 30s timeout.
  useEffect(() => {
    if (hasPaidAccess) return
    if (!user?.id) return

    let cancelled = false
    const startedAt = Date.now()

    const tick = async () => {
      if (cancelled) return
      const elapsed = Date.now() - startedAt
      if (elapsed >= POLL_TIMEOUT_MS) {
        if (!cancelled) setStatus('processing')
        return
      }
      const result = await refreshAccess(user.id)
      if (cancelled) return
      if (!result?.hasPaidAccess) {
        setTimeout(tick, POLL_INTERVAL_MS)
      }
    }

    tick()

    return () => {
      cancelled = true
    }
  }, [hasPaidAccess, user?.id, refreshAccess])

  // hasPaidAccess flipped to true → celebrate, then auto-redirect.
  useEffect(() => {
    if (!hasPaidAccess) return
    setStatus('success')
    if (!analyticsFiredRef.current) {
      analyticsFiredRef.current = true
      addAnalyticsEvent(user?.id, 'payment_success', { sessionId: sessionId || null })
    }
    const t = setTimeout(() => navigate(ROUTES.dashboard, { replace: true }), 2800)
    return () => clearTimeout(t)
  }, [hasPaidAccess, sessionId, user?.id, navigate])

  return (
    <Screen>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6"
          >
            <img
              src="/logo/velion-shield.svg"
              alt=""
              className="w-20 h-auto animate-pulse"
            />
            <div className="text-ink-dim text-sm">Активираме достъпа ти…</div>
            <div className="text-ink-dim text-[11px] max-w-[260px] leading-relaxed">
              Това отнема няколко секунди. Не затваряй прозореца.
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <motion.img
              src="/logo/velion-shield.svg"
              alt="Velion Lab"
              className="w-28 h-auto mb-8"
              style={{ filter: 'drop-shadow(0 0 32px rgba(255,106,0,0.5))' }}
              animate={{
                filter: [
                  'drop-shadow(0 0 24px rgba(255,106,0,0.4))',
                  'drop-shadow(0 0 48px rgba(255,106,0,0.7))',
                  'drop-shadow(0 0 24px rgba(255,106,0,0.4))'
                ]
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="font-display text-accent text-[11px] tracking-[0.15em] uppercase mb-3">
              Активирано
            </div>
            <h1 className="font-display font-bold text-[26px] leading-[1.1] tracking-display text-ink uppercase mb-4">
              ДОБРЕ ДОШЪЛ ВЪВ
              <br />
              VELION LAB
            </h1>
            <p className="text-ink-dim text-sm leading-relaxed max-w-xs mb-8">
              Достъпът ти е активиран. Пренасочваме те към твоя първи ден.
            </p>

            <div className="flex items-center gap-2 text-ink-muted text-xs">
              <Check size={14} className="text-accent" />
              <span>Ден 1 е отключен</span>
            </div>
          </motion.div>
        )}

        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 max-w-[320px]"
          >
            <img
              src="/logo/velion-shield.svg"
              alt=""
              className="w-20 h-auto opacity-60"
            />
            <div className="font-display text-ink text-[18px] uppercase tracking-display">
              Плащането се обработва
            </div>
            <p className="text-ink-dim text-[13px] leading-relaxed">
              Stripe потвърждава плащането. Това обикновено отнема под минута. Ще получиш имейл когато
              достъпът е готов. Можеш да обновиш страницата или да се върнеш по-късно.
            </p>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => {
                  setStatus('loading')
                  refreshAccess(user?.id)
                }}
                className="w-full min-h-[48px] rounded-2xl bg-accent text-forest-deep font-display text-[12px] font-bold tracking-display uppercase"
              >
                Провери отново
              </button>
              <button
                onClick={() => navigate(ROUTES.dashboard)}
                className="w-full min-h-[44px] text-ink-muted text-[12.5px] active:text-ink"
              >
                Към таблото
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </Screen>
  )
}
