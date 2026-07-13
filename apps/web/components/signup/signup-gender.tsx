import Image from 'next/image'
import { Smile } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { SignupProgressBar } from './signup-progress-bar'
import { SignupStepNav } from './signup-step-nav'
import type { SignupFormValues } from './schema'

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
  const { watch, setValue } = useFormContext<SignupFormValues>()
  const gender = watch('gender')

  return (
    <div className="flex min-h-[520px] w-full max-w-md flex-col rounded-3xl bg-card p-8 shadow-sm">
      <SignupProgressBar
        icon={<Smile className="h-5 w-5" />}
        currentStep={1}
        totalSteps={4}
      />

      {/* 見出し */}
      <h1 className="mt-8 text-2xl font-bold text-balance text-card-foreground">
        あなたの性別を教えてください
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
                  : 'bg-secondary hover:bg-secondary/70'
              }`}
            >
              <span className="h-24 w-24 overflow-hidden rounded-full border-2 border-card shadow-sm">
                <Image
                  src={option.image || '/placeholder.svg'}
                  alt={option.label}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-lg font-bold text-card-foreground">
                {option.label}
              </span>
            </button>
          )
        })}
      </div>

      <SignupStepNav onBack={onBack} onNext={onNext} nextDisabled={!gender} />
    </div>
  )
}
