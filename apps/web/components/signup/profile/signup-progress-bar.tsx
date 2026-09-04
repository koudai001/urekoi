// signupフローの現在位置を数字と細いバーで示す
export function SignupProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number
  totalSteps: number
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium">プロフィール登録</span>
        <span className="text-muted-foreground">
          {currentStep} / {totalSteps}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-primary"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  )
}
