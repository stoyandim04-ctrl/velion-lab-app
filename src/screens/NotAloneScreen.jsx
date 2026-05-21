import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'
import Button from '../components/ui/Button.jsx'
import { ROUTES } from '../lib/routes.js'
import silhouetteImg from '../assets/not-alone.webp'

export default function NotAloneScreen() {
  const navigate = useNavigate()

  return (
    <Screen background="bg-forest-deep">
      <div className="absolute inset-0">
        <img
          src={silhouetteImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/20 via-transparent to-forest-deep" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <Header />

        <div className="flex-1 flex flex-col justify-end px-7 pb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold text-[44px] leading-[1] tracking-display text-ink uppercase mb-5"
          >
            НЕ СИ САМ
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-ink-muted text-base leading-relaxed mb-10 max-w-[330px]"
          >
            Повечето мъже никога не говорят за това. Още по-малко предприемат действия.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Button onClick={() => navigate('/quiz/1')}>Продължи</Button>
          </motion.div>
        </div>
      </div>
    </Screen>
  )
}
