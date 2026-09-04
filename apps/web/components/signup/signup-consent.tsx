import { Check } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import type { AuthFormValues } from '@/app/signup/schema'

// signupフローのステップ2。年齢・規約への同意を取る
export function SignupConsent({ onNext }: { onNext: () => void }) {
  const { watch, setValue } = useFormContext<AuthFormValues>()
  const isAdult = watch('isAdult') // チェックボックスの値を監視
  const agreeTerms = watch('agreeTerms') // チェックボックスの値を監視
  const canProceed = isAdult && agreeTerms // 両方のチェックボックスがオンの場合に進める

  return (
    <div className="w-full max-w-md px-2">
      <p className="mb-8 text-center text-sm leading-relaxed text-muted-foreground">
        熟恋は、大人の女性と年下男性のためのマッチングサービスです。ご登録の前に、以下の内容をご確認ください。
      </p>

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setValue('isAdult', !isAdult)}
          className="flex w-full cursor-pointer items-center gap-3 text-left"
          aria-pressed={isAdult}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
              isAdult
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-transparent'
            }`}
          >
            {isAdult && <Check className="h-4 w-4" strokeWidth={3} />}
          </span>
          <span className="text-base text-foreground">
            女性は35歳以上、男性は35歳未満限定です
          </span>
        </button>

        <button
          type="button"
          onClick={() => setValue('agreeTerms', !agreeTerms)}
          className="flex w-full cursor-pointer items-center gap-3 text-left"
          aria-pressed={agreeTerms}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
              agreeTerms
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-transparent'
            }`}
          >
            {agreeTerms && <Check className="h-4 w-4" strokeWidth={3} />}
          </span>
          <span className="text-base text-foreground">
            すべての規約
            <span className="text-primary">*</span>に同意します
          </span>
        </button>
      </div>

      <p className="mt-5 text-sm font-medium text-primary">
        <span>*</span>
        <a href="#" className="hover:underline">
          利用規約
        </a>
        ・
        <a href="#" className="hover:underline">
          プライバシーポリシー
        </a>
        への同意が必要です
      </p>

      <button
        type="button"
        disabled={!canProceed}
        onClick={onNext}
        className="mt-8 w-full cursor-pointer rounded-full bg-gradient-to-br from-primary to-primary py-4 text-base font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        内容に同意して進む
      </button>
    </div>
  )
}
