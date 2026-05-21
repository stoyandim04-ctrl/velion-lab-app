import { motion } from 'framer-motion'
import { useState } from 'react'

export default function MythsList({ myths }) {
  const [active, setActive] = useState(null)

  return (
    <div className="space-y-3">
      {myths.map((m) => {
        const open = active === m.n
        return (
          <motion.button
            key={m.n}
            onClick={() => setActive(open ? null : m.n)}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: m.n * 0.04 }}
            className={`w-full text-left rounded-2xl border p-5 transition-all ${
              open
                ? 'border-accent/40 bg-gradient-to-br from-accent/8 to-forest-card'
                : 'border-forest-line bg-forest-card'
            }`}
          >
            <div className="flex items-center gap-3 mb-2.5">
              <span className="w-7 h-7 rounded-full bg-accent/15 border border-accent/40 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
                {m.n}
              </span>
              <span className="font-display text-[10px] tracking-[0.12em] uppercase text-ink-dim">
                Мит
              </span>
            </div>
            <p className="text-ink text-[16px] leading-[1.5] mb-3 font-medium">
              {m.myth}
            </p>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="pt-4 border-t border-forest-line/60"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display text-[10px] tracking-[0.12em] uppercase text-accent font-semibold">
                    Истина
                  </span>
                </div>
                <p className="text-ink/90 text-[15px] leading-[1.65]">{m.truth}</p>
              </motion.div>
            )}
            {!open && (
              <p className="text-ink-dim text-xs italic">Натисни за истината →</p>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
