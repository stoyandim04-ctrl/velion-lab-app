import { Star } from 'lucide-react'

export default function TestimonialCard({ t }) {
  return (
    <div className="rounded-2xl bg-forest-card border border-forest-line p-5">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            strokeWidth={0}
            className={i < t.rating ? 'fill-accent' : 'fill-forest-line'}
          />
        ))}
      </div>
      <p className="text-ink text-sm leading-relaxed mb-4">{t.text}</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-soft flex items-center justify-center font-display font-bold text-forest-deep text-sm">
          {t.initials}
        </div>
        <div>
          <div className="text-ink font-medium text-sm">{t.name}</div>
          <div className="text-ink-dim text-xs">{t.meta}</div>
        </div>
      </div>
    </div>
  )
}
