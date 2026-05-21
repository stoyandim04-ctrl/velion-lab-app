import { motion } from 'framer-motion'

export default function VictoryCard({ victory }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl overflow-hidden border border-accent/30 bg-gradient-to-br from-accent/8 to-forest-card p-7"
    >
      <h3 className="font-display font-semibold text-accent text-xs tracking-[0.15em] uppercase mb-4">
        {victory.title}
      </h3>
      <p className="font-display text-ink text-[18px] leading-[1.5] mb-5">
        {victory.text}
      </p>
      {victory.badge && (
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-display font-semibold text-accent text-[10px] tracking-[0.15em] uppercase">
            {victory.badge}
          </span>
        </div>
      )}
    </motion.section>
  )
}
