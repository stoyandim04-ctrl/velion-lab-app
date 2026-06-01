// Dashboard widget: current Control Index. Reads the latest stored
// result (any kind — initial / retake / final) for this user. Tapping
// the card navigates to /results which already renders the full quiz
// outcome screen with the same answers.
//
// If no result exists yet (returning user from before the feature
// existed, or a user who somehow skipped the quiz funnel), we render a
// CTA card that sends them to /quiz/1 to take the index.

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { TIERS } from '../../lib/controlIndex.js'
import { fetchLatestQuizResult } from '../../lib/quizResults.js'

function MiniGauge({ score, tierColor }) {
  const size = 64
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const motionValue = useMotionValue(0)
  const displayed = useTransform(motionValue, (v) => Math.round(v))
  const dashOffset = useTransform(motionValue, (v) => circumference * (1 - v / 100))

  useEffect(() => {
    const controls = animate(motionValue, score, { duration: 1.2, ease: [0.22, 1, 0.36, 1] })
    return controls.stop
  }, [motionValue, score])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tierColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset, filter: `drop-shadow(0 0 6px ${tierColor}99)` }}
        />
      </svg>
      <motion.span
        className="relative font-display font-bold text-[19px] leading-none tracking-display"
        style={{ color: tierColor, textShadow: `0 0 12px ${tierColor}55` }}
      >
        {displayed}
      </motion.span>
    </div>
  )
}

export default function ControlIndexCard({ userId, onTap, onTakeQuiz }) {
  const [latest, setLatest] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    setLoaded(false)
    if (!userId) {
      setLatest(null)
      setLoaded(true)
      return
    }
    fetchLatestQuizResult(userId).then((row) => {
      if (!active) return
      setLatest(row)
      setLoaded(true)
    })
    return () => {
      active = false
    }
  }, [userId])

  if (!loaded) return null

  // No prior quiz on record — show CTA to take the index.
  if (!latest) {
    return (
      <motion.button
        type="button"
        onClick={onTakeQuiz}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.18 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mb-4 rounded-3xl border border-accent/30 bg-forest-card/80 px-5 py-4 text-left active:bg-forest-card relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,rgba(255,106,0,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="font-display text-accent text-[10px] tracking-[0.15em] uppercase mb-1.5">
              Контрол индекс
            </div>
            <div className="font-display font-bold text-ink text-[15px] leading-[1.2] tracking-display uppercase mb-1">
              Разбери къде си
            </div>
            <div className="text-ink-dim text-[11.5px] leading-snug">
              60 секунди · твоят baseline за следващите 60 дни
            </div>
          </div>
          <ArrowRight size={18} className="text-accent flex-shrink-0" strokeWidth={2.5} />
        </div>
      </motion.button>
    )
  }

  const tier = TIERS[latest.tier] || TIERS.medium
  const isInitial = latest.kind === 'initial'

  return (
    <motion.button
      type="button"
      onClick={onTap}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.18 }}
      whileTap={{ scale: 0.98 }}
      className="w-full mb-4 rounded-3xl border border-forest-line bg-forest-card/80 px-5 py-4 text-left active:bg-forest-card relative overflow-hidden"
      style={{ boxShadow: `inset 0 0 0 1px ${tier.color}1a` }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 90% 50%, ${tier.color}1a, transparent 60%)`
        }}
      />
      <div className="relative flex items-center gap-4">
        <MiniGauge score={latest.score} tierColor={tier.color} />
        <div className="flex-1 min-w-0">
          <div className="font-display text-[9.5px] tracking-[0.16em] uppercase mb-1" style={{ color: tier.color }}>
            {isInitial ? 'Стартов индекс' : 'Контрол индекс'}
          </div>
          <div className="font-display font-bold text-ink text-[14px] leading-[1.2] tracking-display uppercase">
            {tier.label}
          </div>
          <div className="text-ink-dim text-[11px] leading-snug mt-0.5 truncate">
            {tier.headline}
          </div>
        </div>
        <ArrowRight size={16} className="text-ink-muted flex-shrink-0" strokeWidth={2.5} />
      </div>
    </motion.button>
  )
}
