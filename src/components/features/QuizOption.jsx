import Card from '../ui/Card.jsx'

export default function QuizOption({ label, selected, onSelect }) {
  return (
    <Card selected={selected} onClick={onSelect} interactive>
      <div className="flex items-center justify-between">
        <span className="font-display font-medium text-base tracking-display uppercase text-ink">
          {label}
        </span>
        <span
          className={[
            'w-5 h-5 rounded-full border-2 transition',
            selected ? 'border-accent bg-accent shadow-[0_0_12px_rgba(255,106,0,0.6)]' : 'border-forest-line'
          ].join(' ')}
        />
      </div>
    </Card>
  )
}
