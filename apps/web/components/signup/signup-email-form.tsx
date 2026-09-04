import { startTransition } from 'react'
import { useFormContext } from 'react-hook-form'
import type { SignupResult } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BackHeader } from '@/components/ui/back-header'
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
    <>
      <BackHeader onBack={onBack} />
      <div className="flex justify-center px-6 pt-6">
        <div className="w-full max-w-md px-2">
          <h1 className="text-2xl font-bold text-balance text-foreground">
            メールアドレスで新規登録
          </h1>
          <p className="mt-4 text-base leading-7">
            メールアドレスとパスワードを入力してください。
          </p>

          <form className="mt-20 flex flex-col gap-8" onSubmit={onSubmit}>
            {/* メール */}
            <div>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="メールアドレス"
                {...register('email')}
                className="h-14 rounded-none border-0 border-b border-border bg-transparent px-0 text-lg placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* パスワード */}
            <div>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="パスワード"
                {...register('password')}
                className="h-14 rounded-none border-0 border-b border-border px-0 [&_input]:bg-transparent [&_input]:px-0 [&_input]:text-lg [&_input]:placeholder:text-muted-foreground"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* 同意文 */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              アカウント登録すると、
              <a href="#" className="font-bold text-foreground hover:underline">
                利用規約
              </a>
              、
              <a href="#" className="font-bold text-foreground hover:underline">
                プライバシーポリシー
              </a>
              、
              <a href="#" className="font-bold text-foreground hover:underline">
                コミュニティガイドライン
              </a>
              に同意したこととみなします。
            </p>

            {/* 結果表示（エラーの場合） */}
            {state?.success === false && (
              <p className="text-sm font-medium text-destructive">
                {state.error}
              </p>
            )}

            {/* 登録ボタン */}
            <Button
              type="submit"
              disabled={isPending}
              className="mt-8 h-12 w-full rounded-lg text-base font-bold text-white"
            >
              {isPending ? '登録中...' : '登録する'}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
