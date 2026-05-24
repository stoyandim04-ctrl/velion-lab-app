import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import ProgressBar from '../components/layout/ProgressBar.jsx'
import ProfileButton from '../components/features/ProfileButton.jsx'
import ProfileDrawer from '../components/features/ProfileDrawer.jsx'
import { buildDays, MODULES, TOTAL_DAYS } from '../data/course.js'
import { getDayProgress } from '../lib/courseProgress.js'
import { getDayData } from '../data/days.js'
import { getCachedProfile, fetchProfile } from '../lib/profile.js'
import { getCachedEngagement, addAnalyticsEvent } from '../lib/engagement.js'
import { useAuth } from '../state/AuthContext.jsx'
import { pullToLocal } from '../lib/progressSync.js'
import { ROUTES } from '../lib/routes.js'

const EMPTY_PROFILE = { name: '', avatar: '', createdAt: null }

function getContinueDay(days, engagement) {
  const lastOpened = Number(engagement?.lastOpenedDay || 0)
  const lastOpenedDay = days.find((day) => day.day === lastOpened)
  if (lastOpenedDay && lastOpenedDay.status !== 'locked') return lastOpened
  const active = days.find((day) => day.status === 'active' && day.day > 0)
  if (active) return active.day
  const completed = days.filter((day) => day.status === 'completed' && day.day > 0)
  const next = completed.length + 1
  return Math.min(TOTAL_DAYS, Math.max(1, next))
}

function getModuleForDay(dayNumber) {
  return (
    MODULES.find((m) => dayNumber >= m.range[0] && dayNumber <= m.range[1]) ||
    MODULES[0]
  )
}

