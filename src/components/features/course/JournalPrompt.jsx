import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import SectionLabel from './SectionLabel.jsx'

export default function JournalPrompt({ journal, value, onChange }) {
  const [open, setOpen] = useState(Boolean(value))
  const textareaRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [open, value])

  const handleInput = (e) => {
    const text = e.target.value
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onChange(text), 300)
  }

  const handleFocus = () => {
    setTimeout(() => {
      textareaRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 180)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <SectionLabel icon={journal.icon} title={journal.title} />

      <div className="rounded-3xl border border-forest-line bg-forest-card overflow-hidden">
        <div className="p-6 border-b border-forest-line">
          <p className="font-display italic text-ink text-[18px] leading-[1.45]">
            „{journal.prompt}"
          </p>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full min-h-[52px] flex items-center justify-between px-5 py-4 text-left transition-colors"
        >
          <span className="text-ink-muted text-[15px]">
            Моят отговор <span className="text-ink-dim text-xs">(опционално)</span>
          </span>
          <ChevronDown
            size={18}
            className={`text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="px-5 pb-6">
            <textarea
              ref={textareaRef}
              defaultValue={value}
              onInput={handleInput}
              onFocus={handleFocus}
              placeholder={journal.placeholder}
              rows={4}
              className="w-full bg-forest-deep border border-forest-line rounded-2xl p-5 text-ink text-[15px] leading-[1.65] placeholder:text-ink-dim placeholder:italic resize-none focus:outline-none focus:border-accent/40 transition-colors"
              style={{ scrollMarginBottom: 240 }}
            />
            <p className="text-ink-dim text-[10px] mt-2.5">
              Записва се автоматично
            </p>
          </div>
        )}
      </div>
    </motion.section>
  )
}
