// /report/week — server-derived summary of the current ISO week. No
// new tables; this is a pure read across user_day_completions,
// user_quiz_results, user_badges, user_missions, user_gamification.
// Used as the "Sunday review" surface that gives the user a sense of
// what they've actually moved this week.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Flame, Check, Award, Wind, PenLine, Calendar,
  TrendingUp, Share2
} from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'
import { supabase } from '../lib/supabaseClient.js'
import { getCachedGamification } from '../lib/gamification.js'
import { BADGES_BY_ID } from '../data/badges.js'

function isoWeekStart(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dow = d.getDay() === 0 ? 7 : d.getDay()
  d.setDate(d.getDate() - (dow - 1))
  return d
}

function StatBlock({ icon: Icon, label, value, sub, color = '#FF6A00' }) {
  return (
    <div className="rounded-2xl border border-forest-line bg-forest-card/70 px-4 py-4 flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}1a`, border: `1px solid ${color}55` }}
      >
        <Icon size={15} strokeWidth={2.4} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-ink-dim text-[10px] tracking-[0.14em] uppercase mb-0.5">
          {label}
        </div>
        <div className="font-display font-bold text-ink text-[22px] leading-none tracking-display">
          {value}
        </div>
        {sub && (
          <div className="text-ink-dim text-[11px] mt-0.5 leading-snug">{sub}</div>
        )}
      </div>
    </div>
  )
}

export default function WeeklyReportScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const weekStart = useMemo(() => isoWeekStart(), [])
  const weekStartISO = useMemo(() => weekStart.toISOString().slice(0, 10), [weekStart])

  const [days, setDays] = useState([])
  const [badges, setBadges] = useState([])
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!userId) {
      setLoading(false)
      return
    }
    const since = weekStart.toISOString()
    ;(async () => {
      const [d, b, m] = await Promise.all([
        supabase
          .from('user_day_completions')
          .select('day_number, completed_at')
          .eq('user_id', userId)
          .gte('completed_at', since),
        supabase
          .from('user_badges')
          .select('badge_id, unlocked_at')
          .eq('user_id', userId)
          .gte('unlocked_at', since),
        supabase
          .from('user_missions')
          .select('mission_id, progress, target, completed_at')
          .eq('user_id', userId)
          .eq('week_start', weekStartISO)
      ])
      if (!active) return
      setDays(d.data || [])
      setBadges(b.data || [])
      setMissions(m.data || [])
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [userId, weekStart, weekStartISO])

  const gam = getCachedGamification(userId)
  const completedMissions = missions.filter((mm) => mm.completed_at).length

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 6)
    return d
  }, [weekStart])

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
            Седмичен отчет
          </div>
          <h1 className="font-display font-bold text-ink text-[24px] leading-[1.05] tracking-display uppercase mb-1">
            {weekStart.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}
            {' – '}
            {weekEnd.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}
          </h1>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 rounded-full border border-accent/35 border-t-accent animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 my-5">
              <StatBlock
                icon={Check}
                label="Завършени"
                value={days.length}
                sub={days.length === 1 ? 'ден' : 'дни'}
              />
              <StatBlock
                icon={Flame}
                label="Текущ streak"
                value={gam.current_streak || 0}
                sub="дни поред"
                color="#FFB100"
              />
              <StatBlock
                icon={Award}
                label="Нови значки"
                value={badges.length}
                sub={badges.length === 0 ? '—' : 'отключени'}
                color="#FFD56E"
              />
              <StatBlock
                icon={Calendar}
                label="Мисии"
                value={`${completedMissions}/${missions.length || 3}`}
                sub="завършени"
                color="#3DD68C"
              />
            </div>

            {/* Day-by-day strip */}
            <div className="rounded-3xl border border-forest-line bg-forest-card/70 px-5 py-5 mb-4">
              <div className="font-display text-ink-muted text-[10px] tracking-[0.14em] uppercase mb-3">
                По дни
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'].map((label, idx) => {
                  const d = new Date(weekStart)
                  d.setDate(d.getDate() + idx)
                  const dayDone = days.some((entry) => {
                    const e = new Date(entry.completed_at)
                    return e.getDate() === d.getDate() && e.getMonth() === d.getMonth() && e.getFullYear() === d.getFullYear()
                  })
                  const isFuture = d > new Date()
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <div className="font-display text-ink-dim text-[10px] tracking-[0.14em] uppercase">
                        {label}
                      </div>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                          background: dayDone
                            ? 'rgba(255,106,0,0.18)'
                            : isFuture
                              ? 'rgba(255,255,255,0.03)'
                              : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${dayDone ? 'rgba(255,106,0,0.55)' : 'rgba(255,255,255,0.08)'}`
                        }}
                      >
                        {dayDone ? (
                          <Check size={14} className="text-accent" strokeWidth={2.6} />
                        ) : (
                          <span className="font-display text-ink-dim text-[10px]">{d.getDate()}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {badges.length > 0 && (
              <div className="rounded-3xl border border-forest-line bg-forest-card/70 px-5 py-5 mb-4">
                <div className="font-display text-ink-muted text-[10px] tracking-[0.14em] uppercase mb-3">
                  Постижения тази седмица
                </div>
                <div className="flex flex-col gap-2">
                  {badges.map((b) => {
                    const def = BADGES_BY_ID[b.badge_id]
                    return (
                      <div
                        key={b.badge_id}
                        className="flex items-center gap-3 rounded-2xl border border-forest-line bg-forest-card/60 px-3 py-2.5"
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(255,213,110,0.18)', border: '1px solid rgba(255,213,110,0.45)' }}
                        >
                          <Award size={14} strokeWidth={2.4} className="text-[color:#FFD56E]" />
                        </div>
                        <div className="font-display text-ink text-[13px] font-semibold">
                          {def ? def.title : b.badge_id}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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
