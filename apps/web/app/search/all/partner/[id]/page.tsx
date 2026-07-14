import { cookies } from 'next/headers'
import { ProfileCardGrid } from '@/components/profile/profile-card-grid'
import { ProfileDetailModal } from '@/components/profile/profile-detail-modal'
import {
  getSearchAll,
  getSearchAllPartnerUserId,
} from '@/generated/search/search'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// 直接URLアクセス・リロード時は裏の一覧が無いため、一覧+詳細を両方取得して自分で組み立てる
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } }

  const [listRes, detailRes] = await Promise.all([
    getSearchAll(authHeaders),
    getSearchAllPartnerUserId(Number(id), authHeaders),
  ])

  return (
    <>
      <ProfileCardGrid profiles={listRes.status === 200 ? listRes.data : []} />
      {detailRes.status === 200 && (
        <ProfileDetailModal profile={detailRes.data} isDirectAccess />
      )}
    </>
  )
}
