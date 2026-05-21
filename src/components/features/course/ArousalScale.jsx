import { motion } from 'framer-motion'

const TONE_STYLES = {
  calm:     { dot: 'bg-ink-dim/40',     label: 'text-ink-muted' },
  safe:     { dot: 'bg-emerald-400/60', label: 'text-ink' },
  sweet:    { dot: 'bg-accent',         label: 'text-accent font-semibold' },
  warning:  { dot: 'bg-amber-400',      label: 'text-amber-200' },
  danger:   { dot: 'bg-orange-500',     label: 'text-orange-200' },
  critical: { dot: 'bg-red-500',        label: 'text-red-200' },
  end:      { dot: 'bg-red-700',        label: 'text-red-300' }
}

export default function ArousalScale({ scale }) {
  return (
    <div className="rounded-3xl border border-forest-line bg-forest-card overflow-hidden">
      <div className="px-6 pt-6 pb-3.5 border-b border-forest-line">
        <h3 className="font-display font-semibold text-ink text-[10px] tracking-[0.15em] uppercase">
          {scale.title}
        </h3>
      </div>
      <ul className="p-3 space-y-1">
        {scale.levels.map((lv, i) => {
          const styles = TONE_STYLES[lv.tone] || TONE_STYLES.calm
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex items-start gap-3 p-3 rounded-xl"
            >
              <div className="flex items-center gap-2 flex-shrink-0 w-14">
                <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
                <span className="font-display font-bold text-ink text-[15px]">{lv.range}</span>
              </div>
              <span className={`text-[15px] leading-[1.45] ${styles.label}`}>
                {lv.label}
              </span>
            </motion.li>
          )
        })}
      </ul>
      {scale.note && (
        <div className="px-6 py-5 border-t border-forest-line bg-forest/30">
          <p className="text-ink-muted text-[13px] leading-[1.65] italic">{scale.note}</p>
        </div>
      )}
    </div>
  )
}
