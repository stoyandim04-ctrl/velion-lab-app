import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { BREATHERS } from '../data/quiz.js'
import { ROUTES } from '../lib/routes.js'

function nextRouteAfter(breather) {
  // After breather 1 → Q2; after breather 2 → Q4; after breather 3 → /results
  if (breather.id === 1) return '/quiz/2'
  if (breather.id === 2) return '/quiz/4'
  if (breather.id === 3) return ROUTES.results
  return ROUTES.results
}

export default function BreatherScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const breather = BREATHERS.find((b) => b.id === Number(id))
  const [progress, setProgress] = useState(0)

  // Auto-advance for the final breather (3): show loading dots, then push to /results.
  useEffect(() => {
    if (!breather?.autoAdvance) return
    const duration = breather.loadingMs || 2800
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / duration) * 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(tick)
        navigate(nextRouteAfter(breather), { replace: true })
      }
    }, 60)
    return () => clearInterval(tick)
  }, [breather, navigate])

  if (!breather) {
    return (
      <Screen background="bg-forest-deep">
        <div className="flex-1 flex items-center justify-center text-ink-muted">
          Препращаме те…
        </div>
      </Screen>
    )
  }

  return (
    <Screen background="bg-forest-deep">
      <div className="absolute inset-0">
        <img
          src={breather.image}
          alt=""
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/30 via-[#0A0A0A]/65 to-[#0A0A0A]" />
      </div>

      <div className="relative z-10 flex flex-col h-full px-7 pt-[max(56px,env(safe-area-inset-top))] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="flex-1 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="font-display text-accent text-[11px] tracking-[0.18em] uppercase mb-4">
              Velion Lab
            </div>
            <h1 className="font-display font-bold text-ink text-[34px] sm:text-[38px] leading-[1] tracking-display uppercase mb-5">
              {breather.title}
            </h1>
            <p className="text-ink-muted text-[15px] leading-[1.55] mb-10 max-w-[340px]">
              {breather.subtitle}
            </p>

            {breather.autoAdvance ? (
              <div className="w-full max-w-[340px]">
                <div className="h-1 w-full bg-forest-line/60 rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="h-full bg-accent"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.06 }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted text-[12px]">
                  <span>Изграждаме твоя профил</span>
                  <span className="inline-flex gap-1 ml-1">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      .
                    </motion.span>
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                    >
                      .
                    </motion.span>
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                    >
                      .
                    </motion.span>
                  </span>
                </div>
              </div>
            ) : (
              <motion.button
                onClick={() => navigate(nextRouteAfter(breather))}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-[340px] min-h-[54px] rounded-2xl bg-accent text-forest-deep font-display text-sm font-bold tracking-display uppercase shadow-[0_0_28px_rgba(255,106,0,0.4)] inline-flex items-center justify-center gap-2"
              >
                {breather.cta}
                <ArrowRight size={16} strokeWidth={2.8} />
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </Screen>
  )
}
