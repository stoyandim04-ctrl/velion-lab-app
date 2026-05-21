import { motion } from 'framer-motion'
import { Check, ShieldAlert } from 'lucide-react'
import SectionLabel from './SectionLabel.jsx'

function StepList({ steps, startFrom = 1 }) {
  return (
    <ol className="space-y-3.5">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3.5 items-start">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/15 border border-accent/40 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
            {startFrom + i}
          </span>
          <span className="text-ink text-[15px] leading-[1.6] flex-1">{step}</span>
        </li>
      ))}
    </ol>
  )
}

export default function ExerciseCard({ exercise, done, onToggleDone }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
    >
      <SectionLabel icon={exercise.icon} title={exercise.title} duration={exercise.duration} />

      <div className="rounded-3xl border border-forest-line bg-forest-card overflow-hidden">
        {exercise.image && (
          <div className="aspect-square sm:aspect-[4/5] w-full bg-forest-deep overflow-hidden">
            <img
              src={exercise.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        )}

        <div className="p-6">
          <h3 className="font-display font-bold text-ink text-[20px] leading-tight mb-2">
            {exercise.subtitle}
          </h3>
          <p className="text-ink-muted text-[15px] leading-[1.55] mb-6">
            <span className="text-accent font-medium">Цел: </span>
            {exercise.goal}
          </p>

          {exercise.steps && <div className="mb-6"><StepList steps={exercise.steps} /></div>}

          {exercise.sections && (
            <div className="space-y-6 mb-6">
              {exercise.sections.map((sec, i) => (
                <div key={i}>
                  <h4 className="font-display font-semibold text-accent text-[10px] tracking-[0.12em] uppercase mb-3.5">
                    {sec.label}
                  </h4>
                  <StepList steps={sec.steps} />
                </div>
              ))}
            </div>
          )}

          {exercise.mantra && (
            <div className="rounded-2xl bg-accent/8 border border-accent/30 p-5 mb-5">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 leading-none mt-0.5" aria-hidden>{exercise.mantra.icon}</span>
                <div>
                  <p className="text-ink font-display font-medium text-[16px] leading-[1.55] italic">
                    {exercise.mantra.text}
                  </p>
                  <p className="text-accent text-[11px] mt-2.5 tracking-[0.06em] uppercase">
                    {exercise.mantra.repeat}
                  </p>
                </div>
              </div>
            </div>
          )}

          {exercise.effect && (
            <p className="text-ink-muted text-[13px] leading-[1.6] italic mb-4">
              <span className="text-ink/80 font-medium not-italic">Очакван ефект: </span>
              {exercise.effect}
            </p>
          )}

          {exercise.safety && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 mb-2">
              <div className="flex gap-3 items-start">
                <ShieldAlert size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-display text-amber-300 text-[10px] tracking-[0.12em] uppercase font-semibold mb-1.5">
                    Safety
                  </div>
                  <p className="text-ink/90 text-[13px] leading-[1.6]">{exercise.safety}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onToggleDone}
            className={`mt-6 w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium tracking-wide transition-all active:scale-[0.98] ${
              done
                ? 'bg-accent text-forest-deep'
                : 'bg-forest border border-forest-line text-ink'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            {done && <Check size={16} strokeWidth={3} />}
            {done ? 'Упражнението е направено' : 'Маркирай като направено'}
          </button>
        </div>
      </div>
    </motion.section>
  )
}
