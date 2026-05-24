import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useOnboarding } from '../state/OnboardingContext.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { PRICE } from '../data/prices.js'
import { ROUTES } from '../lib/routes.js'

// Profile resolution based on quiz answers.
// Q1 = frequency (id 1), Q3 = anxiety (id 3), Q5 = presence (id 5)
const PROFILES = {
  control: {
    name: 'КОНТРОЛ ПРОФИЛ',
    headline: 'ИМАШ НУЖДА ОТ СИСТЕМА, НЕ ОТ СИЛА НА ВОЛЯТА',
    description:
      'Данните показват, че проблемът не е физически. Той е в нервната система и психологията. Velion Lab е проектиран точно за теб.',
    modules: ['I', 'II', 'III', 'V']
  },
  psychology: {
    name: 'ПСИХОЛОГИЯ ПРОФИЛ',
    headline: 'ТРЕВОЖНОСТТА Е ТВОЯТ ИСТИНСКИ ВРАГ',
    description:
      'Performance anxiety е №1 причина. Не техника — психология. 60 дни за да я елиминираш.',
    modules: ['V', 'VI', 'VII']
  },
  presence: {
    name: 'ПРИСЪСТВИЕ ПРОФИЛ',
    headline: 'МЪЖКОТО ПРИСЪСТВИЕ Е УМЕНИЕ. УЧИ СЕ.',
    description:
      'Привличането и увереността не са вродени. Те са система от навици, която ще изградиш.',
    modules: ['VII', 'VIII']
  },
  full: {
    name: 'ЦЯЛОСТЕН ПРОФИЛ',
    headline: 'ИМАШ НУЖДА ОТ ПЪЛНАТА СИСТЕМА',
    description:
      'Данните показват нужда от промяна на всички нива — тяло, психология и присъствие.',
    modules: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
  }
}

function resolveProfile(answers) {
  const q1 = answers[1] // frequency
  const q3 = answers[3] // anxiety
  const q5 = answers[5] // presence

  if (q1 === 'Почти винаги' || q1 === 'Често') return PROFILES.control
  if (q3 === 'Тревожно' || q3 === 'Много тревожно') return PROFILES.psychology
  if (q5 === 'Слабо' || q5 === 'Не знам какво е това') return PROFILES.presence
  return PROFILES.full
}

export default function ResultsScreen() {
  const navigate = useNavigate()
  const { answers } = useOnboarding()
  const { isAuthenticated, hasPaidAccess, accessLoading } = useAuth()
  const profile = useMemo(() => resolveProfile(answers || {}), [answers])

  // If user has already paid, send them straight to dashboard.
  useEffect(() => {
    if (isAuthenticated && !accessLoading && hasPaidAccess) {
      navigate(ROUTES.dashboard, { replace: true })
    }
  }, [isAuthenticated, accessLoading, hasPaidAccess, navigate])

  const handleCta = () => {
    if (!isAuthenticated) {
      // New user landing here from the quiz funnel — default to SIGNUP mode
      // so they see "Create account" form, not "Log in".
      navigate(ROUTES.auth, { state: { from: '/paywall', mode: 'signup' } })
    } else {
      navigate(ROUTES.paywall)
    }
  }

  return (
    <Screen background="bg-forest-deep">
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-6 pt-[max(48px,env(safe-area-inset-top))] pb-[max(28px,env(safe-area-inset-bottom))]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="font-display text-ink-muted text-[10.5px] tracking-[0.18em] uppercase mb-3">
            Твоят Velion профил
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-bold text-accent text-[32px] sm:text-[36px] leading-[1] tracking-display uppercase mb-5"
          >
            {profile.name}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display font-bold text-ink text-[20px] sm:text-[22px] leading-[1.15] tracking-display uppercase mb-5"
          >
            {profile.headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-ink-muted text-[15px] leading-[1.6] mb-8"
          >
            {profile.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mb-8"
          >
            <div className="font-display text-ink-muted text-[10.5px] tracking-[0.18em] uppercase mb-3">
              Фокус области
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.modules.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-accent/10 border border-accent/40 text-accent font-display text-[11px] font-bold tracking-[0.1em] uppercase"
                >
                  Модул {m}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="h-px w-full bg-forest-line my-8" />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <motion.button
              onClick={handleCta}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.15 }}
              className="w-full min-h-[60px] rounded-2xl bg-accent text-forest-deep font-display text-sm font-bold tracking-display uppercase shadow-[0_0_36px_rgba(255,106,0,0.45)] inline-flex items-center justify-center gap-2"
            >
              Вземи достъп — {PRICE.price}
              <ArrowRight size={18} strokeWidth={2.8} />
            </motion.button>
            <p className="text-ink-muted text-[12px] text-center mt-3">
              Lifetime достъп. Еднократно плащане.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </Screen>
  )
}
