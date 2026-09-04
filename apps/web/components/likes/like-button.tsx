import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

// いいね送信に使うボタンの見た目を、表示場所に依存しない形で共通化する
export function LikeButton({
  label,
  pendingLabel = '送信中...',
  isPending = false,
  disabled = false,
  onClick,
  className,
}: {
  label: string
  pendingLabel?: string
  isPending?: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={onClick}
      className={cn(
        'flex min-w-44 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-foreground shadow-xl transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      <Heart className="size-6 fill-current" aria-hidden="true" />
      {isPending ? pendingLabel : label}
    </button>
  )
}
