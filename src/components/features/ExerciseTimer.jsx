// Generic countdown timer for exercises (Kegel sets, edging holds,
// presence drills). Drop-in component:
//
//   <ExerciseTimer
//     title="Squeeze · Hold"
//     seconds={30}
//     sets={5}
//     restSeconds={15}
//     onComplete={...}
//   />
//
// Switches between a working phase and a rest phase, counts down sets,
// and fires onComplete after the final set. Visualises progress with a
// circular SVG ring that drains as time elapses.

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Check } from 'lucide-react'

export default function ExerciseTimer({
  title = 'Упражнение',
  seconds = 30,
  sets = 1,
  restSeconds = 0,
  onComplete,
  size = 200
}) {
  const [phase, setPhase] = useState('work') // 'work' | 'rest' | 'done'
  const [set, setSet] = useState(1)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const tickRef = useRef(null)

  const phaseDuration = phase === 'rest' ? restSeconds : seconds
  const remaining = Math.max(0, phaseDuration - elapsed)

  useEffect(() => {
    if (!running) return
    tickRef.current = setInterval(() => {
      setElapsed((e) => e + 1)
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [running])

  useEffect(() => {
    if (!running) return
    if (elapsed < phaseDuration) return
    // phase complete
    setElapsed(0)
    if (phase === 'work') {
      if (set >= sets) {
        setPhase('done')
        setRunning(false)
        if (onComplete) onComplete()
        return
      }
      if (restSeconds > 0) {
        setPhase('rest')
      } else {
        setSet((s) => s + 1)
      }
    } else if (phase === 'rest') {
      setPhase('work')
      setSet((s) => s + 1)
    }
  }, [elapsed, phaseDuration, phase, set, sets, restSeconds, onComplete, running])

  const reset = () => {
    setPhase('work')
    setSet(1)
    setElapsed(0)
    setRunning(false)
  }

  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = useMemo(
    () => (phaseDuration > 0 ? elapsed / phaseDuration : 0),
    [elapsed, phaseDuration]
  )
  const offset = circumference * (1 - progress)
  const color = phase === 'rest' ? '#3DD68C' : phase === 'done' ? '#FFD56E' : '#FF6A00'

  return (
    <div className="flex flex-col items-center">
      <div className="font-display text-accent text-[10.5px] tracking-[0.16em] uppercase mb-2">
        {title}
      </div>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: 'linear' }}
            style={{ filter: `drop-shadow(0 0 10px ${color}88)` }}
          />
        </svg>
        <div className="relative text-center">
          {phase === 'done' ? (
            <>
              <div className="font-display font-bold text-[36px]" style={{ color }}>
                <Check size={48} strokeWidth={3} className="mx-auto" />
              </div>
              <div className="font-display text-ink text-[12px] tracking-[0.16em] uppercase mt-1">
                Завърши
              </div>
            </>
          ) : (
            <>
              <div
                className="font-display font-bold tracking-display"
                style={{ color, fontSize: 56, textShadow: `0 0 22px ${color}55` }}
              >
                {remaining}
              </div>
              <div className="font-display text-ink-muted text-[10.5px] tracking-[0.16em] uppercase mt-1">
                {phase === 'rest' ? 'Почивка' : 'Работа'}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 font-display text-ink-dim text-[10.5px] tracking-[0.14em] uppercase">
        Сет {Math.min(set, sets)} / {sets}
      </div>

      <div className="flex items-center gap-2 mt-4">
        {phase !== 'done' ? (
          <button
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent text-forest-deep font-display text-[12px] font-bold tracking-display uppercase shadow-[0_0_20px_rgba(255,106,0,0.4)] active:scale-[0.97]"
          >
            {running ? <Pause size={14} strokeWidth={2.5} /> : <Play size={14} strokeWidth={2.5} />}
            {running ? 'Пауза' : set === 1 && elapsed === 0 ? 'Старт' : 'Продължи'}
          </button>
        ) : (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-accent/40 bg-accent/5 text-accent font-display text-[12px] font-bold tracking-display uppercase active:scale-[0.97]"
          >
            <RotateCcw size={14} strokeWidth={2.5} />
            Отново
          </button>
        )}
      </div>
    </div>
  )
}
