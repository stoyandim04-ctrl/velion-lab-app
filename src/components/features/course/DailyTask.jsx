import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import SectionLabel from './SectionLabel.jsx'

export default function DailyTask({ task, done, onToggleDone }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <SectionLabel icon={task.icon} title={task.title} />
      <div className="rounded-3xl border border-forest-line bg-forest-card p-6">
        <div className="flex gap-3.5 mb-5">
          <span className="text-2xl flex-shrink-0 leading-none mt-0.5" aria-hidden>{task.icon}</span>
          <p className="text-ink text-[16px] leading-[1.65]">
            {task.highlight ? (
              <>
                {task.text.split(task.highlight)[0]}
                <span className="text-accent font-semibold">{task.highlight}</span>
                {task.text.split(task.highlight)[1]}
              </>
            ) : (
              task.text
            )}
          </p>
        </div>
        <button
          onClick={onToggleDone}
          className={`w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium transition-all active:scale-[0.98] ${
            done
              ? 'bg-accent text-forest-deep'
              : 'bg-forest border border-forest-line text-ink'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          {done && <Check size={16} strokeWidth={3} />}
          {done ? 'Забелязах' : 'Маркирай като забелязано'}
        </button>
      </div>
    </motion.section>
  )
}
