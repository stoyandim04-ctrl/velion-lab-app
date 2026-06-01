// Reusable breathing guide. Supports two patterns out of the box:
//   - '4-7-8' (relaxation):       Вдишай 4s · Задръж 7s · Издишай 8s
//   - 'box'   (focus/regulation): Вдишай 4s · Задръж 4s · Издишай 4s · Задръж 4s
//
// Renders a pulsing circle that scales between 0.85x and 1.15x in
// sync with the active phase, the phase label inside, a phase counter
// underneath, and a total elapsed/remaining timer. Plays no audio.

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw } from 'lucide-react'

const PATTERNS = {
  '4-7-8': {
    label: '4-7-8 · Релаксация',
    phases: [
      { id: 'inhale', label: 'Вдишай', seconds: 4, scale: 1.15 },
      { id: 'hold-in', label: 'Задръж', seconds: 7, scale: 1.15 },
      { id: 'exhale', label: 'Издишай', seconds: 8, scale: 0.85 }
    ]
  },
  'box': {
    label: 'Box · Фокус',
    phases: [
      { id: 'inhale', label: 'Вдишай', seconds: 4, scale: 1.15 },
      { id: 'hold-in', label: 'Задръж', seconds: 4, scale: 1.15 },
      { id: 'exhale', label: 'Издишай', seconds: 4, scale: 0.85 },
      { id: 'hold-out', label: 'Задръж', seconds: 4, scale: 0.85 }
    ]
  }
}

export default function BreathingGuide({
  pattern = 'box',
  cycles = 4,
  onComplete,
  compact = false
}) {
  const config = PATTERNS[pattern] || PATTERNS.box

  const [phaseIndex, setPhaseIndex] = useState(0)
  const [phaseElapsed, setPhaseElapsed] = useState(0)
  const [cycle, setCycle] = useState(1)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const tickRef = useRef(null)

  const currentPhase = config.phases[phaseIndex]
  const phasesPerCycle = config.phases.length
  const cycleSeconds = config.phases.reduce((s, p) => s + p.seconds, 0)
  const totalSeconds = cycleSeconds * cycles

  const elapsedTotal = useMemo(() => {
    const prevPhases = config.phases.slice(0, phaseIndex).reduce((s, p) => s + p.seconds, 0)
    return (cycle - 1) * cycleSeconds + prevPhases + phaseElapsed
  }, [config.phases, phaseIndex, phaseElapsed, cycle, cycleSeconds])

  const remaining = Math.max(0, totalSeconds - elapsedTotal)

  useEffect(() => {
    if (!running || done) return
    tickRef.current = setInterval(() => {
      setPhaseElapsed((e) => e + 1)
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [running, done])

  useEffect(() => {
    if (!running) return
    if (phaseElapsed < currentPhase.seconds) return
    // Advance to next phase / cycle / complete
    setPhaseElapsed(0)
    setPhaseIndex((i) => {
      const nextI = i + 1
      if (nextI < phasesPerCycle) return nextI
      // Cycle finished
      setCycle((c) => {
        const nextC = c + 1
        if (nextC > cycles) {
          setDone(true)
          setRunning(false)
          if (onComplete) onComplete()
        }
        return nextC
      })
      return 0
    })
  }, [phaseElapsed, currentPhase.seconds, phasesPerCycle, cycles, running, onComplete])

  const reset = () => {
    setPhaseIndex(0)
    setPhaseElapsed(0)
    setCycle(1)
    setRunning(false)
    setDone(false)
  }

  const size = compact ? 168 : 240

  return (
    <div className="flex flex-col items-center">
      <div className="font-display text-accent text-[10.5px] tracking-[0.16em] uppercase mb-3">
        {config.label}
      </div>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,106,0,0.25), rgba(255,106,0,0.04) 60%, transparent 75%)',
            border: '1px solid rgba(255,106,0,0.35)'
          }}
          animate={
            running
              ? { scale: currentPhase.scale }
              : { scale: 1 }
          }
          transition={
            running
              ? { duration: currentPhase.seconds, ease: 'easeInOut' }
              : { duration: 0.4 }
          }
        />
        <div className="relative text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${cycle}-${phaseIndex}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <div className="font-display text-ink text-[20px] font-bold tracking-display uppercase">
                {done ? 'Завърши' : currentPhase.label}
              </div>
              <div className="font-display text-accent text-[42px] font-bold tracking-display mt-1">
                {done ? '✓' : Math.max(0, currentPhase.seconds - phaseElapsed)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 font-display text-ink-dim text-[10.5px] tracking-[0.14em] uppercase">
        {done
          ? `${cycles} цикъла · ${totalSeconds}s · готово`
          : `Цикъл ${Math.min(cycle, cycles)} / ${cycles} · ${remaining}s остават`}
      </div>

      <div className="flex items-center gap-2 mt-5">
        {!done ? (
          <button
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent text-forest-deep font-display text-[12px] font-bold tracking-display uppercase shadow-[0_0_20px_rgba(255,106,0,0.4)] active:scale-[0.97]"
          >
            {running ? <Pause size={14} strokeWidth={2.5} /> : <Play size={14} strokeWidth={2.5} />}
            {running ? 'Пауза' : phaseIndex === 0 && phaseElapsed === 0 && cycle === 1 ? 'Старт' : 'Продължи'}
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
