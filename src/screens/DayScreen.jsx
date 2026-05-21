import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import ProgressBar from '../components/layout/ProgressBar.jsx'
import {
  getDayProgress,
  setTrackerItem,
  setJournal,
  markDayCompleted,
  isDayUnlocked
} from '../lib/courseProgress.js'
import { getDayData, getNextDayRoute } from '../data/days.js'

import ThemeCard from '../components/features/course/ThemeCard.jsx'
import LessonBody from '../components/features/course/LessonBody.jsx'
import FactCard from '../components/features/course/FactCard.jsx'
import ExerciseCard from '../components/features/course/ExerciseCard.jsx'
import DailyTask from '../components/features/course/DailyTask.jsx'
import JournalPrompt from '../components/features/course/JournalPrompt.jsx'
import ProgressTracker from '../components/features/course/ProgressTracker.jsx'
import VictoryCard from '../components/features/course/VictoryCard.jsx'
import TomorrowTeaser from '../components/features/course/TomorrowTeaser.jsx'
import NavigationCard from '../components/features/course/NavigationCard.jsx'
import MythsList from '../components/features/course/MythsList.jsx'
import TriggerCategories from '../components/features/course/TriggerCategories.jsx'
import ArousalScale from '../components/features/course/ArousalScale.jsx'

export default function DayScreen() {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const dayNumber = useMemo(() => {
    if (params.day) {
      const n = parseInt(params.day, 10)
      if (!isNaN(n)) return n
    }
    const match = location.pathname.match(/\/course\/day-(\d+)/)
    if (match) return parseInt(match[1], 10)
    return NaN
  }, [params.day, location.pathname])

  const data = getDayData(dayNumber)

  if (!data) {
    return (
      <Screen background="bg-forest-deep">
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-5xl mb-4">🔒</span>
          <h2 className="font-display font-bold text-ink text-xl mb-2 uppercase">
            Ден {dayNumber} още не е готов
          </h2>
          <p className="text-ink-muted text-sm mb-8">
            Това съдържание ще бъде добавено скоро.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-accent font-display text-sm tracking-wider uppercase"
          >
            Назад към Dashboard
          </button>
        </div>
      </Screen>
    )
  }

  if (!isDayUnlocked(dayNumber)) {
    return (
      <Screen background="bg-forest-deep">
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-5xl mb-4">🔒</span>
          <h2 className="font-display font-bold text-ink text-xl mb-2 uppercase">
            Ден {dayNumber} е заключен
          </h2>
          <p className="text-ink-muted text-sm mb-8">
            Завърши Ден {dayNumber - 1}, за да отключиш този ден.
          </p>
          <button
            onClick={() => navigate(`/course/day-${dayNumber - 1}`)}
            className="text-accent font-display text-sm tracking-wider uppercase"
          >
            Към Ден {dayNumber - 1}
          </button>
        </div>
      </Screen>
    )
  }

  return <DayContent data={data} key={dayNumber} />
}

