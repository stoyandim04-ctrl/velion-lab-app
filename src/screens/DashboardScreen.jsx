import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Flame } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import ProgressBar from '../components/layout/ProgressBar.jsx'
import DayRow from '../components/features/DayRow.jsx'
import ProfileButton from '../components/features/ProfileButton.jsx'
import ProfileDrawer from '../components/features/ProfileDrawer.jsx'
import { buildDays, MODULES, TOTAL_DAYS } from '../data/course.js'
import { getDayProgress } from '../lib/courseProgress.js'
import { getCachedProfile, fetchProfile } from '../lib/profile.js'
import { useAuth } from '../state/AuthContext.jsx'
import { pullToLocal, pushFromLocal } from '../lib/progressSync.js'

const EMPTY_PROFILE = { name: '', avatar: '', createdAt: null }

export default function DashboardScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const [toast, setToast] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profile, setProfileState] = useState(EMPTY_PROFILE)
  const [syncTick, setSyncTick] = useState(0)

  // Whenever the authenticated user changes (signup, login, switch, logout),
  // reset all in-memory state to defaults FIRST, then load only this user's data.
  useEffect(() => {
    setProfileState(userId ? getCachedProfile(userId) : EMPTY_PROFILE)
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
        // No remote progress yet → no local push (start clean).
        // Old behavior of pushing local-as-starting-state caused account A's
        // progress to leak into account B. Removed.
      }
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
  const currentModule = MODULES[0]

  const handleDayClick = (day) => {
    if (day.day === 0) {
      setToast('Onboarding е завършен')
      setTimeout(() => setToast(''), 1500)
      return
    }
    if (day.status === 'locked' && !day.hasContent) {
      setToast('Съдържанието идва скоро')
      setTimeout(() => setToast(''), 1800)
      return
    }
    if (day.status === 'locked') {
      setToast('Завърши предишния ден за да отключиш')
      setTimeout(() => setToast(''), 1800)
      return
    }
    navigate(`/course/day-${day.day}`)
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
              Седмица 1 · Модул {currentModule.id}
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

      <div className="px-5 pb-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-forest-line bg-forest-card p-5"
        >
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-ink text-sm tracking-display uppercase">
                Прогрес
              </span>
              <Flame size={14} className="text-accent" strokeWidth={2.2} />
            </div>
            <span className="text-ink-muted text-xs">
              <span className="text-accent font-display font-bold">{completed}</span> / {TOTAL_DAYS}
              <span className="ml-1 uppercase">дни</span>
            </span>
          </div>
          <ProgressBar value={completed} max={TOTAL_DAYS} />
        </motion.div>
      </div>

      <div className="flex-1 px-5 pb-[max(24px,env(safe-area-inset-bottom))] overflow-y-auto scrollbar-hide">
        <div className="flex flex-col gap-2.5">
          {days.map((d, i) => (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 12) * 0.03 }}
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
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-forest-card border border-forest-line px-5 py-3 rounded-full text-ink text-sm shadow-card max-w-[320px] text-center"
        >
          {toast}
        </motion.div>
      )}
    </Screen>
  )
}
