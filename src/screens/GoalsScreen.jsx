import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'
import Button from '../components/ui/Button.jsx'
import GoalCard from '../components/features/GoalCard.jsx'
import { GOALS } from '../data/goals.js'
import { useOnboarding } from '../state/OnboardingContext.jsx'
import { ROUTES } from '../lib/routes.js'

export default function GoalsScreen() {
  const navigate = useNavigate()
  const { goals, toggleGoal } = useOnboarding()

  return (
    <Screen>
      <Header />

      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-6 pt-2 pb-[140px]">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold text-[28px] leading-[1.1] tracking-display text-ink uppercase mb-3"
        >
          КОЕ ИСКАШ ДА ПОДОБРИШ?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-ink-muted text-sm leading-relaxed mb-7"
        >
          Избери основната си цел. По-късно ще можеш да добавиш още.
        </motion.p>

        <div className="flex flex-col gap-3">
          {GOALS.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
            >
              <GoalCard goal={g} selected={goals.includes(g.id)} onToggle={toggleGoal} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-forest-deep via-forest-deep/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <Button
            onClick={() => navigate(ROUTES.notAlone)}
            disabled={goals.length === 0}
          >
            Продължи
          </Button>
        </div>
      </div>
    </Screen>
  )
}
