import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wind, Brain, Activity } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'
import Button from '../components/ui/Button.jsx'
import BreathingOrb from '../components/features/BreathingOrb.jsx'
import { ROUTES } from '../lib/routes.js'

const POINTS = [
  { icon: Wind, label: 'Дишане' },
  { icon: Brain, label: 'Нервна система' },
  { icon: Activity, label: 'Pelvic floor' }
]

export default function EducationScreen() {
  const navigate = useNavigate()

  return (
    <Screen>
      <Header />

      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-6 pt-2 pb-[140px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center my-8"
        >
          <BreathingOrb size={220} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-display font-bold text-[28px] leading-[1.1] tracking-display text-ink uppercase mb-4 text-center"
        >
          КОНТРОЛЪТ НЕ ЗАПОЧВА САМО В УМА
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-ink-muted text-sm leading-relaxed mb-8 text-center max-w-[320px] mx-auto"
        >
          Дишането, нервната система и pelvic floor мускулите играят огромна роля в контрола
          и увереността.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-3 gap-3"
        >
          {POINTS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-forest-line bg-forest-card py-4 flex flex-col items-center gap-2"
            >
              <Icon size={20} className="text-accent" strokeWidth={2} />
              <span className="text-ink-muted text-[11px] tracking-wider uppercase">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-forest-deep via-forest-deep/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <Button onClick={() => navigate(ROUTES.future)}>РАЗБРАХ</Button>
        </div>
      </div>
    </Screen>
  )
}
