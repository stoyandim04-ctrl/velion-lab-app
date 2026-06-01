// Standalone /breath route. Useful as a Daily Task entry point and a
// general "I need to calm down" quick-action accessible from the
// dashboard. Lets the user pick between 4-7-8 and Box breathing, with
// adjustable cycle counts.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import BreathingGuide from '../components/features/BreathingGuide.jsx'
import { ROUTES } from '../lib/routes.js'
import { useAuth } from '../state/AuthContext.jsx'
import { awardBreathSession } from '../lib/gamification.js'
import { recordMissionSignal } from '../lib/missions.js'

const PRESETS = [
  { id: 'box', label: 'Box · Фокус', sub: 'Вдишай 4 · Задръж 4 · Издишай 4 · Задръж 4' },
  { id: '4-7-8', label: '4-7-8 · Релаксация', sub: 'Вдишай 4 · Задръж 7 · Издишай 8' }
]
const CYCLES = [4, 6, 8]

export default function BreathScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id
  const [pattern, setPattern] = useState('box')
  const [cycles, setCycles] = useState(4)
  const [toast, setToast] = useState('')

  const handleBreathComplete = async () => {
    if (!userId) return
    // best-effort: tally + secret badge + weekly mission credit
    const result = await awardBreathSession(userId)
    if (result?.newBadges && result.newBadges.length > 0) {
      const b = result.newBadges[result.newBadges.length - 1]
      setToast(`Нова значка: ${b.title}`)
    }
    recordMissionSignal(userId, 'breath_sessions').catch(() => {})
    setTimeout(() => setToast(''), 2400)
  }

  return (
    <Screen background="bg-forest-deep">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-5 pt-[max(56px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
        <button
          onClick={() => navigate(ROUTES.dashboard)}
          className="inline-flex items-center gap-1.5 text-ink-muted text-[12px] mb-5 active:text-ink"
        >
          <ArrowLeft size={14} />
          Към таблото
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display font-bold text-ink text-[24px] leading-[1.05] tracking-display uppercase mb-2"
        >
          Дишане
        </motion.h1>
        <p className="text-ink-muted text-[13px] leading-[1.55] mb-5">
          Един от най-бързите начини да върнеш контрола в момент когато не го имаш.
        </p>

        <div className="mb-5">
          <div className="font-display text-ink-dim text-[10px] tracking-[0.14em] uppercase mb-2">
            Шаблон
          </div>
          <div className="flex flex-col gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPattern(p.id)}
                className={[
                  'text-left rounded-2xl px-4 py-3 border transition-all',
                  pattern === p.id
                    ? 'border-accent/60 bg-accent/8 text-ink'
                    : 'border-forest-line bg-forest-card/60 text-ink-muted active:text-ink'
                ].join(' ')}
              >
                <div className="font-display font-bold text-[13px] tracking-[0.06em] uppercase">{p.label}</div>
                <div className="text-[11.5px] mt-0.5">{p.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="font-display text-ink-dim text-[10px] tracking-[0.14em] uppercase mb-2">
            Цикли
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CYCLES.map((c) => (
              <button
                key={c}
                onClick={() => setCycles(c)}
                className={[
                  'rounded-2xl py-2.5 border font-display text-[13px] font-bold tracking-display',
                  cycles === c
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-forest-line bg-forest-card/60 text-ink-muted active:text-ink'
                ].join(' ')}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-forest-line bg-forest-card/60 px-5 py-7 mb-3">
          <BreathingGuide pattern={pattern} cycles={cycles} onComplete={handleBreathComplete} />
        </div>

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-accent font-display text-[12px] tracking-display uppercase text-center"
          >
            {toast}
          </motion.div>
        )}
      </div>
    </Screen>
  )
}
