'use client'

import { startTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createMyProfile } from '@/actions/myprofile'
import type { MyProfileCreateRequestGender } from '@/generated/urekoiAPI.schemas'
import { SignupBirthday } from '@/components/signup/profile/signup-birthday'
import { SignupConfirm } from '@/components/signup/profile/signup-confirm'
import { SignupGender } from '@/components/signup/profile/signup-gender'
import { SignupIntro } from '@/components/signup/profile/signup-intro'
import { SignupLocation } from '@/components/signup/profile/signup-location'
import { SignupNickname } from '@/components/signup/profile/signup-nickname'
import { type ProfileFormValues, profileSchema } from './schema'

type Step =
  'intro' | 'gender' | 'birthday' | 'location' | 'nickname' | 'confirm'

export default function SignupProfilePage() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      nickname: '',
    },
  })
  const [step, setStep] = useState<Step>('intro')
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const router = useRouter()

  // 入力済みのプロフィール項目でPOST /myprofileを呼び、成功したら/recsへ遷移する
  const handleCreateProfile = () => {
    startTransition(async () => {
      setIsCreatingProfile(true)
      try {
        const values = form.getValues()
        const result = await createMyProfile({
          nickname: values.nickname,
          prefecture_code: values.prefectureCode as number,
          gender: values.gender as MyProfileCreateRequestGender,
          birthdate: `${values.birthYear}-${values.birthMonth.padStart(2, '0')}-${values.birthDay.padStart(2, '0')}`,
        })
        if (!result.success) {
          toast.error(result.error)
          return
        }
        router.push('/recs')
      } finally {
        setIsCreatingProfile(false)
      }
    })
  }

  return (
    <FormProvider {...form}>
      <main className="flex min-h-svh flex-col items-center justify-center bg-swipe-background px-6 py-6 text-swipe-foreground">
        {step === 'intro' ? (
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
            onNext={() => setStep('confirm')}
          />
        ) : (
          <SignupConfirm
            onBack={() => setStep('nickname')}
            onNext={handleCreateProfile}
            isSubmitting={isCreatingProfile}
          />
        )}
      </main>
    </FormProvider>
  )
}
