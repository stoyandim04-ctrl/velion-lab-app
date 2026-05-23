import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ChevronLeft, Lock } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { buildDays, TOTAL_DAYS } from '../data/course.js'
import { getDayProgress } from '../lib/courseProgress.js'
import { useAuth } from '../state/AuthContext.jsx'
import { addAnalyticsEvent } from '../lib/engagement.js'
import { ROUTES } from '../lib/routes.js'

export default function DaysScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id
  const [toast, setToast] = useState('')

  const days = useMemo(
    () => buildDays((n) => getDayProgress(userId, n)).filter((d) => d.day > 0),
    [userId]
  )
  const completed = days.filter((d) => d.status === 'completed').length

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 1700)
  }

  const handleDayClick = (day) => {
    if (day.status === 'locked' && !day.hasContent) {
      showToast('Съдържанието идва скоро')
      return
    }
    if (day.status === 'locked') {
      showToast('Завърши предишния ден, за да отключиш този')
      return
    }
    addAnalyticsEvent(userId, 'continue_tapped', {
      dayNumber: day.day,
      source: 'days_grid'
    })
    navigate(`/course/day-${day.day}`)
  }

  return (
    <Screen background="bg-forest-deep">
      <div className="px-5 pt-[max(56px,env(safe-area-inset-top))] pb-3 shrink-0">
        <button
          type="button"
          onClick={() => navigate(ROUTES.dashboard)}
          className="inline-flex items-center gap-1 text-ink-muted active:text-ink text-[13px] -ml-1"
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
          Назад
        </button>
        <div className="mt-3 font-display text-accent text-[10px] tracking-[0.15em] uppercase">
          Velion Lab
        </div>
        <h1 className="mt-1.5 font-display font-bold text-ink text-[22px] leading-[1.1] tracking-display uppercase">
          60-дневен протокол
        </h1>
        <div className="mt-1.5 text-[12px] text-ink-muted">
          <span className="text-ink font-display font-semibold">
            {completed}
          </span>{' '}
          / {TOTAL_DAYS} завършени
        </div>
      </div>

      <div
        className="flex-1 min-h-0 px-5 overflow-y-auto overscroll-contain scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="grid grid-cols-2 gap-2.5 pb-[max(96px,calc(env(safe-area-inset-bottom)+72px))]">
          {days.map((d, i) => (
            <DayCard
              key={d.day}
              day={d}
              index={i}
              onClick={handleDayClick}
            />
          ))}
        </div>
      </div>

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

function DayCard({ day, index, onClick }) {
  const isCompleted = day.status === 'completed'
  const isActive = day.status === 'active'
  const isLocked = day.status === 'locked'

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 12) * 0.02 }}
      whileTap={isLocked ? {} : { scale: 0.97 }}
      onClick={() => onClick(day)}
      className={[
        'relative h-[112px] rounded-2xl border px-3 py-3 text-left flex flex-col justify-between transition-all overflow-hidden',
        isActive
          ? 'border-accent bg-forest-card shadow-[0_0_24px_rgba(255,106,0,0.22)]'
          : isCompleted
          ? 'border-forest-line bg-forest-card hover:border-accent/30'
          : 'border-forest-line/50 bg-forest-card/30'
      ].join(' ')}
    >
      {isActive && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,106,0,0.16),transparent_55%)] pointer-events-none" />
      )}
      <div className="relative flex items-start justify-between gap-2">
        <span
          className={[
            'font-display text-[10px] tracking-[0.12em] uppercase font-semibold',
            isLocked ? 'text-ink-dim' : 'text-accent'
          ].join(' ')}
        >
          Ден {day.day}
        </span>
        <span
          className={[
            'flex h-6 w-6 items-center justify-center rounded-full shrink-0',
            isCompleted
              ? 'bg-accent/15 text-accent border border-accent/40'
              : isActive
              ? 'bg-accent text-forest-deep'
              : 'bg-forest-line/60 text-ink-dim'
          ].join(' ')}
        >
          {isCompleted ? (
            <Check size={12} strokeWidth={3} />
          ) : isLocked ? (
            <Lock size={11} strokeWidth={2.4} />
          ) : null}
        </span>
      </div>
      <div
        className={[
          'relative font-display text-[11.5px] leading-[1.25] uppercase tracking-display',
          isLocked ? 'text-ink-dim' : 'text-ink'
        ].join(' ')}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {day.title}
      </div>
    </motion.button>
  )
}
