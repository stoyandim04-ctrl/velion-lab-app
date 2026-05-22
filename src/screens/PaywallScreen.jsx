import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'
import Button from '../components/ui/Button.jsx'
import PriceCard from '../components/features/PriceCard.jsx'
import Toast from '../components/ui/Toast.jsx'
import { PLANS, PAYWALL_FEATURES } from '../data/prices.js'
import { startCheckout } from '../lib/stripe.js'
import { addAnalyticsEvent } from '../lib/engagement.js'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'

export default function PaywallScreen() {
  const navigate = useNavigate()
  const { user, hasPaidAccess, accessLoading } = useAuth()
  const [selected, setSelected] = useState('lifetime')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const plan = PLANS.find((p) => p.id === selected)

  useEffect(() => {
    if (!accessLoading && hasPaidAccess) {
      navigate(ROUTES.dashboard, { replace: true })
    }
  }, [accessLoading, hasPaidAccess, navigate])

  const handleCheckout = async () => {
    if (!plan || loading) return
    setError(null)
    setLoading(true)
    try {
      addAnalyticsEvent(user?.id, 'checkout_started', {
        plan: plan.id,
        mode: plan.mode
      })
      await startCheckout({ priceId: plan.priceId, mode: plan.mode })
    } catch (e) {
      setError(e.message || 'Грешка. Опитай отново.')
      setLoading(false)
    }
  }

  return (
    <Screen>
      <Header />

      <Toast message={error} onDismiss={() => setError(null)} />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-6 pt-2 pb-[190px]" style={{ WebkitOverflowScrolling: 'touch' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="font-display text-accent text-[11px] tracking-[0.15em] uppercase mb-3">
            Velion Lab
          </div>
          <h1 className="font-display font-bold text-[28px] leading-[1.05] tracking-display text-ink uppercase mb-6">
            ЗАПОЧНИ ТРАНСФОРМАЦИЯТА СИ
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-2 mb-7"
        >
          {PAYWALL_FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-3">
              <div className="w-5 h-5 mt-0.5 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} className="text-accent" />
              </div>
              <span className="text-ink text-sm leading-relaxed">{f}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col gap-3 mb-5"
        >
          {PLANS.map((p) => (
            <PriceCard
              key={p.id}
              plan={p}
              selected={selected === p.id}
              onSelect={() => setSelected(p.id)}
            />
          ))}
        </motion.div>

        <div className="text-ink-dim text-[11px] text-center mb-6 leading-relaxed">
          Отмени по всяко време. Без скрити такси. Сигурно плащане през Stripe.
        </div>

        <div className="flex justify-center opacity-50">
          <img src="/logo/logo.webp" alt="Velion Lab" className="w-24 h-auto" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-forest-deep via-forest-deep/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <Button onClick={handleCheckout} disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <img
                  src="/logo/velion-shield.svg"
                  alt=""
                  className="w-5 h-5 animate-pulse"
                />
                ОБРАБОТКА…
              </span>
            ) : (
              'ПРОДЪЛЖИ КЪМ ПЛАЩАНЕ'
            )}
          </Button>
        </div>
      </div>
    </Screen>
  )
}
