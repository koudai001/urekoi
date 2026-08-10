import { startTransition } from 'react'
import { useFormContext } from 'react-hook-form'
import type { SignupResult } from '@/actions/auth'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import type { AuthFormValues } from '@/app/signup/schema'

// signupフローの最初のステップ。メールアドレス・パスワードを入力して送信する
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
  } = useFormContext<AuthFormValues>()

  // 既存のsignup Server Actionに委譲する。DOMからではなくバリデーション済みのdataから直接FormDataを組み立てる
  const onSubmit = handleSubmit((data) => {
    const formData = new FormData()
    formData.set('email', data.email)
    formData.set('password', data.password)

    startTransition(async () => {
      await formAction(formData)
    })
  })

  return (
    <div className="flex min-h-[520px] w-full max-w-md flex-col p-8">
      <BackButton
        onClick={onBack}
        className="h-12 self-start rounded-full px-4 text-base text-swipe-foreground hover:bg-swipe-surface hover:text-swipe-foreground"
      />

      <h1 className="mt-6 text-2xl font-bold text-balance text-swipe-foreground">
        ログイン情報を作成してください
      </h1>

      <form className="mt-8 flex flex-1 flex-col gap-7" onSubmit={onSubmit}>
        {/* メール */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-base font-bold text-swipe-foreground"
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
            className="h-auto w-full rounded-none border-0 border-b border-swipe-border !bg-transparent p-0 pb-2 text-lg text-swipe-foreground placeholder:text-swipe-muted-foreground focus-visible:border-swipe-accent focus-visible:ring-0"
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
            className="text-base font-bold text-swipe-foreground"
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
            className="border-swipe-border pb-2 [&_button]:text-swipe-foreground [&_input]:!bg-transparent [&_input]:text-lg [&_input]:text-swipe-foreground [&_input]:placeholder:text-swipe-muted-foreground"
          />
          {errors.password && (
            <p className="text-sm font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* 同意文 */}
        <p className="text-sm leading-relaxed text-swipe-muted-foreground">
          アカウント登録すると、
          <a
            href="#"
            className="font-bold text-swipe-foreground hover:underline"
          >
            利用規約
          </a>
          、
          <a
            href="#"
            className="font-bold text-swipe-foreground hover:underline"
          >
            プライバシーポリシー
          </a>
          、
          <a
            href="#"
            className="font-bold text-swipe-foreground hover:underline"
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
          className="mt-auto h-auto w-full cursor-pointer rounded-full bg-gradient-to-br from-swipe-accent to-primary py-4 text-base font-bold text-white hover:opacity-90"
        >
          {isPending ? '登録中...' : '登録する'}
        </Button>
      </form>
    </div>
  )
}
