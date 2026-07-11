import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="mb-6 h-auto gap-1.5 p-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-card-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      戻る
    </Button>
  )
}
