import { useFormContext } from 'react-hook-form'
import type { SignupResult } from '@/actions/auth'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import type { SignupFormValues } from './schema'
import { startTransition } from 'react'

// signupフローの最終ステップ。メールアドレス・パスワードを入力して送信する
export function SignupEmailForm({
  formAction,
  isPending,
  state,
  onBack,
}: {
  formAction: (formData: FormData) => void
  isPending: boolean
  state: SignupResult | null
  onBack: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<SignupFormValues>()

  // zodバリデーションを通ってから、既存のsignup Server Actionに委譲する。
  // DOMからではなくバリデーション済みのdataから直接FormDataを組み立てる
  const onSubmit = handleSubmit((data) => {
    const birthdate = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`

    const formData = new FormData()
    formData.set('email', data.email)
    formData.set('password', data.password)
    formData.set('gender', data.gender ?? '')
    formData.set('prefecture_code', String(data.prefectureCode ?? ''))
    formData.set('nickname', data.nickname)
    formData.set('birthdate', birthdate)

    startTransition(async () => {
      await formAction(formData)
    })
  })

  return (
    <div className="flex min-h-[520px] w-full max-w-md flex-col rounded-3xl bg-card p-8 shadow-sm">
      <BackButton onClick={onBack} className="self-start" />

      <h1 className="mt-6 text-2xl font-bold text-balance text-card-foreground">
        ログイン情報を作成してください
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        次回以降に熟恋にログインするためにメールアドレスとパスワードを設定してください。
      </p>

      <form className="mt-8 flex flex-1 flex-col gap-7" onSubmit={onSubmit}>
        {/* メール */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-base font-bold text-card-foreground"
          >
            メールアドレス
          </label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="sample@sample.com"
            {...register('email')}
            className="h-auto w-full rounded-none border-0 border-b border-border bg-transparent p-0 pb-2 text-lg focus-visible:border-primary focus-visible:ring-0"
          />
          {errors.email && (
            <p className="text-sm font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* パスワード */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-base font-bold text-card-foreground"
          >
            パスワード
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="パスワード"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* 同意文 */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          アカウント登録すると、
          <a
            href="#"
            className="font-bold text-card-foreground hover:underline"
          >
            利用規約
          </a>
          、
          <a
            href="#"
            className="font-bold text-card-foreground hover:underline"
          >
            プライバシーポリシー
          </a>
          、
          <a
            href="#"
            className="font-bold text-card-foreground hover:underline"
          >
            コミュニティガイドライン
          </a>
          に同意したこととみなします。
        </p>

        {/* 結果表示（エラーの場合） */}
        {state?.success === false && (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}

        {/* 登録ボタン */}
        <Button
          type="submit"
          disabled={isPending}
          className="mt-auto h-auto w-full cursor-pointer rounded-full py-4 text-base font-bold hover:opacity-90"
        >
          {isPending ? '登録中...' : '登録する'}
        </Button>
      </form>
    </div>
  )
}
