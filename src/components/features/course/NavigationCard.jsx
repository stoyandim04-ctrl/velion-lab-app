import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const STATUS_STYLES = {
  completed: {
    border: 'border-forest-line',
    bg: 'bg-forest-card',
    text: 'text-ink-muted',
    label: 'Завършен'
  },
  current: {
    border: 'border-accent/40',
    bg: 'bg-gradient-to-br from-accent/10 to-forest-card',
    text: 'text-ink',
    label: 'Текущ'
  },
  locked: {
    border: 'border-forest-line',
    bg: 'bg-forest-card/50',
    text: 'text-ink-dim',
    label: 'Заключен'
  }
}

export default function NavigationCard({ items }) {
  const navigate = useNavigate()

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-3">
        <h2 className="font-display font-semibold text-ink-muted text-xs tracking-[0.12em] uppercase">
          Навигация
        </h2>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const styles = STATUS_STYLES[item.status]
          const clickable = item.status !== 'locked' && item.status !== 'current' && item.route
          const Wrapper = clickable ? 'button' : 'div'

          return (
            <Wrapper
              key={item.day}
              onClick={clickable ? () => navigate(item.route) : undefined}
              className={`w-full text-left rounded-2xl border ${styles.border} ${styles.bg} p-4 flex items-center gap-3.5 transition-all`}
            >
              <span className="text-xl flex-shrink-0" aria-hidden>{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`font-display font-semibold text-xs tracking-[0.08em] uppercase ${
                    item.status === 'current' ? 'text-accent' : 'text-ink-dim'
                  }`}>
                    Ден {item.day}
                  </span>
                  <span className="text-ink-dim text-[10px]">
                    · {styles.label}
                  </span>
                </div>
                <div className={`text-[15px] leading-[1.3] truncate ${styles.text}`}>
                  {item.title}
                </div>
                {item.hint && (
                  <div className="text-ink-dim text-[11px] mt-1.5 italic">{item.hint}</div>
                )}
              </div>
            </Wrapper>
          )
        })}
      </div>
    </motion.section>
  )
}
