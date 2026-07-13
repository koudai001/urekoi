import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function BackButton({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        'mb-6 h-auto gap-1.5 p-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-card-foreground',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      戻る
    </Button>
  )
}
