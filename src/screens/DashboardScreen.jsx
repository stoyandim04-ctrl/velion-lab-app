import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Lock, Sparkles, Trophy, Zap } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import ProgressBar from '../components/layout/ProgressBar.jsx'
import DayRow from '../components/features/DayRow.jsx'
import ProfileButton from '../components/features/ProfileButton.jsx'
import ProfileDrawer from '../components/features/ProfileDrawer.jsx'
import { buildDays, MODULES, TOTAL_DAYS } from '../data/course.js'
import { getDayProgress } from '../lib/courseProgress.js'
import { getDayData } from '../data/days.js'
import { getCachedProfile, fetchProfile } from '../lib/profile.js'
import { getCachedEngagement, getStreakMessage, addAnalyticsEvent } from '../lib/engagement.js'
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
  return MODULES.find((module) => dayNumber >= module.range[0] && dayNumber <= module.range[1]) || MODULES[0]
}

export default function DashboardScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const [toast, setToast] = useState('')
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
      const [remote, fresh] = await Promise.all([
        pullToLocal(userId),
        fetchProfile(userId)
      ])
      if (!active) return
      setProfileState(fresh)
      if (!remote || remote.completedDays.length === 0) {
        // No remote progress yet -> no local push, so accounts stay isolated.
      }
      setEngagement(getCachedEngagement(userId))
      setReady(true)
      setSyncTick((t) => t + 1)
    })()

    return () => { active = false }
  }, [userId])

  const days = useMemo(
    () => buildDays((n) => getDayProgress(userId, n)),
    [userId, syncTick]
  )
  const completed = days.filter((d) => d.status === 'completed' && d.day > 0).length
  const completedDaysList = days.filter((d) => d.status === 'completed' && d.day > 0)
  const progressPct = Math.round((completed / TOTAL_DAYS) * 100)
  const continueDay = getContinueDay(days, engagement)
  const continueData = getDayData(continueDay)
  const currentModule = getModuleForDay(continueDay)
  const streakCount = engagement?.streak?.count || 0
  const streakMessage = getStreakMessage(streakCount)

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

  const showToast = (message, delay = 1700) => {
    setToast(message)
    setTimeout(() => setToast(''), delay)
  }

  const goToDay = (dayNumber, source = 'dashboard') => {
    addAnalyticsEvent(userId, 'continue_tapped', { dayNumber, source })
    navigate(`/course/day-${dayNumber}`)
  }

  const handleDayClick = (day) => {
    if (day.day === 0) {
      showToast('Onboarding е завършен')
      return
    }
    if (day.status === 'locked' && !day.hasContent) {
      showToast('Съдържанието идва скоро')
      return
    }
    if (day.status === 'locked') {
      showToast('Завърши предишния ден, за да отключиш този')
      return
    }
    goToDay(day.day, 'day_list')
  }

  return (
    <Screen background="bg-forest-deep">
      <div className="px-5 pt-[max(56px,env(safe-area-inset-top))] pb-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0 flex-1">
            <div className="font-display font-semibold text-accent text-[10px] tracking-[0.15em] uppercase">
              Velion Lab
            </div>
            <div className="font-display font-bold text-ink text-[20px] tracking-display uppercase mt-1.5 leading-[1.15]">
              Ден {continueDay}/60 · Модул {currentModule.id}
            </div>
            <div className="text-ink-muted text-[11px] mt-1 tracking-[0.06em] uppercase">
              {currentModule.name}
            </div>
          </div>
          <ProfileButton
            profile={profile}
            completedDays={completed}
            onClick={() => setDrawerOpen(true)}
          />
        </div>
      </div>

      <div className="px-5 pb-4">
        <motion.button
          type="button"
          onClick={() => goToDay(continueDay, 'hero_continue')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.45 }}
          className="relative w-full overflow-hidden rounded-3xl border border-accent/35 bg-forest-card p-5 text-left shadow-card"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,106,0,0.24),transparent_42%)]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5">
                <Zap size={13} className="text-accent" />
                <span className="font-display text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
                  Продължи от Ден {continueDay}
                </span>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-forest-deep shadow-glow-soft">
                <ArrowRight size={17} strokeWidth={2.8} />
              </span>
            </div>
            <h2 className="font-display text-[22px] font-bold leading-[1.12] tracking-display text-ink uppercase">
              {continueData?.title || `Ден ${continueDay}`}
            </h2>
            <p className="mt-3 text-[14px] leading-[1.55] text-ink-muted">
              Най-малката победа днес: отвори урока, завърши стъпките и отключи следващото ниво.
            </p>
          </div>
        </motion.button>
      </div>

      <div className="px-5 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="rounded-3xl border border-forest-line bg-forest-card p-5"
        >
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-ink text-sm tracking-display uppercase">
                Прогрес
              </span>
              <Flame size={14} className="text-accent" strokeWidth={2.2} />
            </div>
            <span className="text-ink-muted text-xs">
              <span className="text-accent font-display font-bold">{progressPct}%</span>
            </span>
          </div>
          <ProgressBar value={completed} max={TOTAL_DAYS} glow />

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric icon={<Trophy size={13} />} label="Завършени" value={`${completed}/${TOTAL_DAYS}`} />
            <Metric icon={<Flame size={13} />} label="Серия" value={`🔥 ${streakCount}`} />
            <Metric icon={<Lock size={13} />} label="Следващ" value={`Ден ${Math.min(TOTAL_DAYS, completed + 1)}`} />
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-accent/20 bg-accent/10 px-3.5 py-3">
            <Sparkles size={15} className="text-accent shrink-0" />
            <p className="text-[12px] leading-[1.45] text-ink-muted">
              <span className="text-ink">🔥 {streakCount} дни поред.</span> {streakMessage}
            </p>
          </div>
        </motion.div>
      </div>

      <div
        className="flex-1 min-h-0 px-5 pb-[max(24px,env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-[11px] tracking-[0.14em] text-ink-dim uppercase">
            60-дневен протокол
          </div>
          <div className="text-[11px] text-ink-dim">
            {completed} завършени
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {days.map((d, i) => (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(i, 10) * 0.025 }}
            >
              <DayRow day={d} onClick={handleDayClick} />
            </motion.div>
          ))}
        </div>
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

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-8 left-1/2 z-20 max-w-[320px] -translate-x-1/2 rounded-full border border-forest-line bg-forest-card px-5 py-3 text-center text-sm text-ink shadow-card"
        >
          {toast}
        </motion.div>
      )}
    </Screen>
  )
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-forest-line bg-forest-deep/40 px-3 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-accent">
        {icon}
        <span className="text-[9px] uppercase tracking-[0.12em] text-ink-dim">{label}</span>
      </div>
      <div className="font-display text-[13px] font-semibold text-ink">{value}</div>
    </div>
  )
}
