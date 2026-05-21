import { motion } from 'framer-motion'
import SectionLabel from './SectionLabel.jsx'

export default function FactCard({ fact }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <SectionLabel icon={fact.icon} title={fact.title} />
      <div className="rounded-3xl border-l-4 border-l-accent border-y border-r border-y-forest-line border-r-forest-line bg-forest-card p-6">
        <div className="flex gap-3.5">
          <span className="text-2xl flex-shrink-0 leading-none mt-0.5" aria-hidden>{fact.icon}</span>
          <p className="text-ink text-[16px] leading-[1.65]">{fact.text}</p>
        </div>
      </div>
    </motion.section>
  )
}
