import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { RecsProfileActions } from '@/components/recs/recs-profile-actions'
import { RecsProfileBackButton } from '@/components/recs/recs-profile-back-button'
import { LikesProfileActions } from '@/components/likes/likes-profile-actions'
import { ProfileViewer } from '@/components/myprofile/profile-viewer'
import { CardContainer } from '@/components/ui/card-container'
import { getPartnerByUserId } from '@/generated/partner/partner'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// カードから開く相手の詳細。プロフィールは遷移先で取り直して最新状態を表示する。
export default async function RecsProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const [{ userId: userIdParam }, { from }] = await Promise.all([
    params,
    searchParams,
  ])
  const userId = Number(userIdParam)
  if (!Number.isSafeInteger(userId) || userId <= 0) notFound()

  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const res = await getPartnerByUserId(userId, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 401) redirect('/login')
  if (res.status === 404) notFound()
  if (res.status === 500) throw new Error('プロフィールの取得に失敗しました')

  const profile = res.data
  const returnHref = from === 'likes' ? '/likes/from-partner-card' : '/recs'
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-8">
      <CardContainer>
        <div className="relative h-full w-full overflow-hidden rounded-3xl">
          <ProfileViewer profile={profile} />
          <RecsProfileBackButton returnHref={returnHref} />
          {from === 'likes' ? (
            <LikesProfileActions
              userId={userId}
              nickname={profile.nickname ?? ''}
              age={profile.age ?? 0}
              returnHref={returnHref}
            />
          ) : (
            <RecsProfileActions userId={userId} returnHref={returnHref} />
          )}
        </div>
      </CardContainer>
    </div>
  )
}
