import { Check, Lock, Play, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DayRow({ day, onClick }) {
  const isCompleted = day.status === 'completed'
  const isActive = day.status === 'active'
  const isLocked = day.status === 'locked'

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={() => onClick?.(day)}
      className={[
        'group relative w-full min-h-[72px] overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all',
        isActive
          ? 'bg-forest-card border-accent shadow-[0_0_24px_rgba(255,106,0,0.16)]'
          : isCompleted
          ? 'bg-forest-card border-forest-line'
          : 'bg-forest-card/35 border-forest-line/60'
      ].join(' ')}
    >
      {isActive && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_50%,rgba(255,106,0,0.18),transparent_36%)]" />
      )}
      {isLocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/30 via-transparent to-accent/5" />
      )}

      <div className="relative z-10 flex items-center gap-4">
        <div
          className={[
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition',
            isActive
              ? 'bg-accent text-forest-deep shadow-glow-soft'
              : isCompleted
              ? 'bg-accent/15 text-accent border border-accent/40'
              : 'bg-forest-line/80 text-ink-dim border border-forest-line'
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
              'text-[15px] leading-[1.3] break-words transition',
              isLocked ? 'text-ink-muted blur-[0.35px]' : 'text-ink'
            ].join(' ')}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {day.title}
          </div>
        </div>

        {isActive && (
          <div className="font-display text-[10px] tracking-[0.1em] text-accent uppercase font-semibold shrink-0">
            Започни
          </div>
        )}

        {isLocked && (
          <div className="flex items-center gap-1.5 rounded-full border border-forest-line bg-forest-deep/50 px-2.5 py-1 text-[10px] text-ink-dim shrink-0">
            <Sparkles size={11} />
            <span>Скоро</span>
          </div>
        )}
      </div>
    </motion.button>
  )
}
