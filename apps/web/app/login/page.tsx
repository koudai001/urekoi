'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmailLoginForm } from '@/components/login/email-login-form'
import { GoogleSignInButton } from '@/components/signup/google-signin-button'

type Step = 'select' | 'email'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('select')

  return (
    <main className="flex min-h-svh flex-col bg-background text-foreground">
      {step === 'select' ? (
        <>
          <header className="flex h-16 items-center gap-3 border-b border-border px-4">
            <Link
              href="/welcome"
              aria-label="Welcomeへ戻る"
              className="flex size-10 items-center justify-center"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
            <h1 className="font-semibold">熟恋にログイン</h1>
          </header>

          <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-6 pt-6">
            <Button
              type="button"
              onClick={() => setStep('email')}
              variant="outline"
              className="h-12 w-full gap-2 rounded-lg"
            >
              <Mail className="size-5" />
              メールアドレスでログイン
            </Button>
            <GoogleSignInButton text="signin_with" />
          </div>
        </>
      ) : step === 'email' ? (
        <>
          <header className="flex h-20 items-center px-4">
            <button
              type="button"
              aria-label="ログイン方法の選択へ戻る"
              onClick={() => setStep('select')}
              className="flex size-10 items-center justify-center"
            >
              <ArrowLeft className="size-6" aria-hidden="true" />
            </button>
          </header>
          <section className="mx-auto w-full max-w-md px-6 pt-5">
            <h1 className="text-2xl font-bold">メールアドレスでログイン</h1>
            <p className="mt-4 text-base leading-7">
              登録しているメールアドレスとパスワードを入力してください。
            </p>
            <EmailLoginForm />
          </section>
        </>
      ) : null}
    </main>
  )
}
