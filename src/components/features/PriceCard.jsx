import Card from '../ui/Card.jsx'

export default function PriceCard({ plan, selected, onSelect }) {
  return (
    <Card selected={selected} onClick={onSelect} interactive className="relative">
      {plan.badge && (
        <div className="absolute -top-3 right-5 bg-accent text-forest-deep font-display text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-full font-bold">
          {plan.badge}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display font-semibold text-lg tracking-display text-ink uppercase">
            {plan.name}
          </div>
          {plan.subtitle && <div className="text-ink-dim text-xs mt-1">{plan.subtitle}</div>}
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-2xl text-accent tracking-display">
            {plan.price}
          </div>
          <div className="text-ink-dim text-[11px] tracking-wider uppercase">{plan.period}</div>
        </div>
      </div>
      {plan.note && (
        <div className="mt-3 text-ink-muted text-xs">{plan.note}</div>
      )}
    </Card>
  )
}
