// /stats — Лична статистика. Everything we already know about the
// authenticated user in one screen:
//   - Control Index (latest + initial baseline if both exist → delta)
//   - Day completion progress (count, percent, days remaining)
//   - Module progress (which modules unlocked, current module focus)
//   - Streak data from engagement cache (current + longest)
//
// Data sources are all existing — no new DB tables, no new server calls
// beyond fetchLatestQuizResult which the dashboard widget already does.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Flame, Target, TrendingUp } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'
import { buildDays, MODULES, TOTAL_DAYS } from '../data/course.js'
import { getDayProgress } from '../lib/courseProgress.js'
import { getCachedEngagement } from '../lib/engagement.js'
import { TIERS } from '../lib/controlIndex.js'
import { supabase } from '../lib/supabaseClient.js'

function StatTile({ label, value, sub, color }) {
  return (
    <div className="rounded-2xl border border-forest-line bg-forest-card/70 px-4 py-4">
      <div className="font-display text-ink-muted text-[10px] tracking-[0.14em] uppercase mb-1.5">
        {label}
      </div>
      <div
        className="font-display font-bold text-[28px] leading-none tracking-display"
        style={{ color: color || '#F5F1EA' }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-ink-dim text-[11px] mt-1.5 leading-snug">{sub}</div>
      )}
    </div>
  )
}

function DeltaPill({ delta }) {
  if (delta === null || delta === undefined) return null
  const positive = delta > 0
  const neutral = delta === 0
  const color = neutral ? '#9CA3AF' : positive ? '#3DD68C' : '#FF4D2A'
  const sign = positive ? '+' : ''
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-display font-bold tracking-[0.05em]"
      style={{ color, background: `${color}1a`, border: `1px solid ${color}44` }}
    >
      <TrendingUp size={11} strokeWidth={2.5} />
      {sign}{delta}
    </span>
  )
}

