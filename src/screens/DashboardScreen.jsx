import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import ProfileButton from '../components/features/ProfileButton.jsx'
import ProfileDrawer from '../components/features/ProfileDrawer.jsx'
import ControlIndexCard from '../components/features/ControlIndexCard.jsx'
import ParticleField from '../components/animations/ParticleField.jsx'
import AuroraGlow from '../components/animations/AuroraGlow.jsx'
import CountUp from '../components/animations/CountUp.jsx'
import ScrollProgress from '../components/animations/ScrollProgress.jsx'
import { useRipple, RippleLayer } from '../components/animations/Ripple.jsx'
import { SPRING, useReducedMotion } from '../lib/animations.js'
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
  const reduced = useReducedMotion()

  // Scroll-linked transforms — header collapses + blurs as user scrolls
  const scrollRef = useRef(null)
  const { scrollY } = useScroll({ container: scrollRef })
  const headerOpacity = useTransform(scrollY, [0, 80, 140], [1, 0.6, 0.3])
  const headerScale = useTransform(scrollY, [0, 140], [1, 0.92])
  const headerBlur = useTransform(scrollY, [0, 80], ['blur(0px)', 'blur(2px)'])

  // Tap ripples — bright orange for ALL three cards so the press feedback
  // is obvious on a phone screen.
  const ripple1 = useRipple()
  const ripple2 = useRipple()
  const ripple3 = useRipple()

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
      {/* Ambient layers — slow aurora + drifting amber particles */}
      <AuroraGlow />
      <ParticleField count={16} />

      <motion.div
        className="relative z-20 px-5 pt-[max(56px,env(safe-area-inset-top))] pb-3 shrink-0"
        style={{
          opacity: headerOpacity,
          scale: headerScale,
          filter: headerBlur,
          transformOrigin: 'top center'
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.05 }}
            className="min-w-0 flex-1"
          >
            <div className="font-display font-semibold text-accent text-[10px] tracking-[0.15em] uppercase">
              Velion Lab
            </div>
            <div className="font-display font-bold text-ink text-[19px] tracking-display uppercase mt-1.5 leading-[1.15]">
              Твоят протокол
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ ...SPRING, delay: 0.1 }}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05, rotate: 4 }}
            style={{ perspective: '300px' }}
          >
            <ProfileButton
              profile={profile}
              completedDays={completed}
              onClick={() => setDrawerOpen(true)}
            />
          </motion.div>
        </div>
      </motion.div>

      <ScrollProgress containerRef={scrollRef} />

      <div
        ref={scrollRef}
        className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-5 pb-[max(96px,calc(env(safe-area-inset-bottom)+72px))]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* CONTROL INDEX widget — latest score for this user, or CTA to take it */}
        <ControlIndexCard
          userId={userId}
          onTap={() => navigate(ROUTES.results)}
          onTakeQuiz={() => navigate('/quiz/1')}
        />

        {/* CARD 1: Today's day — "alive" card with rotating gradient border + radial glow */}
        <motion.div
          initial={{ opacity: 0, y: 32, rotateX: -14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.25 }}
          whileTap={{ scale: 0.97 }}
          onPointerDown={ripple1.onPointerDown}
          onClick={goToDay}
          style={{ perspective: '900px' }}
          className="relative h-[170px] mb-4 rounded-2xl px-4 py-4 flex flex-col overflow-hidden bg-forest-card cursor-pointer"
        >
          <RippleLayer ripples={ripple1.ripples} />
          {/* Rotating conic gradient border */}
          <motion.div
            className="absolute -inset-[1px] rounded-2xl pointer-events-none"
            style={{
              background:
                'conic-gradient(from 0deg, rgba(255,106,0,0.55), rgba(255,106,0,0) 25%, rgba(255,106,0,0) 75%, rgba(255,106,0,0.55))'
            }}
            animate={reduced ? {} : { rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          {/* Inner mask so only thin border shows */}
          <div className="absolute inset-[1px] rounded-2xl bg-forest-card pointer-events-none" />
          {/* Radial accent glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,106,0,0.22),transparent_55%)] pointer-events-none" />

          <div className="relative">
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
          </div>

          <motion.button
            type="button"
            onClick={goToDay}
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -2 }}
            animate={
              reduced
                ? {}
                : {
                    boxShadow: [
                      '0 0 20px rgba(255,106,0,0.35)',
                      '0 0 38px rgba(255,106,0,0.65)',
                      '0 0 20px rgba(255,106,0,0.35)'
                    ]
                  }
            }
            transition={{
              boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
              scale: SPRING
            }}
            className="relative mt-auto self-start inline-flex items-center gap-2 rounded-full bg-accent text-forest-deep font-display text-[11px] font-bold uppercase tracking-[0.12em] px-4 py-2.5"
          >
            Продължи
            <ArrowRight size={14} strokeWidth={3} />
          </motion.button>
        </motion.div>

        {/* CARD 2: Progress — animated counters + shimmer progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 32, rotateX: -12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.55 }}
          whileTap={{ scale: 0.97 }}
          onPointerDown={ripple2.onPointerDown}
          style={{ perspective: '900px' }}
          className={[
            'relative h-[170px] mb-4 rounded-2xl border bg-forest-card px-4 py-4 flex flex-col overflow-hidden transition-colors cursor-pointer',
            progressPct >= 50 ? 'border-accent/35' : 'border-forest-line'
          ].join(' ')}
        >
          <RippleLayer ripples={ripple2.ripples} />
          <div className="flex items-start justify-between">
            <span className="font-display font-semibold text-ink text-[11px] tracking-display uppercase">
              Прогрес
            </span>
            <motion.span
              className="font-display font-bold text-accent text-[30px] leading-none tracking-display"
              style={{ textShadow: '0 0 24px rgba(255,106,0,0.4)' }}
            >
              <CountUp to={progressPct} duration={1100} suffix="%" />
            </motion.span>
          </div>

          {/* Custom shimmer progress bar */}
          <div className="mt-4 relative h-2 w-full rounded-full bg-forest-line/60 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-soft via-accent to-accent-soft"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ boxShadow: '0 0 16px rgba(255,106,0,0.55)' }}
            />
            {!reduced && progressPct > 0 && (
              <motion.div
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay: 1.4 }}
                style={{ mixBlendMode: 'overlay' }}
              />
            )}
          </div>

          <div className="mt-auto pt-3 flex items-center justify-between gap-2 text-[10.5px] text-ink-muted">
            <span>
              <span className="text-ink font-display font-semibold">
                <CountUp to={completed} />/{TOTAL_DAYS}
              </span>{' '}
              завършени
            </span>
            <span className="text-ink-dim">·</span>
            <span className="flex items-center gap-1">
              <motion.span
                animate={
                  reduced
                    ? {}
                    : {
                        scale: [1, 1.22, 0.94, 1.1, 1],
                        rotate: [0, -4, 4, -2, 0],
                        filter: [
                          'drop-shadow(0 0 4px rgba(255,106,0,0.6))',
                          'drop-shadow(0 0 12px rgba(255,106,0,0.9))',
                          'drop-shadow(0 0 4px rgba(255,106,0,0.6))'
                        ]
                      }
                }
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block"
                aria-hidden="true"
              >
                🔥
              </motion.span>{' '}
              <span className="text-ink font-display font-semibold">
                <CountUp to={streakCount} />
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

        {/* CARD 3: All days — sweeping shine + 3D tilt entrance */}
        <motion.button
          type="button"
          onClick={goToDays}
          onPointerDown={ripple3.onPointerDown}
          initial={{ opacity: 0, y: 32, rotateX: -12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          whileTap={{ scale: 0.96 }}
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.85 }}
          style={{ perspective: '900px' }}
          className="relative h-[170px] w-full rounded-2xl border border-forest-line bg-forest-card px-4 py-4 text-left flex flex-col overflow-hidden hover:border-accent/40 transition-colors"
        >
          <RippleLayer ripples={ripple3.ripples} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(255,106,0,0.14),transparent_55%)] pointer-events-none" />
          {!reduced && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)'
              }}
              animate={{ x: ['-100%', '120%'] }}
              transition={{ duration: 5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
            />
          )}
          <div className="relative flex items-start justify-between gap-3">
            <span className="font-display text-[10px] tracking-[0.15em] text-accent uppercase">
              60-дневен протокол
            </span>
            <motion.span
              animate={reduced ? {} : { rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 border border-accent/30 shrink-0"
            >
              <ArrowRight size={15} className="text-accent" strokeWidth={2.6} />
            </motion.span>
          </div>
          <h2 className="relative mt-2 font-display font-bold text-ink text-[16px] leading-[1.2] tracking-display uppercase">
            📚 Всички дни
          </h2>
          <div className="relative mt-auto flex items-center gap-2 text-[12px] text-ink-muted">
            <span className="text-ink font-display font-semibold">
              <CountUp to={completed} />
            </span>{' '}
            завършени
            <span className="text-ink-dim">·</span>
            <span className="text-ink font-display font-semibold">
              <CountUp to={lockedCount} />
            </span>{' '}
            заключени
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
