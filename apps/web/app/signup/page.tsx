'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { signup } from '@/actions/auth'
import { SignupConsent } from '@/components/signup/signup-consent'
import { SignupEmailForm } from '@/components/signup/signup-email-form'
import { SignupLanding } from '@/components/signup/signup-landing'
import { type AuthFormValues, authSchema } from './schema'

type Step = 'select' | 'consent' | 'email'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null) //stateの初期値をnullに設定
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      isAdult: false,
      agreeTerms: false,
      email: '',
      password: '',
    },
  })
  const [step, setStep] = useState<Step>('select')
  const router = useRouter()

  // signup成功を検知したらプロフィール入力ページへ遷移する
  useEffect(() => {
    if (state?.success) {
      router.push('/signup/profile')
    }
  }, [state, router])

  if (step === 'select') {
    return <SignupLanding onSelectEmail={() => setStep('consent')} />
  }

  return (
    <FormProvider {...form}>
      <main className="flex min-h-svh flex-col bg-background text-foreground">
        {step === 'consent' ? (
          <SignupConsent
            onBack={() => setStep('select')}
            onNext={() => setStep('email')}
          />
        ) : (
          <SignupEmailForm
            formAction={formAction}
            isPending={isPending}
            state={state}
            onBack={() => setStep('consent')}
          />
        )}
      </main>
    </FormProvider>
  )
}
