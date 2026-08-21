import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PendingLikesProvider } from '@/providers/pending-likes-provider'
import { getLikesPending } from '@/generated/likes/likes'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// 受け取ったLikeを一度だけ取得し、一覧と詳細画面で同じ状態を共有する。
export default async function PendingLikesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const res = await getLikesPending({
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.status === 401) redirect('/login')
  if (res.status === 500) throw new Error('いいね一覧の取得に失敗しました')

  return (
    <PendingLikesProvider initialLikes={res.data}>
      {children}
    </PendingLikesProvider>
  )
}