export default function StatsScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const [results, setResults] = useState({ initial: null, latest: null, loading: true })

  useEffect(() => {
    let active = true
    if (!userId) {
      setResults({ initial: null, latest: null, loading: false })
      return
    }
    ;(async () => {
      const { data } = await supabase
        .from('user_quiz_results')
        .select('id, kind, score, tier, taken_at')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false })
        .limit(10)
      if (!active) return
      const rows = data || []
      const initial = rows.find((r) => r.kind === 'initial') || null
      const latest = rows[0] || null
      setResults({ initial, latest, loading: false })
    })()
    return () => {
      active = false
    }
  }, [userId])

  const engagement = useMemo(() => getCachedEngagement(userId), [userId])
  const days = useMemo(
    () => buildDays((n) => getDayProgress(userId, n)),
    [userId]
  )

  const completedCount = days.filter((d) => d.status === 'completed' && d.day > 0).length
  const remaining = TOTAL_DAYS - completedCount
  const progressPct = Math.round((completedCount / TOTAL_DAYS) * 100)
  const streakCount = engagement?.streak?.count || 0
  const longestStreak = engagement?.streak?.longest || streakCount

  const completedModules = MODULES.filter((m) => {
    const lastDay = m.range[1]
    return days.some((d) => d.day === lastDay && d.status === 'completed')
  }).length

  const currentModule = MODULES.find((m) => {
    const next = Math.min(TOTAL_DAYS, completedCount + 1)
    return next >= m.range[0] && next <= m.range[1]
  }) || MODULES[0]

  const indexTier = results.latest ? TIERS[results.latest.tier] || null : null
  const delta = results.initial && results.latest && results.initial.id !== results.latest.id
    ? results.latest.score - results.initial.score
    : null

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
          className="font-display font-bold text-ink text-[24px] leading-[1.05] tracking-display uppercase mb-5"
        >
          Лична статистика
        </motion.h1>

        {/* CONTROL INDEX BLOCK */}
        {results.loading ? null : results.latest ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-3xl border border-forest-line bg-forest-card/70 px-5 py-5 mb-4 relative overflow-hidden"
            style={{ boxShadow: indexTier ? `inset 0 0 0 1px ${indexTier.color}22` : undefined }}
          >
            {indexTier && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 90% 0%, ${indexTier.color}1a, transparent 65%)` }}
              />
            )}
            <div className="relative flex items-start justify-between mb-3">
              <div>
                <div className="font-display text-[10px] tracking-[0.14em] uppercase text-ink-muted mb-1">
                  Контрол индекс
                </div>
                <div
                  className="font-display font-bold text-[44px] leading-none tracking-display"
                  style={{ color: indexTier?.color || '#F5F1EA' }}
                >
                  {results.latest.score}
                  <span className="text-ink-dim text-[14px] ml-1.5 font-semibold">/100</span>
                </div>
              </div>
              {delta !== null && <DeltaPill delta={delta} />}
            </div>
            {indexTier && (
              <div
                className="inline-block px-3 py-1 rounded-full font-display text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                style={{
                  color: indexTier.color,
                  borderColor: `${indexTier.color}66`,
                  border: '1px solid',
                  background: `${indexTier.color}10`
                }}
              >
                {indexTier.label}
              </div>
            )}
            {results.initial && delta !== null && (
              <div className="text-ink-dim text-[11.5px] mt-2 leading-snug">
                Стартов резултат: <span className="text-ink">{results.initial.score}/100</span>
                {delta > 0 && <> · подобрение с <span className="text-[color:#3DD68C] font-semibold">+{delta}</span></>}
              </div>
            )}
          </motion.div>
        ) : null}

        {/* TOP STATS GRID */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <StatTile
            label="Прогрес"
            value={`${progressPct}%`}
            sub={`${completedCount} от ${TOTAL_DAYS} дни`}
            color="#FF6A00"
          />
          <StatTile
            label="Streak"
            value={
              <span className="inline-flex items-center gap-1.5">
                {streakCount}
                <Flame size={20} className="text-accent" />
              </span>
            }
            sub={longestStreak > streakCount ? `Най-дълъг: ${longestStreak}` : 'Поредни дни'}
          />
          <StatTile
            label="Завършени модули"
            value={`${completedModules}/${MODULES.length}`}
            sub={completedModules === MODULES.length ? 'Всички готови' : `Сега в Модул ${currentModule.id}`}
          />
          <StatTile
            label="Остават"
            value={remaining}
            sub={remaining === 0 ? 'Завърши протокола' : remaining === 1 ? 'ден до края' : 'дни до края'}
          />
        </motion.div>

        {/* MODULES STRIP */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-3xl border border-forest-line bg-forest-card/70 px-5 py-5 mb-4"
        >
          <div className="font-display text-ink-muted text-[10px] tracking-[0.14em] uppercase mb-3">
            Модули
          </div>
          <div className="space-y-2">
            {MODULES.map((m) => {
              const moduleDays = days.filter((d) => d.day >= m.range[0] && d.day <= m.range[1])
              const moduleCompleted = moduleDays.filter((d) => d.status === 'completed').length
              const moduleTotal = m.range[1] - m.range[0] + 1
              const moduleProgressPct = Math.round((moduleCompleted / moduleTotal) * 100)
              const isCurrent = currentModule.id === m.id
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3"
                  style={{ opacity: moduleCompleted === 0 && !isCurrent ? 0.6 : 1 }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-[12px] flex-shrink-0"
                    style={{
                      background: moduleCompleted === moduleTotal
                        ? 'rgba(61,214,140,0.18)'
                        : isCurrent
                          ? 'rgba(255,106,0,0.18)'
                          : 'rgba(255,255,255,0.05)',
                      color: moduleCompleted === moduleTotal
                        ? '#3DD68C'
                        : isCurrent
                          ? '#FF6A00'
                          : '#9CA3AF',
                      border: '1px solid currentColor'
                    }}
                  >
                    {m.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-display font-semibold text-ink text-[13px] truncate">
                        {m.title}
                      </div>
                      <div className="font-display text-ink-muted text-[11px] flex-shrink-0">
                        {moduleCompleted}/{moduleTotal}
                      </div>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-forest-line overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${moduleProgressPct}%`,
                          background: moduleCompleted === moduleTotal
                            ? '#3DD68C'
                            : '#FF6A00'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* RETAKE QUIZ CTA */}
        {results.latest && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate('/quiz/1')}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-2xl border border-accent/40 bg-accent/5 text-accent font-display text-[12px] font-bold tracking-display uppercase px-5 py-3.5 inline-flex items-center justify-center gap-2"
          >
            <Target size={14} strokeWidth={2.5} />
            Пресметни отново
          </motion.button>
        )}
      </div>
    </Screen>
  )
}
