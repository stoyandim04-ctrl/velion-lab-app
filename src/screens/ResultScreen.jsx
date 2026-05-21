import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Shield, Activity, TrendingUp } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'
import Button from '../components/ui/Button.jsx'
import { ROUTES } from '../lib/routes.js'

const FOCUS = [
  { icon: Target, label: 'Контрол' },
  { icon: Shield, label: 'Увереност' },
  { icon: Activity, label: 'Нервна система' },
  { icon: TrendingUp, label: 'Ежедневен прогрес' }
]

export default function ResultScreen() {
  const navigate = useNavigate()

  return (
    <Screen>
      <Header />

      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-6 pt-2 pb-[140px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="font-display text-accent text-[11px] tracking-[0.15em] uppercase mb-3">
            Резултат
          </div>
          <h1 className="font-display font-bold text-[32px] leading-[1.05] tracking-display text-ink uppercase mb-4">
            ТВОЯТ ПЛАН Е ГОТОВ
          </h1>
          <p className="text-ink-muted text-sm leading-relaxed mb-7">
            На база на отговорите ти, системата ще се фокусира върху:
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-7">
          {FOCUS.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="rounded-2xl border border-forest-line bg-forest-card p-4"
            >
              <Icon size={22} className="text-accent mb-3" strokeWidth={2} />
              <div className="font-display font-semibold text-ink text-sm tracking-display uppercase">
                {label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="rounded-2xl border border-forest-line bg-forest-card p-5"
        >
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-display font-semibold text-ink text-sm tracking-display uppercase">
              60-дневна система
            </span>
            <span className="font-display font-bold text-accent text-xl">60 дни</span>
          </div>
          <div className="h-1 w-full bg-forest-line rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '8%' }}
              transition={{ duration: 1.2, delay: 0.9 }}
              className="h-full bg-accent"
            />
          </div>
          <div className="text-ink-dim text-xs">Очаквана трансформация · 8–12 седмици</div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-forest-deep via-forest-deep/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <Button onClick={() => navigate(ROUTES.social)}>ПОКАЖИ МИ</Button>
        </div>
      </div>
    </Screen>
  )
}
