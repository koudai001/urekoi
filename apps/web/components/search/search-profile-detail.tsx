'use client'

import { ProfileDetail } from '@/components/search/profile-detail'
import { SearchProfileActions } from '@/components/search/search-profile-actions'
import { RouteLoading } from '@/components/ui/route-loading'
import { usePartnerProfile } from '@/hooks/use-search-profiles'

// 一覧キャッシュを優先し、未取得の直リンク時だけAPIからプロフィールを取得する
export function SearchProfileDetail({ userId }: { userId: number }) {
  const { data: profile, error, isPending } = usePartnerProfile(userId)

  // 直リンク時の取得中も詳細画面と同じ領域を維持する
  if (isPending) {
    return <RouteLoading />
  }

  // 取得失敗はルートのError Boundaryへ渡す
  if (error) throw error

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <ProfileDetail profile={profile} returnHref="/search" />

      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center rounded-t-3xl bg-background/99 px-6 py-4">
        <SearchProfileActions
          userId={userId}
          nickname={profile.nickname}
          age={profile.age}
          alreadyLiked={profile.already_liked}
        />
      </div>
    </div>
  )
}
