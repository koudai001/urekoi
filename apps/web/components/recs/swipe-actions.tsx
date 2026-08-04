import { X, Heart } from 'lucide-react'

// スワイプカード下のアクションボタン
export function SwipeActions({
  onSkip,
  onLike,
}: {
  onSkip: () => void
  onLike: () => void
}) {
  return (
    <div className="flex items-center justify-center gap-12">
      <ActionButton icon={X} label="スキップ" onClick={onSkip} />
      <ActionButton
        icon={Heart}
        label="いいね！を送る"
        accent
        onClick={onLike}
      />
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  accent,
  onClick,
}: {
  icon: React.ElementType
  label: string
  accent?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full text-swipe-foreground ${
        accent
          ? 'bg-gradient-to-br from-swipe-accent to-primary'
          : 'bg-swipe-surface'
      }`}
    >
      <Icon className="h-6.5 w-6.5" />
    </button>
  )
}
