import type { ReactNode } from 'react'

// signupフローの各ステップ共通の進捗バー(アイコン+ドット)。totalSteps個中currentStep個をprimary色で塗りつぶす
export function SignupProgressBar({
  icon,
  currentStep,
  totalSteps,
}: {
  icon: ReactNode
  currentStep: number
  totalSteps: number
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {icon}
      </span>
      <span className="flex flex-1 items-center gap-1.5 overflow-hidden">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              i < currentStep ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </span>
    </div>
  )
}
