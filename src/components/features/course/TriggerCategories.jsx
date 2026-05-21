import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function TriggerCategories({ categories }) {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <div className="space-y-2.5">
      {categories.map((c, i) => {
        const open = openIdx === i
        return (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`rounded-2xl border overflow-hidden transition-all ${
              open
                ? 'border-accent/30 bg-gradient-to-br from-accent/6 to-forest-card'
                : 'border-forest-line bg-forest-card'
            }`}
          >
            <button
              onClick={() => setOpenIdx(open ? -1 : i)}
              className="w-full min-h-[56px] flex items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-xl" aria-hidden>{c.icon}</span>
                <span className="font-display font-semibold text-ink text-[15px] tracking-display uppercase">
                  {c.name}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>
            {open && (
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="px-5 pb-5 space-y-2.5"
              >
                {c.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="w-1 h-1 rounded-full bg-accent mt-2.5 flex-shrink-0" />
                    <span className="text-ink/90 text-[15px] leading-[1.6]">{item}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
