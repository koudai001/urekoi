import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CloseButton({
  onClick,
  className,
  iconClassName,
}: {
  onClick: () => void
  className?: string
  iconClassName?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label="閉じる"
      className={cn(
        'flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-card text-foreground shadow-lg transition-colors hover:bg-secondary',
        className,
      )}
    >
      <X className={cn('h-5 w-5', iconClassName)} />
    </button>
  )
}
