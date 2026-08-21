import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { RecsProfileActions } from '@/components/recs/recs-profile-actions'
import { RecsProfileBackButton } from '@/components/recs/recs-profile-back-button'
import { ProfileViewer } from '@/components/myprofile/profile-viewer'
import { CardContainer } from '@/components/ui/card-container'
import { getPartnerByUserId } from '@/generated/partner/partner'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// カードから開く相手の詳細。プロフィールは遷移先で取り直して最新状態を表示する。
export default async function RecsProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId: userIdParam } = await params
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
  const returnHref = '/recs'
  return (
    <main className="flex min-h-0 flex-1 justify-center overflow-hidden p-2">
      <div className="relative min-h-0 w-full">
        <CardContainer className="!h-full !max-w-none !aspect-auto">
          <div className="relative h-full w-full overflow-hidden rounded-3xl">
            <ProfileViewer profile={profile} />
            <RecsProfileBackButton returnHref={returnHref} />
            <RecsProfileActions userId={userId} returnHref={returnHref} />
          </div>
        </CardContainer>
      </div>
    </main>
  )
}
