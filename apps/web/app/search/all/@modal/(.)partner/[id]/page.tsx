import { cookies } from 'next/headers'
import { ProfileDetailModal } from '@/components/profile/profile-detail-modal'
import { getSearchAllPartnerUserId } from '@/generated/search/search'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// サーバーコンポーネントで検索結果を取得し、ProfileDetailModalに渡す
export default async function Modal({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await getSearchAllPartnerUserId(Number(id), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.status !== 200) return null

  return <ProfileDetailModal profile={res.data} />
}
