'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Apple, Mail, X } from 'lucide-react'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { GoogleSignInButton } from '@/components/signup/google-signin-button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'

type Step = 'select' | 'email'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('select')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <main className="flex min-h-svh flex-col bg-swipe-background px-6 py-6 text-swipe-foreground">
      {step === 'select' ? (
        // GoogleSignInButtonの幅がGIS仕様で最大400pxのため、他ボタンもそれに揃える
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center gap-10">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/login/urekoi-icon-final.png"
              alt="熟恋"
              width={224}
              height={224}
              priority
              className="h-56 w-56 rounded-full shadow-2xl"
            />
            <p className="text-sm font-semibold tracking-[0.12em] text-swipe-muted-foreground">
              大人の出会いを、もっと自然に
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Button
              type="button"
              onClick={() => setStep('email')}
              className="h-11 w-full gap-2.5 rounded-full bg-gradient-to-br from-swipe-accent to-primary text-base font-extrabold text-white hover:opacity-90"
            >
              <Mail className="h-5 w-5" />
              メールアドレスでログイン
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-2.5 rounded-full border-swipe-border bg-transparent text-base font-bold text-swipe-foreground hover:bg-swipe-surface hover:text-swipe-foreground"
            >
              <Apple className="h-5 w-5 fill-current" />
              Appleで続ける
            </Button>
            <GoogleSignInButton text="signin_with" />

            <Link
              href="/signup"
              className="mt-1 py-3 text-center text-sm font-semibold text-swipe-accent underline underline-offset-4"
            >
              新規登録はこちら
            </Link>

            <div className="flex justify-center gap-4 pt-1 text-xs text-swipe-muted-foreground">
              <span>利用規約</span>
              <span>プライバシーポリシー</span>
            </div>
          </div>
        </div>
      ) : step === 'email' ? (
        <CredentialStep
          icon={Mail}
          title={<>メールアドレスとパスワードを入力してください</>}
          onClose={() => setStep('select')}
        >
          <form className="flex flex-col gap-7" action={formAction}>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="sample@example.com"
              className="h-auto w-full rounded-none border-0 border-b border-swipe-border !bg-transparent p-0 pb-3 text-xl text-swipe-foreground placeholder:text-swipe-muted-foreground focus-visible:border-swipe-accent focus-visible:ring-0"
            />
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="パスワード"
              className="border-swipe-border pb-3 [&_button]:text-swipe-foreground [&_input]:!bg-transparent [&_input]:text-xl [&_input]:text-swipe-foreground [&_input]:placeholder:text-swipe-muted-foreground"
            />

            {state?.success === false && (
              <p className="text-sm font-medium text-destructive">
                {state.error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="h-auto w-full rounded-full bg-gradient-to-br from-swipe-accent to-primary py-4 text-lg font-bold text-white hover:opacity-90"
            >
              {isPending ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </CredentialStep>
      ) : null}
    </main>
  )
}

function CredentialStep({
  icon: Icon,
  title,
  onClose,
  children,
}: {
  icon: React.ElementType
  title: React.ReactNode
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col">
      <button
        type="button"
        aria-label="ログイン方法の選択へ戻る"
        onClick={onClose}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-swipe-surface text-swipe-foreground shadow-lg"
      >
        <X className="h-7 w-7" />
      </button>

      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-9 flex flex-col items-center gap-6 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-swipe-accent to-primary text-white shadow-lg">
            <Icon className="h-9 w-9" />
          </span>
          <h1 className="whitespace-pre-line text-3xl font-bold leading-tight text-swipe-foreground">
            {title}
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
