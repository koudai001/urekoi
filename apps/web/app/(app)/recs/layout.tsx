import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { RecsProvider } from '@/providers/recs-provider'
import { getPartnerRecs } from '@/generated/partner/partner'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// 候補を一度だけ取得してProviderへ渡し、一覧と詳細画面で同じデッキ状態を共有する
export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const res = await getPartnerRecs({
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 401) redirect('/login')
  if (res.status === 500) throw new Error('スワイプ候補の取得に失敗しました')

  return <RecsProvider initialRecs={res.data}>{children}</RecsProvider>
}
