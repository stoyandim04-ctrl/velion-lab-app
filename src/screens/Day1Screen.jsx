import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import ProgressBar from '../components/layout/ProgressBar.jsx'
import { DAY_1 } from '../data/day1.js'
import {
  getDayProgress,
  setTrackerItem,
  setJournal,
  markDayCompleted
} from '../lib/courseProgress.js'

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

export default function Day1Screen() {
  const navigate = useNavigate()
  const initial = useMemo(() => getDayProgress(DAY_1.dayNumber), [])
  const [tracker, setTracker] = useState(initial.tracker)
  const [journal, setJournalText] = useState(initial.journal)
  const [completed, setCompleted] = useState(initial.completed)
  const [toast, setToast] = useState('')

  const requiredItems = DAY_1.tracker.items.filter((i) => !i.optional)
  const requiredDone = requiredItems.filter((i) => tracker[i.id]).length
  const allRequiredDone = requiredDone === requiredItems.length
  const progressPct = (requiredDone / requiredItems.length) * 100

  const handleToggleTracker = (id, value) => {
    setTracker((s) => ({ ...s, [id]: value }))
    setTrackerItem(DAY_1.dayNumber, id, value)
  }

  const handleJournalChange = (text) => {
    setJournalText(text)
    setJournal(DAY_1.dayNumber, text)
  }

  const handleMarkRead = () => {
    if (!tracker.lesson) handleToggleTracker('lesson', true)
  }

  const handleComplete = () => {
    if (!allRequiredDone) return
    markDayCompleted(DAY_1.dayNumber)
    setCompleted(true)
    setToast('Ден 1 завършен · Ден 2 е отключен')
    setTimeout(() => setToast(''), 2400)
  }

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <Screen background="bg-forest-deep">
      <div className="sticky top-0 z-30 bg-forest-deep/95 backdrop-blur-md border-b border-forest-line/60">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-ink-muted hover:text-ink active:scale-95 transition"
            aria-label="Назад"
          >
            <ChevronLeft size={26} strokeWidth={2.2} />
          </button>

          <div className="text-center">
            <div className="font-display text-[10px] tracking-[0.3em] text-accent uppercase">
              Ден {DAY_1.dayNumber}
            </div>
            <div className="text-ink-dim text-[10px] tracking-wider mt-0.5">
              {DAY_1.duration}
            </div>
          </div>

          <div className="w-10 h-10 flex items-center justify-end">
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

      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide">
        <div className="px-5 pt-4 pb-[140px]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-2"
          >
            <div className="text-ink-dim text-[10px] tracking-[0.25em] uppercase mb-1.5">
              {DAY_1.module}
            </div>
            <h1 className="font-display font-bold text-ink text-[26px] leading-[1.1] tracking-display uppercase mb-3">
              {DAY_1.title}
            </h1>
            <div className="flex flex-wrap gap-1.5">
              {DAY_1.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] tracking-wider uppercase text-ink-dim border border-forest-line rounded-full px-2.5 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="space-y-6 mt-6">
            <ThemeCard icon={DAY_1.theme.icon} text={DAY_1.theme.text} />
            <LessonBody lesson={DAY_1.lesson} onRead={handleMarkRead} />
            <FactCard fact={DAY_1.fact} />
            <ExerciseCard
              exercise={DAY_1.exercise}
              done={Boolean(tracker.exercise)}
              onToggleDone={() => handleToggleTracker('exercise', !tracker.exercise)}
            />
            <DailyTask
              task={DAY_1.dailyTask}
              done={Boolean(tracker.task)}
              onToggleDone={() => handleToggleTracker('task', !tracker.task)}
            />
            <JournalPrompt
              journal={DAY_1.journal}
              value={journal}
              onChange={(text) => {
                handleJournalChange(text)
                if (text.trim().length > 0 && !tracker.journal) {
                  handleToggleTracker('journal', true)
                }
              }}
            />
            <ProgressTracker
              tracker={DAY_1.tracker}
              state={tracker}
              onToggle={handleToggleTracker}
            />
            <VictoryCard victory={DAY_1.victory} />
            <TomorrowTeaser tomorrow={DAY_1.tomorrow} unlocked={completed} />
            <NavigationCard items={DAY_1.navigation} />

            <div className="pt-2">
              <img
                src="/course/day-1/logo.png"
                alt=""
                loading="lazy"
                className="w-20 h-20 mx-auto opacity-60 rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-forest-deep via-forest-deep/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <motion.button
            onClick={handleComplete}
            disabled={!allRequiredDone || completed}
            whileTap={allRequiredDone && !completed ? { scale: 0.97 } : {}}
            className={`w-full font-display font-semibold tracking-display uppercase text-sm rounded-2xl py-4 px-6 transition-all ${
              completed
                ? 'bg-forest-card border border-accent/40 text-accent'
                : allRequiredDone
                ? 'bg-accent text-forest-deep shadow-[0_0_30px_rgba(255,106,0,0.45)]'
                : 'bg-forest-card border border-forest-line text-ink-dim cursor-not-allowed'
            }`}
          >
            {completed
              ? '✓ Ден 1 завършен'
              : allRequiredDone
              ? 'Завърши Ден 1'
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
