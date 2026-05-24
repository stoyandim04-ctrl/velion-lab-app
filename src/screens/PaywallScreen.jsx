import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ExternalLink } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'
import Toast from '../components/ui/Toast.jsx'
import { PRICE, PAYWALL_FEATURES } from '../data/prices.js'
import { startCheckout } from '../lib/stripe.js'
import { addAnalyticsEvent } from '../lib/engagement.js'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'
import { READER_MODE, EXTERNAL_BILLING_URL } from '../lib/config.js'
import { openExternalUrl } from '../lib/capacitor.js'

export default function PaywallScreen() {
  const navigate = useNavigate()
  const { user, hasPaidAccess, accessLoading, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isReturningUser = isAuthenticated && !accessLoading && !hasPaidAccess

  useEffect(() => {
    if (!accessLoading && hasPaidAccess) {
      navigate(ROUTES.dashboard, { replace: true })
    }
  }, [accessLoading, hasPaidAccess, navigate])

  const handleCheckout = async () => {
    if (loading) return
    if (!user) {
      navigate(ROUTES.auth, { state: { from: '/paywall' } })
      return
    }
    setError(null)
    setLoading(true)
    try {
      addAnalyticsEvent(user?.id, 'checkout_started', {
        plan: PRICE.id,
        mode: PRICE.mode
      })
      // Prefer the server-side checkout (carries user_id metadata).
      // If priceId env is missing in production, fall back to the static
      // Stripe Payment Link so the user can still pay.
      if (PRICE.priceId) {
        await startCheckout({ priceId: PRICE.priceId, mode: PRICE.mode })
      } else if (PRICE.paymentLink) {
        await openExternalUrl(PRICE.paymentLink)
      } else {
        throw new Error('Stripe price ID или Payment Link не са конфигурирани.')
      }
    } catch (e) {
      setError(e.message || 'Грешка. Опитай отново.')
      setLoading(false)
    }
  }

  return (
    <Screen>
      <Header />

      <Toast message={error} onDismiss={() => setError(null)} />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-6 pt-2 pb-[200px]" style={{ WebkitOverflowScrolling: 'touch' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="font-display text-accent text-[11px] tracking-[0.15em] uppercase mb-3">
            {isReturningUser ? 'Акаунт без активен план' : 'Velion Lab'}
          </div>
          <h1 className="font-display font-bold text-[28px] leading-[1.05] tracking-display text-ink uppercase mb-3">
            {isReturningUser ? 'АКТИВИРАЙ ДОСТЪПА СИ' : 'ЗАПОЧНИ ТРАНСФОРМАЦИЯТА СИ'}
          </h1>
          {isReturningUser && (
            <p className="text-ink-muted text-[13px] leading-[1.55] mb-6">
              Влязъл си в акаунта си, но нямаш активен план. Активирай за да продължиш протокола.
            </p>
          )}
        </motion.div>

        {/* SINGLE PLAN CARD */}
        {!READER_MODE && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative rounded-3xl border border-accent/40 bg-forest-card p-6 mb-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(255,106,0,0.18),transparent_55%)] pointer-events-none" />
            <div className="relative">
              <div className="font-display text-accent text-[11px] tracking-[0.18em] uppercase mb-2 text-center">
                {PRICE.name}
              </div>
              <div className="text-center mb-2">
                <span className="font-display font-bold text-ink text-[60px] leading-none tracking-display">
                  {PRICE.price}
                </span>
              </div>
              <p className="text-ink-muted text-[12px] text-center mb-6">
                {PRICE.subtitle}
              </p>

              <div className="space-y-2.5">
                {PAYWALL_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center flex-shrink-0">
                      <Check size={11} strokeWidth={3} className="text-accent" />
                    </div>
                    <span className="text-ink text-[14px] leading-[1.5]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {READER_MODE && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl border border-forest-line bg-forest-card px-5 py-5 mb-5"
          >
            <div className="font-display text-accent text-[10px] tracking-[0.15em] uppercase mb-2">
              Активация
            </div>
            <p className="text-ink text-[14px] leading-[1.55] mb-3">
              Достъпът до пълния протокол се активира на нашия сайт. Регистрирай се или влез веднъж и приложението автоматично отключва съдържанието на това устройство.
            </p>
            <p className="text-ink-muted text-[12px] leading-[1.55]">
              След активация се връщаш тук без нужда от повторно влизане.
            </p>
          </motion.div>
        )}

        <div className="text-ink-dim text-[11px] text-center mb-6 leading-relaxed">
          {READER_MODE
            ? 'Управлението на достъпа се извършва на velion-lab.vercel.app.'
            : 'Lifetime достъп. Еднократно плащане. Без абонамент. Сигурно плащане през Stripe.'}
        </div>
      </div>

      {/* STICKY BOTTOM CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-forest-deep via-forest-deep/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <motion.button
            onClick={READER_MODE ? () => openExternalUrl(EXTERNAL_BILLING_URL) : handleCheckout}
            disabled={loading && !READER_MODE}
            whileTap={loading ? {} : { scale: 0.97 }}
            whileHover={loading ? {} : { y: -1 }}
            transition={{ duration: 0.15 }}
            className="w-full min-h-[60px] rounded-2xl bg-accent text-forest-deep font-display text-sm font-bold tracking-display uppercase shadow-[0_0_36px_rgba(255,106,0,0.45)] disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {READER_MODE ? (
              <>
                Активирай в браузер
                <ExternalLink size={16} strokeWidth={2.6} />
              </>
            ) : loading ? (
              <>
                <img
                  src="/logo/velion-shield.svg"
                  alt=""
                  className="w-5 h-5 animate-pulse"
                />
                Обработка…
              </>
            ) : !user ? (
              <>
                Регистрирай се и плати
                <ArrowRight size={16} strokeWidth={2.8} />
              </>
            ) : (
              <>
                Вземи достъп — {PRICE.price}
                <ArrowRight size={16} strokeWidth={2.8} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Screen>
  )
}
