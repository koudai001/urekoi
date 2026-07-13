import { Check, MapPin } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { PREFECTURES } from '@/lib/prefectures'
import { SignupProgressBar } from './signup-progress-bar'
import { SignupStepNav } from './signup-step-nav'
import type { SignupFormValues } from './schema'

// signupフローのステップ6。居住都道府県の選択(birthdayの次、nicknameの前)
export function SignupLocation({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: () => void
}) {
  const { watch, setValue } = useFormContext<SignupFormValues>()
  const prefectureCode = watch('prefectureCode')

  return (
    <div className="flex min-h-[520px] w-full max-w-md flex-col rounded-3xl bg-card p-8 shadow-sm">
      <SignupProgressBar
        icon={<MapPin className="h-5 w-5" />}
        currentStep={3}
        totalSteps={4}
      />

      {/* 見出し */}
      <h1 className="mt-8 text-2xl font-bold text-balance text-card-foreground">
        あなたはどちらにお住まいですか?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        地域が近いお相手に探しやすくなります
      </p>

      {/* 都道府県リスト */}
      <div className="mt-6 max-h-[260px] flex-1 overflow-y-auto">
        {PREFECTURES.map((pref) => {
          const selected = prefectureCode === pref.code
          return (
            <button
              key={pref.code}
              type="button"
              onClick={() => setValue('prefectureCode', pref.code)}
              aria-pressed={selected}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2.5 text-left transition-colors hover:bg-secondary/60"
            >
              <span className="flex w-4 shrink-0 items-center justify-center">
                {selected && <Check className="h-4 w-4 text-primary" />}
              </span>
              <span
                className={`text-[17px] ${
                  selected
                    ? 'font-bold text-card-foreground'
                    : 'font-medium text-muted-foreground'
                }`}
              >
                {pref.name}
              </span>
            </button>
          )
        })}
      </div>

      <SignupStepNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!prefectureCode}
        className="mt-4 pt-4"
      />
    </div>
  )
}
