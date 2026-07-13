import { IdCard } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { SignupProgressBar } from './signup-progress-bar'
import { SignupStepNav } from './signup-step-nav'
import type { SignupFormValues } from './schema'

// signupフローのステップ7。表示名(ニックネーム)入力(locationの次、emailの前)
export function SignupNickname({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: () => void
}) {
  const { register, watch } = useFormContext<SignupFormValues>()
  const canProceed = watch('nickname').trim().length > 0

  return (
    <div className="flex min-h-[520px] w-full max-w-md flex-col rounded-3xl bg-card p-8 shadow-sm">
      <SignupProgressBar
        icon={<IdCard className="h-5 w-5" />}
        currentStep={4}
        totalSteps={4}
      />

      {/* 見出し */}
      <h1 className="mt-8 text-2xl font-bold text-balance text-card-foreground">
        あなたの表示名を決めましょう
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">あとから変更できます</p>

      {/* 表示名入力 */}
      <div className="mt-8">
        <input
          type="text"
          maxLength={20}
          placeholder="表示名を入力してください"
          {...register('nickname')}
          className="w-full border-none border-b-2 border-primary bg-transparent px-0.5 pt-1 pb-3 text-[19px] text-card-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <SignupStepNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!canProceed}
      />
    </div>
  )
}
