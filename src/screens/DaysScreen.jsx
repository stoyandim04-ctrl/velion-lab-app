import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'
import DayRow from '../components/features/DayRow.jsx'
import { buildDays, TOTAL_DAYS } from '../data/course.js'
import { getDayProgress } from '../lib/courseProgress.js'
import { useAuth } from '../state/AuthContext.jsx'
import { addAnalyticsEvent } from '../lib/engagement.js'

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
    addAnalyticsEvent(userId, 'continue_tapped', { dayNumber: day.day, source: 'days_screen' })
    navigate(`/course/day-${day.day}`)
  }

  return (
    <Screen background="bg-forest-deep">
      <Header />

      <div className="px-5 pb-3">
        <div className="font-display text-accent text-[11px] tracking-[0.15em] uppercase mb-2">
          Velion Lab
        </div>
        <h1 className="font-display font-bold text-ink text-[24px] leading-[1.1] tracking-display uppercase">
          Всички дни
        </h1>
        <div className="mt-2 text-[12px] text-ink-muted">
          {completed}/{TOTAL_DAYS} завършени
        </div>
      </div>

      <div
        className="flex-1 min-h-0 px-5 pb-[max(24px,env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex flex-col gap-2.5 pb-6">
          {days.map((d, i) => (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.02 }}
            >
              <DayRow day={d} onClick={handleDayClick} />
            </motion.div>
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
