import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import Toast from '../components/ui/Toast.jsx'
import { ROUTES } from '../lib/routes.js'
import { useAuth } from '../state/AuthContext.jsx'
import { addAnalyticsEvent } from '../lib/engagement.js'

export default function SuccessScreen() {
  const navigate = useNavigate()
  const { session, user, refreshAccess } = useAuth()
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setError('Липсва session ID. Опитай отново.')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const token = session?.access_token
        if (!token) throw new Error('Влез в акаунта си, за да потвърдим плащането.')

        const res = await fetch(`/api/get-session?id=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Не можахме да потвърдим плащането')
        const data = await res.json()
        if (cancelled) return

        const isPaid =
          data.payment_status === 'paid' ||
          (data.mode === 'subscription' && data.status === 'complete')

        if (!isPaid || !data.has_access) {
          setStatus('error')
          setError('Плащането все още не е потвърдено. Провери имейла си.')
          return
        }

        await refreshAccess(user?.id)
        addAnalyticsEvent(user?.id, 'payment_success', {
          sessionId: data.id,
          mode: data.mode,
          amount: data.amount_total,
          currency: data.currency
        })

        setStatus('success')
      } catch (e) {
        if (cancelled) return
        setStatus('error')
        setError(e.message || 'Грешка при потвърждение.')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [sessionId, session?.access_token, refreshAccess, user?.id])

  useEffect(() => {
    if (status !== 'success') return
    const t = setTimeout(() => navigate(ROUTES.dashboard), 3000)
    return () => clearTimeout(t)
  }, [status, navigate])

  return (
    <Screen>
      <Toast message={error} onDismiss={() => setError(null)} />

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
            <div className="text-ink-dim text-sm">Потвърждаваме плащането…</div>
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

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="font-display text-ink text-lg uppercase">
              Нещо се обърка
            </div>
            <button
              onClick={() => navigate(ROUTES.paywall)}
              className="text-accent text-sm underline underline-offset-4"
            >
              Назад към плановете
            </button>
          </motion.div>
        )}
      </div>
    </Screen>
  )
}
