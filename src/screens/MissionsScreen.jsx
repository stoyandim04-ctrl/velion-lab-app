// /missions — weekly mission board. Auto-issues the three weekly
// missions on first render of the week, then shows progress bars +
// XP reward chips. Tapping a completed mission gives a celebratory
// shimmer; tapping an in-progress mission shows the source of the
// progress signal so the user knows what to do next.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, CalendarCheck, Wind, PenLine, Check, Zap
} from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'
import { MISSIONS_BY_ID } from '../data/missions.js'
import { ensureWeeklyMissions } from '../lib/missions.js'

const ICONS = {
  'calendar-check': CalendarCheck,
  wind: Wind,
  'pen-line': PenLine
}

export default function MissionsScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!userId) {
      setLoading(false)
      return
    }
    ensureWeeklyMissions(userId).then((rows) => {
      if (active) {
        setMissions(rows)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [userId])

  const completedCount = missions.filter((m) => m.completed_at).length

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
          className="font-display font-bold text-ink text-[24px] leading-[1.05] tracking-display uppercase mb-1"
        >
          Седмични мисии
        </motion.h1>
        <p className="text-ink-muted text-[13px] leading-[1.55] mb-5">
          Три малки цели за седмицата. Изпълниш ли ги — допълнителен XP към твоето ниво.
        </p>

        <div className="font-display text-accent text-[10.5px] tracking-[0.16em] uppercase mb-3">
          Прогрес · {completedCount}/{missions.length}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-7 w-7 rounded-full border border-accent/35 border-t-accent animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {missions.map((row, idx) => {
              const def = MISSIONS_BY_ID[row.mission_id]
              if (!def) return null
              const Icon = ICONS[def.icon] || CalendarCheck
              const pct = Math.min(100, Math.round((row.progress / row.target) * 100))
              const completed = !!row.completed_at
              return (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="rounded-3xl border border-forest-line bg-forest-card/70 px-5 py-4 relative overflow-hidden"
                  style={{
                    boxShadow: completed ? '0 0 0 1px rgba(61,214,140,0.35)' : undefined
                  }}
                >
                  {completed && (
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_90%_50%,rgba(61,214,140,0.16),transparent_60%)]" />
                  )}
                  <div className="relative flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: completed ? 'rgba(61,214,140,0.18)' : 'rgba(255,106,0,0.14)',
                        border: `1px solid ${completed ? 'rgba(61,214,140,0.45)' : 'rgba(255,106,0,0.4)'}`
                      }}
                    >
                      {completed ? (
                        <Check size={18} strokeWidth={2.5} className="text-[color:#3DD68C]" />
                      ) : (
                        <Icon size={16} strokeWidth={2.4} className="text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3 mb-0.5">
                        <div className="font-display font-bold text-ink text-[13.5px] tracking-display uppercase leading-[1.2]">
                          {def.title}
                        </div>
                        <div className="inline-flex items-center gap-1 font-display text-accent text-[11px] font-bold tracking-[0.1em]">
                          <Zap size={11} strokeWidth={2.5} />
                          +{def.reward_xp}
                        </div>
                      </div>
                      <div className="text-ink-muted text-[12px] leading-[1.4] mb-2">
                        {def.description}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-forest-line overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full"
                            style={{ background: completed ? '#3DD68C' : '#FF6A00' }}
                          />
                        </div>
                        <div className="font-display text-ink-dim text-[10.5px] tracking-[0.06em]">
                          {row.progress}/{row.target}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </Screen>
  )
}