function DayContent({ data }) {
  const navigate = useNavigate()
  const initial = useMemo(() => getDayProgress(data.dayNumber), [data.dayNumber])
  const [tracker, setTracker] = useState(initial.tracker)
  const [journal, setJournalText] = useState(initial.journal)
  const [completed, setCompleted] = useState(initial.completed)
  const [toast, setToast] = useState('')

  const requiredItems = data.tracker.items.filter((i) => !i.optional)
  const requiredDone = requiredItems.filter((i) => tracker[i.id]).length
  const allRequiredDone = requiredDone === requiredItems.length
  const progressPct = (requiredDone / requiredItems.length) * 100

  const handleToggleTracker = (id, value) => {
    setTracker((s) => ({ ...s, [id]: value }))
    setTrackerItem(data.dayNumber, id, value)
  }

  const handleJournalChange = (text) => {
    setJournalText(text)
    setJournal(data.dayNumber, text)
  }

  const handleMarkRead = () => {
    if (!tracker.lesson) handleToggleTracker('lesson', true)
  }

  const handleComplete = () => {
    if (!allRequiredDone) return
    markDayCompleted(data.dayNumber)
    setCompleted(true)
    const nextRoute = getNextDayRoute(data.dayNumber)
    if (nextRoute) {
      setToast(`Ден ${data.dayNumber} завършен · Ден ${data.dayNumber + 1} е отключен`)
      setTimeout(() => {
        setToast('')
        navigate(nextRoute)
      }, 1800)
    } else {
      setToast('Ден завършен')
      setTimeout(() => setToast(''), 1800)
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [data.dayNumber])

  return (
    <Screen background="bg-forest-deep">
      <div className="sticky top-0 z-30 bg-forest-deep/95 backdrop-blur-md border-b border-forest-line/60">
        <div className="flex items-center justify-between px-5 pt-[max(56px,env(safe-area-inset-top))] pb-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-ink-muted active:scale-95 transition"
            aria-label="Назад"
          >
            <ChevronLeft size={26} strokeWidth={2.2} />
          </button>

          <div className="text-center">
            <div className="font-display text-[10px] tracking-[0.15em] text-accent uppercase">
              Ден {data.dayNumber}{data.isIntegration ? ' · Интеграция' : ''}
            </div>
            <div className="text-ink-dim text-[10px] mt-0.5">
              {data.duration}
            </div>
          </div>

          <div className="w-11 h-11 flex items-center justify-end">
            {completed && (
              <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                <Check size={14} strokeWidth={3} className="text-forest-deep" />
              </span>
            )}
          </div>
        </div>
        <div className="px-5 pb-3">
          <ProgressBar value={progressPct} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="px-5 pt-6 pb-[160px]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-3"
          >
            <div className="text-ink-dim text-[11px] tracking-[0.12em] uppercase mb-2">
              {data.module}
            </div>
            <h1 className="font-display font-bold text-ink text-[28px] sm:text-[32px] leading-[1.08] tracking-display uppercase mb-4">
              {data.title}
            </h1>
            <div className="flex flex-wrap gap-1.5">
              {data.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] tracking-[0.04em] uppercase text-ink-dim border border-forest-line rounded-full px-2.5 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="space-y-7 mt-7">
            <ThemeCard icon={data.theme.icon} text={data.theme.text} />

            <LessonBody lesson={data.lesson} onRead={handleMarkRead}>
              {data.myths && <div className="pt-2"><MythsList myths={data.myths} /></div>}
              {data.triggerCategories && (
                <div className="pt-2"><TriggerCategories categories={data.triggerCategories} /></div>
              )}
              {data.arousalScale && (
                <div className="pt-2"><ArousalScale scale={data.arousalScale} /></div>
              )}
            </LessonBody>

            <FactCard fact={data.fact} />

            <ExerciseCard
              exercise={data.exercise}
              done={Boolean(tracker.exercise)}
              onToggleDone={() => handleToggleTracker('exercise', !tracker.exercise)}
            />

            <DailyTask
              task={data.dailyTask}
              done={Boolean(tracker.task)}
              onToggleDone={() => handleToggleTracker('task', !tracker.task)}
            />

            <JournalPrompt
              journal={data.journal}
              value={journal}
              onChange={(text) => {
                handleJournalChange(text)
                if (text.trim().length > 0 && !tracker.journal) {
                  handleToggleTracker('journal', true)
                }
              }}
            />

            <ProgressTracker
              tracker={data.tracker}
              state={tracker}
              onToggle={handleToggleTracker}
            />

            <VictoryCard victory={data.victory} />

            <TomorrowTeaser tomorrow={data.tomorrow} unlocked={completed} />

            <NavigationCard items={data.navigation} />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-5 pt-6 bg-gradient-to-t from-forest-deep via-forest-deep/95 to-transparent pointer-events-none"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        <div className="pointer-events-auto">
          <motion.button
            onClick={handleComplete}
            disabled={!allRequiredDone || completed}
            whileTap={allRequiredDone && !completed ? { scale: 0.97 } : {}}
            className={`w-full min-h-[52px] font-display font-semibold tracking-display uppercase text-sm rounded-2xl py-4 px-6 transition-all ${
              completed
                ? 'bg-forest-card border border-accent/40 text-accent'
                : allRequiredDone
                ? 'bg-accent text-forest-deep shadow-[0_0_30px_rgba(255,106,0,0.45)]'
                : 'bg-forest-card border border-forest-line text-ink-dim'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            {completed
              ? `✓ Ден ${data.dayNumber} завършен`
              : allRequiredDone
              ? `Завърши Ден ${data.dayNumber}`
              : `Остават ${requiredItems.length - requiredDone} стъпки`}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 bg-accent text-forest-deep px-5 py-3 rounded-full text-sm font-medium shadow-glow whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}
