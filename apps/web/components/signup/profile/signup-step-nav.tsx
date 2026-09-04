import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// signupフローの各ステップ共通の下部ナビ
export function SignupStepNav({
  onNext,
  nextDisabled,
  className,
}: {
  onNext: () => void
  nextDisabled?: boolean
  className?: string
}) {
  return (
    <div className={cn('pt-8', className)}>
      <Button
        type="button"
        disabled={nextDisabled}
        onClick={onNext}
        className="h-12 w-full rounded-lg text-white"
      >
        次へ
      </Button>
    </div>
  )
}
