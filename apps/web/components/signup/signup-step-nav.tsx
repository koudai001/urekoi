import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// signupフローの各ステップ共通の下部ナビ(戻る/次への丸ボタン)
export function SignupStepNav({
  onBack,
  onNext,
  nextDisabled,
  className,
}: {
  onBack: () => void
  onNext: () => void
  nextDisabled?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'mt-auto flex items-center justify-between pt-8',
        className,
      )}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="前へ戻る"
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-secondary text-card-foreground transition-colors hover:bg-secondary/70"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        disabled={nextDisabled}
        onClick={onNext}
        aria-label="次へ進む"
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
