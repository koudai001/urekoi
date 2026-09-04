import Image from 'next/image'
import { useFormContext } from 'react-hook-form'
import { BackHeader } from '@/components/ui/back-header'
import { SignupProgressBar } from './signup-progress-bar'
import { SignupStepNav } from './signup-step-nav'
import type { ProfileFormValues } from '@/app/signup/profile/schema'

const options = [
  { value: 'male', label: '男性', image: '/profiles/me-1.png' },
  { value: 'female', label: '女性', image: '/profiles/woman-1.png' },
] as const

// signupフローのステップ4。性別選択
export function SignupGender({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: () => void
}) {
  const { watch, setValue } = useFormContext<ProfileFormValues>()
  const gender = watch('gender')

  return (
    <>
      <BackHeader onBack={onBack} />
      <div className="mx-auto w-full max-w-md px-14 pt-6">
        <SignupProgressBar currentStep={1} totalSteps={4} />

        {/* 見出し */}
        <h1 className="mt-8 text-2xl font-bold text-balance text-foreground">
          あなたの性別は？
        </h1>

        {/* 選択肢 */}
        <div className="mt-8 flex justify-center gap-6">
          {options.map((option) => {
            const selected = gender === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('gender', option.value)}
                aria-pressed={selected}
                className={`flex cursor-pointer flex-col items-center gap-3 rounded-full p-4 transition-all ${
                  selected
                    ? 'bg-primary/15 ring-2 ring-primary'
                    : 'bg-card hover:bg-card/70'
                }`}
              >
                <span className="h-24 w-24 overflow-hidden rounded-full border-2 border-border shadow-sm">
                  <Image
                    src={option.image || '/placeholder.svg'}
                    alt={option.label}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="text-lg font-bold text-foreground">
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>

        <SignupStepNav onNext={onNext} nextDisabled={!gender} />
      </div>
    </>
  )
}
