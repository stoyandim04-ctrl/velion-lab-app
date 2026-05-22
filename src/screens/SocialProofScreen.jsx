import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'
import Button from '../components/ui/Button.jsx'
import TestimonialCard from '../components/features/TestimonialCard.jsx'
import { TESTIMONIALS, STATS } from '../data/testimonials.js'
import { ROUTES } from '../lib/routes.js'

export default function SocialProofScreen() {
  const navigate = useNavigate()

  return (
    <Screen>
      <Header />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-6 pt-2 pb-[170px]" style={{ WebkitOverflowScrolling: 'touch' }}>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-display font-bold text-[28px] leading-[1.1] tracking-display text-ink uppercase mb-5"
        >
          МЪЖЕ КАТО ТЕБ ВЕЧЕ ЗАПОЧНАХА
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <div className="rounded-2xl border border-forest-line bg-forest-card p-3 text-center">
            <div className="font-display font-bold text-accent text-xl">{STATS.users}</div>
            <div className="text-ink-dim text-[10px] tracking-wider uppercase mt-1">
              мъже
            </div>
          </div>
          <div className="rounded-2xl border border-forest-line bg-forest-card p-3 text-center">
            <div className="font-display font-bold text-accent text-xl flex items-center justify-center gap-1">
              {STATS.rating}
              <Star size={14} strokeWidth={0} className="fill-accent" />
            </div>
            <div className="text-ink-dim text-[10px] tracking-wider uppercase mt-1">
              рейтинг
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
            >
              <TestimonialCard t={t} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-forest-deep via-forest-deep/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <Button onClick={() => navigate(ROUTES.paywall)}>ВИДЯХ ДОСТАТЪЧНО</Button>
        </div>
      </div>
    </Screen>
  )
}
