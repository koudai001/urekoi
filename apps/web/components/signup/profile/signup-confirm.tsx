import { useFormContext } from 'react-hook-form'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { PREFECTURES } from '@/lib/prefectures'
import type { ProfileFormValues } from '@/app/signup/profile/schema'

const GENDER_LABEL: Record<string, string> = {
  male: '男性',
  female: '女性',
}

// signupフローの最終ステップ。入力済みのプロフィール項目を確認し、始めるとプロフィールを作成する
export function SignupConfirm({
  onBack,
  onNext,
  isSubmitting,
}: {
  onBack: () => void
  onNext: () => void
  isSubmitting: boolean
}) {
  const { watch } = useFormContext<ProfileFormValues>()
  const nickname = watch('nickname')
  const gender = watch('gender')
  const birthYear = watch('birthYear')
  const birthMonth = watch('birthMonth')
  const birthDay = watch('birthDay')
  const prefectureCode = watch('prefectureCode')

  const prefectureName = PREFECTURES.find(
    (p) => p.code === prefectureCode,
  )?.name

  return (
    <div className="flex min-h-[520px] w-full max-w-md flex-col p-8">
      <BackButton
        onClick={onBack}
        className="h-12 self-start rounded-full px-4 text-base text-swipe-foreground hover:bg-swipe-surface hover:text-swipe-foreground"
      />

      <h1 className="mt-6 text-2xl font-bold text-balance text-swipe-foreground">
        入力内容を確認してください
      </h1>

      {/* 入力内容の一覧 */}
      <dl className="mt-8 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-swipe-border pb-3">
          <dt className="text-sm text-swipe-muted-foreground">表示名</dt>
          <dd className="text-base font-bold text-swipe-foreground">
            {nickname}
          </dd>
        </div>
        <div className="flex items-center justify-between border-b border-swipe-border pb-3">
          <dt className="text-sm text-swipe-muted-foreground">性別</dt>
          <dd className="text-base font-bold text-swipe-foreground">
            {gender ? GENDER_LABEL[gender] : ''}
          </dd>
        </div>
        <div className="flex items-center justify-between border-b border-swipe-border pb-3">
          <dt className="text-sm text-swipe-muted-foreground">生年月日</dt>
          <dd className="text-base font-bold text-swipe-foreground">
            {birthYear}年{birthMonth}月{birthDay}日
          </dd>
        </div>
        <div className="flex items-center justify-between border-b border-swipe-border pb-3">
          <dt className="text-sm text-swipe-muted-foreground">都道府県</dt>
          <dd className="text-base font-bold text-swipe-foreground">
            {prefectureName}
          </dd>
        </div>
      </dl>

      <Button
        type="button"
        disabled={isSubmitting}
        onClick={onNext}
        className="mt-auto h-auto w-full cursor-pointer rounded-full bg-gradient-to-br from-swipe-accent to-primary py-4 text-base font-bold text-white hover:opacity-90"
      >
        {isSubmitting ? '作成中...' : '始める'}
      </Button>
    </div>
  )
}