export default function DashboardScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profile, setProfileState] = useState(EMPTY_PROFILE)
  const [engagement, setEngagement] = useState(() => getCachedEngagement(userId))
  const [ready, setReady] = useState(false)
  const [syncTick, setSyncTick] = useState(0)

  useEffect(() => {
    setReady(false)
    setProfileState(userId ? getCachedProfile(userId) : EMPTY_PROFILE)
    setEngagement(userId ? getCachedEngagement(userId) : getCachedEngagement(null))
    setSyncTick((t) => t + 1)

    if (!userId) return

    let active = true
    ;(async () => {
      const [, fresh] = await Promise.all([
        pullToLocal(userId),
        fetchProfile(userId)
      ])
      if (!active) return
      setProfileState(fresh)
      setEngagement(getCachedEngagement(userId))
      setReady(true)
      setSyncTick((t) => t + 1)
    })()

    return () => {
      active = false
    }
  }, [userId])

  const days = useMemo(
    () => buildDays((n) => getDayProgress(userId, n)),
    [userId, syncTick]
  )
  const completed = days.filter((d) => d.status === 'completed' && d.day > 0).length
  const completedDaysList = days.filter((d) => d.status === 'completed' && d.day > 0)
  const lockedCount = days.filter((d) => d.status === 'locked' && d.day > 0).length
  const progressPct = Math.round((completed / TOTAL_DAYS) * 100)
  const continueDay = getContinueDay(days, engagement)
  const continueData = getDayData(continueDay)
  const currentModule = getModuleForDay(continueDay)
  const streakCount = engagement?.streak?.count || 0
  const nextDay = Math.min(TOTAL_DAYS, completed + 1)

  if (!ready) {
    return (
      <Screen background="bg-forest-deep">
        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <div>
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border border-accent/35 border-t-accent animate-spin" />
            <div className="font-display text-[11px] uppercase tracking-[0.16em] text-accent">
              Подготвяме протокола
            </div>
          </div>
        </div>
      </Screen>
    )
  }

  if (ready && !engagement.onboardingCompleted) {
    return <Navigate to={ROUTES.dailyOnboarding} replace />
  }

  const goToDay = () => {
    addAnalyticsEvent(userId, 'continue_tapped', {
      dayNumber: continueDay,
      source: 'card_continue'
    })
    navigate(`/course/day-${continueDay}`)
  }

  const goToDays = () => {
    navigate(ROUTES.days)
  }

  return (
    <Screen background="bg-forest-deep">
      <div className="px-5 pt-[max(56px,env(safe-area-inset-top))] pb-3 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-display font-semibold text-accent text-[10px] tracking-[0.15em] uppercase">
              Velion Lab
            </div>
            <div className="font-display font-bold text-ink text-[19px] tracking-display uppercase mt-1.5 leading-[1.15]">
              Твоят протокол
            </div>
          </div>
          <ProfileButton
            profile={profile}
            completedDays={completed}
            onClick={() => setDrawerOpen(true)}
          />
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-5 pb-[max(96px,calc(env(safe-area-inset-bottom)+72px))]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* CARD 1: Today's day */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="h-[160px] mb-3 rounded-2xl border border-forest-line bg-forest-card px-4 py-4 flex flex-col"
        >
          <div className="font-display text-[10px] tracking-[0.15em] text-accent uppercase">
            Ден {continueDay}/60 · Модул {currentModule.id}
          </div>
          <h2
            className="mt-2 font-display font-bold text-ink text-[16px] leading-[1.2] tracking-display uppercase"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {continueData?.title || `Ден ${continueDay}`}
          </h2>
          <motion.button
            type="button"
            onClick={goToDay}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -1 }}
            transition={{ duration: 0.15 }}
            className="mt-auto self-start inline-flex items-center gap-2 rounded-full bg-accent text-forest-deep font-display text-[11px] font-bold uppercase tracking-[0.12em] px-4 py-2.5 shadow-[0_0_28px_rgba(255,106,0,0.45)]"
          >
            Продължи
            <ArrowRight size={14} strokeWidth={3} />
          </motion.button>
        </motion.div>

        {/* CARD 2: Progress */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className={[
            'h-[160px] mb-3 rounded-2xl border bg-forest-card px-4 py-4 flex flex-col transition-colors',
            progressPct >= 50 ? 'border-accent/35' : 'border-forest-line'
          ].join(' ')}
        >
          <div className="flex items-start justify-between">
            <span className="font-display font-semibold text-ink text-[11px] tracking-display uppercase">
              Прогрес
            </span>
            <span className="font-display font-bold text-accent text-[28px] leading-none tracking-display">
              {progressPct}%
            </span>
          </div>
          <div className="mt-4">
            <ProgressBar value={completed} max={TOTAL_DAYS} glow />
          </div>
          <div className="mt-auto pt-3 flex items-center justify-between gap-2 text-[10.5px] text-ink-muted">
            <span>
              <span className="text-ink font-display font-semibold">
                {completed}/{TOTAL_DAYS}
              </span>{' '}
              завършени
            </span>
            <span className="text-ink-dim">·</span>
            <span className="flex items-center gap-1">
              <motion.span
                animate={{
                  scale: [1, 1.18, 0.96, 1.08, 1],
                  rotate: [0, -3, 3, -2, 0]
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block"
                aria-hidden="true"
              >
                🔥
              </motion.span>{' '}
              <span className="text-ink font-display font-semibold">
                {streakCount}
              </span>{' '}
              серия
            </span>
            <span className="text-ink-dim">·</span>
            <span>
              Ден{' '}
              <span className="text-ink font-display font-semibold">
                {nextDay}
              </span>{' '}
              следващ
            </span>
          </div>
        </motion.div>

        {/* CARD 3: All days */}
        <motion.button
          type="button"
          onClick={goToDays}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.985 }}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="relative h-[160px] w-full rounded-2xl border border-forest-line bg-forest-card px-4 py-4 text-left flex flex-col overflow-hidden hover:border-accent/30 transition-colors"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(255,106,0,0.10),transparent_50%)] pointer-events-none" />
          <div className="relative flex items-start justify-between gap-3">
            <span className="font-display text-[10px] tracking-[0.15em] text-accent uppercase">
              60-дневен протокол
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 border border-accent/30 shrink-0">
              <ArrowRight size={15} className="text-accent" strokeWidth={2.6} />
            </span>
          </div>
          <h2 className="relative mt-2 font-display font-bold text-ink text-[16px] leading-[1.2] tracking-display uppercase">
            📚 Всички дни
          </h2>
          <div className="relative mt-auto flex items-center gap-2 text-[12px] text-ink-muted">
            <span>
              <span className="text-ink font-display font-semibold">
                {completed}
              </span>{' '}
              завършени
            </span>
            <span className="text-ink-dim">·</span>
            <span>
              <span className="text-ink font-display font-semibold">
                {lockedCount}
              </span>{' '}
              заключени
            </span>
          </div>
        </motion.button>
      </div>

      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userId={userId}
        profile={profile}
        onProfileChange={setProfileState}
        completedDays={completed}
        totalDays={TOTAL_DAYS}
        completedDaysList={completedDaysList}
      />
    </Screen>
  )
}
