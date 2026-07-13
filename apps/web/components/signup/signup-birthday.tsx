import type { ChangeEvent } from 'react'
import { Cake } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { SignupProgressBar } from './signup-progress-bar'
import { SignupStepNav } from './signup-step-nav'
import type { SignupFormValues } from './schema'

// 数字以外を除去し、指定桁数までに切り詰める
function sanitizeDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

// signupフローのステップ5。生年月日入力(genderの次、locationの前)
export function SignupBirthday({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: () => void
}) {
  const {
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<SignupFormValues>()
  const year = watch('birthYear')
  const month = watch('birthMonth')
  const day = watch('birthDay')
  const canProceed = year.length === 4 && month.length >= 1 && day.length >= 1

  const handleYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue('birthYear', sanitizeDigits(e.target.value, 4))
  }
  const handleMonthChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue('birthMonth', sanitizeDigits(e.target.value, 2))
  }
  const handleDayChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue('birthDay', sanitizeDigits(e.target.value, 2))
  }

  // 実在日付・年齢・性別×年齢の業務ルールをチェックしてから次へ進む
  const handleNext = async () => {
    const isValid = await trigger('birthDay')
    if (isValid) onNext()
  }

  return (
    <div className="flex min-h-[520px] w-full max-w-md flex-col rounded-3xl bg-card p-8 shadow-sm">
      <SignupProgressBar
        icon={<Cake className="h-5 w-5" />}
        currentStep={2}
        totalSteps={4}
      />

      {/* 見出し */}
      <h1 className="mt-8 text-2xl font-bold text-balance text-card-foreground">
        あなたの誕生日を教えてください
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        一度登録すると誕生日の変更はできません
      </p>

      {/* 入力欄 */}
      <div className="mt-12 flex items-baseline justify-center gap-2.5">
        <div className="flex flex-col items-center gap-1.5">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="YYYY"
            value={year}
            onChange={handleYearChange}
            className="w-[76px] border-none bg-transparent text-center text-[28px] font-bold text-card-foreground outline-none placeholder:text-border"
          />
          <span className="h-px w-[76px] bg-border" />
        </div>
        <span className="pb-3.5 text-[22px] text-border">/</span>
        <div className="flex flex-col items-center gap-1.5">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="MM"
            value={month}
            onChange={handleMonthChange}
            className="w-12 border-none bg-transparent text-center text-[28px] font-bold text-card-foreground outline-none placeholder:text-border"
          />
          <span className="h-px w-12 bg-border" />
        </div>
        <span className="pb-3.5 text-[22px] text-border">/</span>
        <div className="flex flex-col items-center gap-1.5">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="DD"
            value={day}
            onChange={handleDayChange}
            className="w-12 border-none bg-transparent text-center text-[28px] font-bold text-card-foreground outline-none placeholder:text-border"
          />
          <span className="h-px w-12 bg-border" />
        </div>
      </div>

      {errors.birthDay && (
        <p className="mt-3 text-center text-sm font-medium text-destructive">
          {errors.birthDay.message}
        </p>
      )}

      <SignupStepNav
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={!canProceed}
      />
    </div>
  )
}
