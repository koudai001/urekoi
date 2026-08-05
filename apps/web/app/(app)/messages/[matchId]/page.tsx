import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { ChatView } from '@/components/messages/chat-view'
import { ProfileViewer } from '@/components/myprofile/profile-viewer'
import { getMatch } from '@/generated/matches/matches'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

export default async function MessagePage({
  params,
}: {
  params: Promise<{ matchId: string }>
}) {
  const { matchId } = await params
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await getMatch(Number(matchId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 401) redirect('/login')
  if (res.status === 404) notFound()
  if (res.status === 500) throw new Error('マッチの取得に失敗しました')

  const match = res.data

  return (
    <div className="animate-in slide-in-from-right-8 fade-in flex flex-1 duration-300">
      <ChatView
        match={{
          match_id: match.match_id,
          user_id: match.user_id,
          nickname: match.nickname,
          image: match.images?.[0]?.url,
          matched_at: match.matched_at,
        }}
      />
      <div className="hidden w-96 shrink-0 border-l border-swipe-border md:block">
        <ProfileViewer profile={match} />
      </div>
    </div>
  )
}
