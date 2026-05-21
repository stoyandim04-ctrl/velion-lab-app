import { Check } from 'lucide-react'
import Card from '../ui/Card.jsx'

export default function GoalCard({ goal, selected, onToggle }) {
  const Icon = goal.icon
  return (
    <Card selected={selected} onClick={() => onToggle(goal.id)} interactive>
      <div className="flex items-center gap-4">
        <div
          className={[
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition',
            selected ? 'bg-accent text-forest-deep' : 'bg-forest-line text-ink-muted'
          ].join(' ')}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="font-display font-semibold text-base tracking-display text-ink uppercase leading-tight">
            {goal.title}
          </div>
        </div>
        <div
          className={[
            'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition',
            selected ? 'bg-accent border-accent' : 'border-forest-line'
          ].join(' ')}
        >
          {selected && <Check size={14} strokeWidth={3} className="text-forest-deep" />}
        </div>
      </div>
    </Card>
  )
}
