import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { RecsDeck } from '@/components/partner/recs-deck'
import { getPartnerRecs } from '@/generated/partner/partner'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// サーバーコンポーネントでスワイプ候補を取得し、RecsDeckに渡す
export default async function RecsPage() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const res = await getPartnerRecs({
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 401) redirect('/login')
  if (res.status === 500) throw new Error('スワイプ候補の取得に失敗しました')

  return (
    <div className="flex flex-1 items-center justify-center px-8 py-10">
      <RecsDeck profiles={res.data} />
    </div>
  )
}
