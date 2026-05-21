import { motion } from 'framer-motion'
import SectionLabel from './SectionLabel.jsx'

export default function TomorrowTeaser({ tomorrow, unlocked }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
    >
      <SectionLabel icon={tomorrow.icon} title={tomorrow.label} />

      <div className={`rounded-3xl border overflow-hidden ${
        tomorrow.moduleStart ? 'border-accent/40 bg-gradient-to-br from-accent/5 to-forest-card' : 'border-forest-line bg-forest-card'
      }`}>
        {tomorrow.image && (
          <div className="relative aspect-[16/10] w-full bg-forest-deep overflow-hidden">
            <img
              src={tomorrow.image}
              alt=""
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
              className={`w-full h-full object-cover transition-all ${
                unlocked ? '' : 'blur-md scale-105 opacity-70'
              }`}
            />
            {!unlocked && (
              <div className="absolute inset-0 bg-forest-deep/40 flex items-center justify-center">
                <span className="text-3xl" aria-hidden>🔒</span>
              </div>
            )}
          </div>
        )}
        <div className="p-6">
          {tomorrow.moduleStart && (
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 mb-3.5">
              <span className="font-display font-semibold text-accent text-[10px] tracking-[0.15em] uppercase">
                {tomorrow.moduleStart}
              </span>
            </div>
          )}
          <div className="text-ink-dim text-[10px] tracking-[0.12em] uppercase mb-2">
            Ден {tomorrow.dayNumber}
          </div>
          <h3 className="font-display font-bold text-ink text-[19px] leading-[1.2] mb-2.5">
            {tomorrow.title}
          </h3>
          <p className="text-ink-muted text-[15px] leading-[1.6]">{tomorrow.teaser}</p>
        </div>
      </div>
    </motion.section>
  )
}
