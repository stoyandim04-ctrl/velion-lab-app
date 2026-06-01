// /report/month — calendar-month equivalent of the weekly report.
// Shows a 4-5 week heatmap, total days completed, badges earned,
// average control index change if a new quiz was taken.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Award, Flame, TrendingUp } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'
import { supabase } from '../lib/supabaseClient.js'
import { getCachedGamification } from '../lib/gamification.js'

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start, end }
}

export default function MonthlyReportScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id
  const { start, end } = useMemo(() => monthRange(), [])

  const [days, setDays] = useState([])
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!userId) {
      setLoading(false)
      return
    }
    ;(async () => {
      const [d, b] = await Promise.all([
        supabase
          .from('user_day_completions')
          .select('day_number, completed_at')
          .eq('user_id', userId)
          .gte('completed_at', start.toISOString())
          .lte('completed_at', new Date(end.getTime() + 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', userId)
          .gte('unlocked_at', start.toISOString())
      ])
      if (!active) return
      setDays(d.data || [])
      setBadges(b.data || [])
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [userId, start, end])

  const gam = getCachedGamification(userId)
  const completedDates = useMemo(() => {
    const s = new Set()
    for (const d of days) {
      const dt = new Date(d.completed_at)
      s.add(`${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`)
    }
    return s
  }, [days])

  const totalDays = end.getDate()
  const heatmapDays = Array.from({ length: totalDays }, (_, i) => i + 1)

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

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="font-display text-accent text-[10.5px] tracking-[0.18em] uppercase mb-2">
            Месечен отчет
          </div>
          <h1 className="font-display font-bold text-ink text-[24px] leading-[1.05] tracking-display uppercase mb-5">
            {start.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}
          </h1>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 rounded-full border border-accent/35 border-t-accent animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="rounded-2xl border border-forest-line bg-forest-card/70 px-3 py-3">
                <div className="font-display text-ink-dim text-[9.5px] tracking-[0.14em] uppercase mb-1">Дни</div>
                <div className="font-display font-bold text-accent text-[22px] leading-none">
                  {completedDates.size}<span className="text-ink-dim text-[12px] ml-1">/{totalDays}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-forest-line bg-forest-card/70 px-3 py-3">
                <div className="font-display text-ink-dim text-[9.5px] tracking-[0.14em] uppercase mb-1">Streak</div>
                <div className="font-display font-bold text-accent text-[22px] leading-none flex items-center gap-1">
                  {gam.current_streak || 0}<Flame size={14} className="text-accent" />
                </div>
              </div>
              <div className="rounded-2xl border border-forest-line bg-forest-card/70 px-3 py-3">
                <div className="font-display text-ink-dim text-[9.5px] tracking-[0.14em] uppercase mb-1">Значки</div>
                <div className="font-display font-bold text-accent text-[22px] leading-none flex items-center gap-1">
                  {badges.length}<Award size={14} className="text-accent" />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-forest-line bg-forest-card/70 px-5 py-5 mb-4">
              <div className="font-display text-ink-muted text-[10px] tracking-[0.14em] uppercase mb-3">
                Хийтмап
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {heatmapDays.map((day) => {
                  const dt = new Date(start.getFullYear(), start.getMonth(), day)
                  const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`
                  const done = completedDates.has(key)
                  const isFuture = dt > new Date()
                  return (
                    <div
                      key={day}
                      className="aspect-square rounded-md flex items-center justify-center"
                      style={{
                        background: done
                          ? 'rgba(255,106,0,0.5)'
                          : isFuture
                            ? 'rgba(255,255,255,0.02)'
                            : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${done ? 'rgba(255,106,0,0.7)' : 'rgba(255,255,255,0.06)'}`,
                        boxShadow: done ? '0 0 6px rgba(255,106,0,0.5)' : undefined
                      }}
                    >
                      {done ? (
                        <Check size={9} className="text-forest-deep" strokeWidth={3} />
                      ) : (
                        <span className="font-display text-ink-dim text-[9px]">{day}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              onClick={() => navigate(ROUTES.history)}
              className="w-full rounded-2xl border border-forest-line bg-forest-card/60 text-ink font-display text-[12px] font-bold tracking-display uppercase px-5 py-3.5 inline-flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <TrendingUp size={14} strokeWidth={2.5} />
              Виж пълна история
            </button>
          </>
        )}
      </div>
    </Screen>
  )
}
