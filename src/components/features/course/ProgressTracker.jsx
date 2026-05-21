import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import SectionLabel from './SectionLabel.jsx'

export default function ProgressTracker({ tracker, state, onToggle }) {
  const requiredItems = tracker.items.filter((i) => !i.optional)
  const requiredDone = requiredItems.filter((i) => state[i.id]).length

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <SectionLabel title={tracker.title} />
        <span className="text-ink-dim text-[10px]">
          {requiredDone}/{requiredItems.length}
        </span>
      </div>

      <div className="rounded-3xl border border-forest-line bg-forest-card p-2">
        <ul className="divide-y divide-forest-line/60">
          {tracker.items.map((item) => {
            const checked = Boolean(state[item.id])
            return (
              <li key={item.id}>
                <button
                  onClick={() => onToggle(item.id, !checked)}
                  className="w-full min-h-[52px] flex items-center gap-3.5 p-3.5 text-left active:bg-forest/40 rounded-2xl transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  <span
                    className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                      checked
                        ? 'bg-accent border-accent'
                        : 'border-ink-dim/50 bg-transparent'
                    }`}
                  >
                    {checked && <Check size={14} strokeWidth={3} className="text-forest-deep" />}
                  </span>
                  <span
                    className={`text-[15px] transition-colors ${
                      checked ? 'text-ink line-through decoration-ink-dim/60' : 'text-ink'
                    }`}
                  >
                    {item.label}
                    {item.optional && (
                      <span className="text-ink-dim text-xs ml-1.5">(по желание)</span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </motion.section>
  )
}
