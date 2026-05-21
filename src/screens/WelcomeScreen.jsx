import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Screen from '../components/layout/Screen.jsx'
import { ROUTES } from '../lib/routes.js'

export default function WelcomeScreen() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')

  const goToDashboard = () => {
    navigate(ROUTES.dashboard)
  }

  return (
    <Screen background="bg-forest-deep">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(255,106,0,0.22) 0%, rgba(255,106,0,0.08) 30%, transparent 65%), #0A0A0A'
        }}
      />

      <div className="relative z-10 flex flex-col h-full justify-end px-7 pb-12 pt-16">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold text-[34px] leading-[1.05] text-ink tracking-display mb-5 uppercase"
        >
          ВРЕМЕ Е ДА ВЗЕМЕШ КОНТРОЛА ОБРАТНО
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-ink-muted text-base leading-relaxed mb-10 max-w-[340px]"
        >
          Персонализирана система за мъже, които искат повече контрол, увереност и
          по-силно присъствие.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3"
        >
          <Button onClick={() => navigate(ROUTES.goals)}>ЗАПОЧНИ</Button>
          <Button variant="ghost" onClick={goToDashboard}>
            ВЕЧЕ ИМАМ АКАУНТ
          </Button>
        </motion.div>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 bg-forest-card border border-forest-line px-5 py-3 rounded-full text-ink text-sm shadow-card"
        >
          {toast}
        </motion.div>
      )}
    </Screen>
  )
}
