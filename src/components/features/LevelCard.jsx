// Compact gamification strip for the dashboard.
//   ┌──────────────────────────────────────────┐
//   │  LVL  3   ████████░░░░░░  Streak 🔥  5    │
//   │         620 / 850 XP                       │
//   └──────────────────────────────────────────┘
//
// Reads cache synchronously on mount, then refreshes from Supabase in
// the background. Tap navigates to /stats for the deep view.

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Zap } from 'lucide-react'
import {
  fetchGamification,
  getCachedGamification,
  progressWithinLevel,
  MAX_LEVEL
} from '../../lib/gamification.js'

export default function LevelCard({ userId, onTap }) {
  const [state, setState] = useState(() => getCachedGamification(userId))

  useEffect(() => {
    let active = true
    if (!userId) return
    fetchGamification(userId).then((next) => {
      if (active) setState(next)
    })
    return () => {
      active = false
    }
  }, [userId])

  const level = state.level || 1
  const xp = state.xp || 0
  const progress = progressWithinLevel(xp, level)
  const streak = state.current_streak || 0

  return (
    <motion.button
      type="button"
      onClick={onTap}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.12 }}
      whileTap={{ scale: 0.98 }}
      className="w-full mb-3 rounded-2xl border border-forest-line bg-forest-card/70 px-4 py-3 text-left active:bg-forest-card relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_50%,rgba(255,106,0,0.18),transparent_55%)]" />

      <div className="relative flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255,106,0,0.22), rgba(255,106,0,0.06))',
            border: '1px solid rgba(255,106,0,0.4)',
            boxShadow: '0 0 18px rgba(255,106,0,0.25)'
          }}
        >
          <Zap size={14} className="absolute top-1 right-1 text-accent/80" strokeWidth={2.5} />
          <span className="font-display font-bold text-accent text-[16px] leading-none">
            {level}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div className="font-display font-bold text-ink text-[12px] tracking-[0.1em] uppercase">
              Ниво {level}{level >= MAX_LEVEL ? ' · MAX' : ''}
            </div>
            <div className="font-display text-ink-dim text-[10.5px]">
              {progress.atMax ? `${xp} XP` : `${progress.into} / ${progress.span} XP`}
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-forest-line overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: progress.atMax ? '100%' : `${progress.pct}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-accent"
              style={{ boxShadow: '0 0 8px rgba(255,106,0,0.5)' }}
            />
          </div>
        </div>

        {streak > 0 && (
          <div className="flex flex-col items-center pl-3 ml-1 border-l border-forest-line/60 flex-shrink-0">
            <div className="inline-flex items-center gap-1">
              <Flame size={14} className="text-accent" strokeWidth={2.5} />
              <span className="font-display font-bold text-accent text-[14px] leading-none">
                {streak}
              </span>
            </div>
            <div className="font-display text-ink-dim text-[9px] tracking-[0.12em] uppercase mt-1">
              Streak
            </div>
          </div>
        )}
      </div>
    </motion.button>
  )
}
