import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { syncDayCompletion, syncLastOpened, pushFromLocal } from '../lib/progressSync.js'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check, Lock } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import ProgressBar from '../components/layout/ProgressBar.jsx'
import {
  getDayProgress,
  getCompletedDayNumbers,
  setTrackerItem,
  setJournal,
  markDayCompleted,
  isDayUnlocked
} from '../lib/courseProgress.js'
import {
  addAnalyticsEvent,
  getStreakMessage,
  recordDayCompletion,
  recordOpenedDay
} from '../lib/engagement.js'
import { awardForDayCompletion } from '../lib/gamification.js'
import { ensureWeeklyMissions, recordMissionSignal } from '../lib/missions.js'
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
import SignalsList from '../components/features/course/SignalsList.jsx'

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

  const { user } = useAuth()
  const userId = user?.id
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

  if (!isDayUnlocked(userId, dayNumber)) {
    return (
      <Screen background="bg-forest-deep">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,106,0,0.18),transparent_48%)]" />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-accent/35 bg-accent/10 text-accent shadow-glow-soft">
            <Lock size={26} strokeWidth={2.4} />
          </div>
          <div className="font-display text-[10px] tracking-[0.16em] text-accent uppercase mb-3">
            Премиум отключване
          </div>
          <h2 className="font-display font-bold text-ink text-2xl leading-[1.12] tracking-display mb-3 uppercase">
            Ден {dayNumber} чака своя ред
          </h2>
          <p className="text-ink-muted text-[15px] leading-[1.6] mb-8 max-w-[300px]">
            Завърши Ден {dayNumber - 1}. Следващият урок се отключва, когато ритъмът е реален.
          </p>
          <button
            onClick={() => navigate(`/course/day-${dayNumber - 1}`)}
            className="min-h-[50px] rounded-2xl bg-accent px-6 py-3 font-display text-sm font-semibold uppercase tracking-display text-forest-deep shadow-[0_0_28px_rgba(255,106,0,0.35)]"
          >
            Към Ден {dayNumber - 1}
          </button>
        </div>
      </Screen>
    )
  }

  return <DayContent data={data} userId={userId} key={`${userId || 'anon'}-${dayNumber}`} />
}

