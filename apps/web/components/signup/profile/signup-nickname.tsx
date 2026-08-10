import { IdCard } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { SignupProgressBar } from './signup-progress-bar'
import { SignupStepNav } from './signup-step-nav'
import type { ProfileFormValues } from '@/app/signup/profile/schema'

// 表示名(ニックネーム)入力
export function SignupNickname({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: () => void
}) {
  const { register, watch } = useFormContext<ProfileFormValues>()
  const canProceed = watch('nickname').trim().length > 0

  return (
    <div className="flex min-h-[520px] w-full max-w-md flex-col p-8">
      <SignupProgressBar
        icon={<IdCard className="h-5 w-5" />}
        currentStep={4}
        totalSteps={4}
      />

      {/* 見出し */}
      <h1 className="mt-8 text-2xl font-bold text-balance text-swipe-foreground">
        表示名を決めましょう
      </h1>
      <p className="mt-2 text-sm text-swipe-muted-foreground">
        あとから変更できます
      </p>

      {/* 表示名入力 */}
      <div className="mt-8">
        <input
          type="text"
          maxLength={20}
          placeholder="表示名を入力してください"
          {...register('nickname')}
          className="w-full border-none border-b-2 border-swipe-accent bg-transparent px-0.5 pt-1 pb-3 text-[19px] text-swipe-foreground outline-none placeholder:text-swipe-muted-foreground"
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
