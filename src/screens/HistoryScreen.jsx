// /history — chronological timeline of every milestone the user has
// hit so far. Sources: user_quiz_results (initial / final / retake),
// user_day_completions (day finished), user_badges (badge unlocks),
// user_missions (mission completions). Sorted desc by timestamp.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Target, Check, Award, Star, TrendingUp } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'
import { supabase } from '../lib/supabaseClient.js'
import { BADGES_BY_ID } from '../data/badges.js'
import { MISSIONS_BY_ID } from '../data/missions.js'

const TYPE_META = {
  quiz: { icon: Target, label: 'Контрол индекс', color: '#FF6A00' },
  day: { icon: Check, label: 'Ден завършен', color: '#3DD68C' },
  badge: { icon: Award, label: 'Постижение', color: '#FFD56E' },
  mission: { icon: Star, label: 'Седмична мисия', color: '#FF6A00' }
}

function formatRel(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const dayMs = 24 * 60 * 60 * 1000
  if (diffMs < dayMs) return 'днес'
  if (diffMs < dayMs * 2) return 'вчера'
  const days = Math.floor(diffMs / dayMs)
  if (days < 7) return `преди ${days} дни`
  return d.toLocaleDateString('bg-BG')
}

export default function HistoryScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!userId) {
      setLoading(false)
      return
    }
    ;(async () => {
      const [quizes, days, badges, missions] = await Promise.all([
        supabase
          .from('user_quiz_results')
          .select('id, kind, score, taken_at')
          .eq('user_id', userId)
          .order('taken_at', { ascending: false })
          .limit(30),
        supabase
          .from('user_day_completions')
          .select('day_number, completed_at')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(60),
        supabase
          .from('user_badges')
          .select('badge_id, unlocked_at')
          .eq('user_id', userId)
          .order('unlocked_at', { ascending: false })
          .limit(30),
        supabase
          .from('user_missions')
          .select('mission_id, completed_at, week_start')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(20)
      ])
      if (!active) return
      const combined = []
      for (const q of quizes.data || []) {
        const label = q.kind === 'initial' ? 'Стартов индекс' : q.kind === 'final' ? 'Финален индекс' : 'Преизчисляване'
        combined.push({
          type: 'quiz',
          title: `${label} · ${q.score}/100`,
          when: q.taken_at,
          key: `q-${q.id}`
        })
      }
      for (const d of days.data || []) {
        combined.push({
          type: 'day',
          title: `Ден ${d.day_number}`,
          when: d.completed_at,
          key: `d-${d.day_number}`
        })
      }
      for (const b of badges.data || []) {
        const def = BADGES_BY_ID[b.badge_id]
        combined.push({
          type: 'badge',
          title: def ? def.title : b.badge_id,
          when: b.unlocked_at,
          key: `b-${b.badge_id}`
        })
      }
      for (const m of missions.data || []) {
        const def = MISSIONS_BY_ID[m.mission_id]
        combined.push({
          type: 'mission',
          title: def ? def.title : m.mission_id,
          when: m.completed_at,
          key: `m-${m.mission_id}-${m.week_start}`
        })
      }
      combined.sort((a, b) => new Date(b.when) - new Date(a.when))
      setEvents(combined)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [userId])

  const grouped = useMemo(() => {
    const buckets = []
    let currentLabel = null
    let currentItems = []
    for (const e of events) {
      const d = new Date(e.when)
      const label = d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })
      if (label !== currentLabel) {
        if (currentLabel) buckets.push({ label: currentLabel, items: currentItems })
        currentLabel = label
        currentItems = []
      }
      currentItems.push(e)
    }
    if (currentLabel) buckets.push({ label: currentLabel, items: currentItems })
    return buckets
  }, [events])

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
          История на напредъка
        </motion.h1>
        <p className="text-ink-muted text-[13px] leading-[1.55] mb-5">
          Всеки ден, всяка значка, всеки тест — на едно място.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 rounded-full border border-accent/35 border-t-accent animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-forest-line bg-forest-card/60 px-5 py-8 text-center">
            <TrendingUp size={22} className="mx-auto text-ink-dim mb-3" />
            <div className="font-display text-ink text-[14px] tracking-display uppercase mb-1">Все още няма данни</div>
            <div className="text-ink-muted text-[12.5px] leading-[1.5]">
              Завърши първия ден или направи Контрол индекс, за да започне историята.
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map((bucket) => (
              <div key={bucket.label}>
                <div className="font-display text-ink-dim text-[10px] tracking-[0.16em] uppercase mb-2">
                  {bucket.label}
                </div>
                <div className="space-y-2">
                  {bucket.items.map((e) => {
                    const meta = TYPE_META[e.type] || TYPE_META.day
                    const Icon = meta.icon
                    return (
                      <motion.div
                        key={e.key}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-2xl border border-forest-line bg-forest-card/60 px-4 py-3 flex items-center gap-3"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `${meta.color}1a`,
                            border: `1px solid ${meta.color}44`
                          }}
                        >
                          <Icon size={15} strokeWidth={2.4} style={{ color: meta.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-ink text-[13px] font-semibold tracking-[0.04em] truncate">
                            {e.title}
                          </div>
                          <div className="font-display text-ink-dim text-[10.5px] tracking-[0.06em] uppercase mt-0.5">
                            {meta.label} · {formatRel(e.when)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Screen>
  )
}
