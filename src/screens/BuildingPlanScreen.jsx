import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/layout/Screen.jsx'
import { ROUTES } from '../lib/routes.js'
import aiImg from '../assets/ai-plan.webp'

const STAGES = [
  'Анализираме отговорите ти…',
  'Идентифицираме фокус зоните…',
  'Изграждаме персоналната ти система…',
  'Финализираме плана ти…'
]

export default function BuildingPlanScreen() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [stageIdx, setStageIdx] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const duration = 4200
    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / duration) * 100)
      setProgress(pct)
      setStageIdx(Math.min(STAGES.length - 1, Math.floor((pct / 100) * STAGES.length)))
      if (elapsed < duration) {
        requestAnimationFrame(tick)
      } else {
        setTimeout(() => navigate(ROUTES.result), 400)
      }
    }
    requestAnimationFrame(tick)
  }, [navigate])

  return (
    <Screen background="bg-forest-deep">
      <div className="absolute inset-0">
        <img
          src={aiImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/60 via-forest-deep/70 to-forest-deep" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-center px-7">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: [1, 1.08, 1],
          }}
          transition={{
            opacity: { duration: 0.6 },
            scale: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="mx-auto mb-8 w-20 h-20 flex items-center justify-center"
          style={{ filter: 'drop-shadow(0 0 24px rgba(255,106,0,0.5))' }}
        >
          <img src="/logo/velion-shield.svg" alt="" className="w-full h-full" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="font-display font-bold text-[28px] leading-[1.1] tracking-display text-ink uppercase mb-10 text-center"
        >
          СЪЗДАВАМЕ ТВОЯТА СИСТЕМА
        </motion.h1>

        <div className="mb-6 mx-auto w-full max-w-[280px]">
          <div className="h-1 w-full bg-forest-line rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2, ease: 'linear' }}
              className="h-full bg-accent"
            />
          </div>
          <div className="text-center mt-3 font-display font-semibold text-accent text-sm tracking-wider">
            {Math.round(progress)}%
          </div>
        </div>

        <motion.div
          key={stageIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center text-ink-muted text-sm"
        >
          {STAGES[stageIdx]}
        </motion.div>
      </div>
    </Screen>
  )
}
