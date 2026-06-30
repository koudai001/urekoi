'use client'

import { useActionState, useState } from 'react'
import { Mail, MessageCircle } from 'lucide-react'
import { login } from '@/actions/auth'
import { AuthLogo } from '@/components/ui/auth-logo'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'

type Step = 'select' | 'email'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('select')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <AuthLogo />

      {step === 'select' ? (
        /* ===== ステップ1: ログイン方法の選択 ===== */
        <div className="flex w-full max-w-md flex-col items-center">
          <div className="flex w-full flex-col gap-4">
            {/* LINE（ダミー） */}
            <Button
              type="button"
              className="h-auto w-full gap-3 rounded-full bg-line py-4 text-base font-bold text-white hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5 fill-white" />
              LINEでログイン
            </Button>

            {/* メールアドレス */}
            <Button
              type="button"
              onClick={() => setStep('email')}
              className="h-auto w-full gap-3 rounded-full py-4 text-base font-bold hover:opacity-90"
            >
              <Mail className="h-5 w-5" />
              メールアドレスでログイン
            </Button>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href="#"
              className="text-sm font-medium text-primary hover:underline"
            >
              ログインでお困りの方はこちら
            </a>
            <a
              href="/signup"
              className="text-base font-bold text-card-foreground hover:underline"
            >
              新規登録はこちら
            </a>
          </div>
        </div>
      ) : (
        /* ===== ステップ2: メールアドレス＋パスワード ===== */
        <div className="w-full max-w-md">
          <BackButton
            onClick={() => {
              setStep('select')
              setEmail('')
              setPassword('')
            }}
          />

          <form className="flex flex-col gap-7" action={formAction}>
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
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sample@sample.com"
                className="h-auto w-full rounded-none border-0 border-b border-border bg-transparent p-0 pb-2 text-lg focus-visible:border-primary focus-visible:ring-0"
              />
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
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
              />
            </div>

            {/* 結果表示（エラーの場合） */}
            {state?.success === false && (
              <p className="text-sm font-medium text-destructive">
                {state.error}
              </p>
            )}

            {/* ログインボタン */}
            <Button
              type="submit"
              disabled={isPending}
              className="mt-2 h-auto w-full rounded-full py-4 text-base font-bold hover:opacity-90"
            >
              {isPending ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </div>
      )}
    </main>
  )
}
