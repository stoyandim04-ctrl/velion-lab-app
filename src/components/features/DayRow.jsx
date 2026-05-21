import { Check, Lock, Play } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DayRow({ day, onClick }) {
  const isCompleted = day.status === 'completed'
  const isActive = day.status === 'active'
  const isLocked = day.status === 'locked'

  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick?.(day)}
      className={[
        'w-full min-h-[68px] flex items-center gap-4 px-4 py-4 rounded-2xl border text-left transition',
        isActive
          ? 'bg-forest-card border-accent'
          : isCompleted
          ? 'bg-forest-card border-forest-line'
          : 'bg-forest-card/40 border-forest-line/60'
      ].join(' ')}
    >
      <div
        className={[
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition',
          isActive
            ? 'bg-accent text-forest-deep'
            : isCompleted
            ? 'bg-accent/15 text-accent border border-accent/40'
            : 'bg-forest-line text-ink-dim'
        ].join(' ')}
      >
        {isCompleted ? (
          <Check size={18} strokeWidth={2.5} />
        ) : isActive ? (
          <Play size={16} strokeWidth={2.5} className="ml-0.5 fill-forest-deep" />
        ) : (
          <Lock size={14} strokeWidth={2.2} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold text-[11px] tracking-[0.1em] text-ink-dim uppercase mb-1">
          Ден {day.day}
        </div>
        <div
          className={[
            'text-[15px] leading-[1.3] break-words',
            isLocked ? 'text-ink-dim' : 'text-ink'
          ].join(' ')}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {isLocked && !day.named ? 'Заключено' : day.title}
        </div>
      </div>

      {isActive && (
        <div className="font-display text-[10px] tracking-[0.1em] text-accent uppercase font-semibold shrink-0">
          Започни
        </div>
      )}
    </motion.button>
  )
}
