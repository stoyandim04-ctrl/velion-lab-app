export default function SectionLabel({ title, duration }) {
  return (
    <div className="flex items-baseline gap-2 mb-3">
      <h2 className="font-display font-semibold text-ink-muted text-xs tracking-[0.12em] uppercase">
        {title}
      </h2>
      {duration && (
        <span className="text-ink-dim text-[10px]">
          · {duration}
        </span>
      )}
    </div>
  )
}