function DayContent({ data, userId }) {
  const navigate = useNavigate()
  const initial = useMemo(() => getDayProgress(userId, data.dayNumber), [userId, data.dayNumber])
  const [tracker, setTracker] = useState(initial.tracker)
  const [journal, setJournalText] = useState(initial.journal)
  const [completed, setCompleted] = useState(initial.completed)
  const [toast, setToast] = useState('')
  const [celebration, setCelebration] = useState(null)
  const pushTimerRef = useRef(null)

  useEffect(() => {
    if (!userId) return
    recordOpenedDay(userId, data.dayNumber)
    addAnalyticsEvent(userId, 'lesson_screen_viewed', { dayNumber: data.dayNumber })
    syncLastOpened(userId, data.dayNumber)
    pushFromLocal(userId)
  }, [userId, data.dayNumber])

  const schedulePush = () => {
    if (!userId) return
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    pushTimerRef.current = setTimeout(() => pushFromLocal(userId), 1200)
  }

  useEffect(() => () => { if (pushTimerRef.current) clearTimeout(pushTimerRef.current) }, [])

  const requiredItems = data.tracker.items.filter((i) => !i.optional)
  const requiredDone = requiredItems.filter((i) => tracker[i.id]).length
  const allRequiredDone = requiredDone === requiredItems.length
  const progressPct = (requiredDone / requiredItems.length) * 100
  const completedDays = getCompletedDayNumbers(userId).length
  const coursePct = Math.round((completedDays / 60) * 100)

  const handleToggleTracker = (id, value) => {
    setTracker((s) => ({ ...s, [id]: value }))
    setTrackerItem(userId, data.dayNumber, id, value)
    schedulePush()
  }

  const handleJournalChange = (text) => {
    setJournalText(text)
    setJournal(userId, data.dayNumber, text)
    schedulePush()
  }

  const handleMarkRead = () => {
    if (!tracker.lesson) handleToggleTracker('lesson', true)
  }

  const handleComplete = () => {
    if (!allRequiredDone) return
    markDayCompleted(userId, data.dayNumber)
    const engagement = recordDayCompletion(userId, data.dayNumber)
    setCompleted(true)
    if (userId) syncDayCompletion(userId, data.dayNumber)
    const nextRoute = getNextDayRoute(data.dayNumber)
    const nextDayNumber = Math.min(60, data.dayNumber + 1)
    const completedCount = getCompletedDayNumbers(userId).length
    setCelebration({
      dayNumber: data.dayNumber,
      nextDayNumber,
      streak: engagement.streak.count || 1,
      message: getStreakMessage(engagement.streak.count || 1)
    })
    // Award XP + check badges. Best-effort: if the network is down, the
    // gamification lib falls back to localStorage so the next dashboard
    // visit still reflects the gain. We don't block navigation on it.
    if (userId) {
      // weeklyCompletedCount: rough heuristic from local progress for the
      // current ISO week, used for the perfect_week secret badge check.
      const now = new Date()
      const dow = now.getDay() === 0 ? 7 : now.getDay()
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (dow - 1))
      const weeklyCompletedCount = getCompletedDayNumbers(userId)
        .map((n) => ({ n, ts: localStorage.getItem(`velion_day_${userId}_${n}_completed_at`) }))
        .filter((d) => d.ts && new Date(d.ts) >= weekStart)
        .length

      awardForDayCompletion(userId, data.dayNumber, {
        completedCount,
        weeklyCompletedCount
      })
        .then((award) => {
          if (!award) return
          setCelebration((curr) => (curr ? { ...curr, award } : curr))
          if (award.newBadges && award.newBadges.length > 0) {
            const last = award.newBadges[award.newBadges.length - 1]
            setToast(`Нова значка: ${last.title}`)
          } else if (award.leveledUp) {
            setToast(`Ниво ${award.level} отключено · +${award.xpGained} XP`)
          }
        })
        .catch(() => {})
      // Track weekly missions
      ensureWeeklyMissions(userId)
        .then(() => recordMissionSignal(userId, 'days_completed'))
        .catch(() => {})
      // Journal mission signal — credit if the day's journal text is
      // non-empty at completion time.
      if (journalText && journalText.trim().length > 0) {
        recordMissionSignal(userId, 'journal_entries').catch(() => {})
      }
    }
    if (nextRoute) {
      if (!toast) setToast(`Ден ${data.dayNumber} завършен · Ден ${data.dayNumber + 1} е отключен`)
      setTimeout(() => {
        setToast('')
        setCelebration(null)
        navigate(nextRoute)
      }, 2800)
    } else {
      setToast('Денят е завършен')
      setTimeout(() => {
        setToast('')
        setCelebration(null)
      }, 2800)
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
              Ден {data.dayNumber}/60{data.isIntegration ? ' · Интеграция' : ''}
            </div>
            <div className="text-ink-dim text-[10px] mt-0.5">
              {Math.round(progressPct)}% днес · {coursePct}% курс
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
          <ProgressBar value={progressPct} glow />
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide scroll-pb-[240px]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="px-5 pt-6 pb-[240px]">
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
              {data.signals && (
                <div className="pt-2"><SignalsList signals={data.signals} /></div>
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
        {celebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-forest-deep/78 px-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full overflow-hidden rounded-3xl border border-accent/40 bg-forest-card p-6 text-center shadow-glow"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.25),transparent_55%)]" />
              <div className="relative z-10">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-forest-deep shadow-glow">
                  <Check size={25} strokeWidth={3} />
                </div>
                <div className="font-display text-[10px] tracking-[0.16em] text-accent uppercase">
                  Малка победа
                </div>
                <h3 className="mt-2 font-display text-[24px] font-bold uppercase tracking-display text-ink">
                  Ден {celebration.dayNumber} завършен
                </h3>
                <p className="mx-auto mt-3 max-w-[280px] text-[14px] leading-[1.55] text-ink-muted">
                  🔥 {celebration.streak} дни поред. {celebration.message}
                </p>
                {celebration.dayNumber < 60 && (
                  <div className="mt-5 rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3">
                    <div className="font-display text-[11px] font-semibold uppercase tracking-[0.13em] text-accent">
                      Ден {celebration.nextDayNumber} отключен
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

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
