'use client'

import { LikeButton } from '@/components/likes/like-button'
import { ProfileDetail } from '@/components/search/profile-detail'
import { RouteLoading } from '@/components/ui/route-loading'
import { useReturnLike } from '@/hooks/use-return-like'
import { usePartnerProfile } from '@/hooks/use-search-profiles'

// 受信Like一覧の個別キャッシュを優先し、未取得時だけプロフィールAPIを呼ぶ
export function PendingLikeProfileDetail({ userId }: { userId: number }) {
  const { data: profile, error, isPending } = usePartnerProfile(userId)
  const { returnLike, isPending: isReturningLike } = useReturnLike({
    userId,
    nickname: profile?.nickname ?? '',
    age: profile?.age ?? 0,
  })

  if (isPending) return <RouteLoading />
  if (error) throw error

  const returnHref = '/likes/pending'

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <ProfileDetail profile={profile} returnHref={returnHref} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center rounded-t-3xl bg-background/99 px-6 py-4">
        <LikeButton
          label="ありがとう！"
          isPending={isReturningLike}
          onClick={() => returnLike()}
          className="pointer-events-auto"
        />
      </div>
    </div>
  )
}
