import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'
import Button from '../components/ui/Button.jsx'
import { ROUTES } from '../lib/routes.js'
import futureImg from '../assets/future-self.webp'

const POINTS = ['По-малко напрежение.', 'Повече контрол.', 'По-силно присъствие.']

export default function FutureScreen() {
  const navigate = useNavigate()

  return (
    <Screen background="bg-forest-deep">
      <div className="absolute inset-0">
        <img
          src={futureImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/40 via-forest-deep/30 to-forest-deep" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <Header />

        <div className="flex-1 flex flex-col justify-end px-7 pb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display font-bold text-[32px] leading-[1.05] tracking-display text-ink uppercase mb-7"
          >
            ПРЕДСТАВИ СИ НОВО НИВО НА УВЕРЕНОСТ
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-2 mb-10"
          >
            {POINTS.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(255,106,0,0.6)]" />
                <span className="text-ink text-base">{p}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <Button onClick={() => navigate(ROUTES.building)}>Продължи</Button>
          </motion.div>
        </div>
      </div>
    </Screen>
  )
}
