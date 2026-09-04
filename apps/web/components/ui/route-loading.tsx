import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RouteLoading({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="読み込み中"
      className={cn(
        'flex min-h-0 flex-1 items-center justify-center bg-background',
        className,
      )}
    >
      <Loader2
        className="size-10 animate-spin text-primary motion-reduce:animate-none"
        aria-hidden="true"
      />
    </div>
  )
}
