'use client'

import { useActionState, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { signup } from '@/actions/auth'
import { AuthLogo } from '@/components/ui/auth-logo'
import { SignupBirthday } from '@/components/signup/signup-birthday'
import { SignupConsent } from '@/components/signup/signup-consent'
import { SignupEmailForm } from '@/components/signup/signup-email-form'
import { SignupGender } from '@/components/signup/signup-gender'
import { SignupIntro } from '@/components/signup/signup-intro'
import { SignupLanding } from '@/components/signup/signup-landing'
import { SignupLocation } from '@/components/signup/signup-location'
import { SignupNickname } from '@/components/signup/signup-nickname'
import { type SignupFormValues, signupSchema } from '@/components/signup/schema'

type Step =
  | 'select'
  | 'consent'
  | 'intro'
  | 'gender'
  | 'birthday'
  | 'location'
  | 'nickname'
  | 'email'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null) //stateの初期値をnullに設定
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      isAdult: false,
      agreeTerms: false,
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      nickname: '',
      email: '',
      password: '',
    },
  })
  const [step, setStep] = useState<Step>('select')

  if (step === 'select') {
    return <SignupLanding onSelectEmail={() => setStep('consent')} />
  }

  return (
    <FormProvider {...form}>
      <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
        <AuthLogo />

        {step === 'consent' ? (
          <SignupConsent onNext={() => setStep('intro')} />
        ) : step === 'intro' ? (
          <SignupIntro onNext={() => setStep('gender')} />
        ) : step === 'gender' ? (
          <SignupGender
            onBack={() => setStep('intro')}
            onNext={() => setStep('birthday')}
          />
        ) : step === 'birthday' ? (
          <SignupBirthday
            onBack={() => setStep('gender')}
            onNext={() => setStep('location')}
          />
        ) : step === 'location' ? (
          <SignupLocation
            onBack={() => setStep('birthday')}
            onNext={() => setStep('nickname')}
          />
        ) : step === 'nickname' ? (
          <SignupNickname
            onBack={() => setStep('location')}
            onNext={() => setStep('email')}
          />
        ) : (
          <SignupEmailForm
            formAction={formAction}
            isPending={isPending}
            state={state}
            onBack={() => setStep('nickname')}
          />
        )}
      </main>
    </FormProvider>
  )
}
