import { motion } from 'framer-motion'

export default function SignalsList({ signals }) {
  return (
    <div className="space-y-3">
      {signals.map((s) => (
        <motion.div
          key={s.n}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: s.n * 0.04 }}
          className="rounded-2xl border border-forest-line bg-forest-card p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-7 rounded-full bg-accent/15 border border-accent/40 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
              {s.n}
            </span>
            <h4 className="font-display font-semibold text-ink text-[15px] leading-tight">
              {s.title}
            </h4>
          </div>
          <p className="text-ink/85 text-[14px] leading-[1.6] pl-10">
            {s.body}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
