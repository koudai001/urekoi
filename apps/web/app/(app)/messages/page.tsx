import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MessagesInbox } from '@/components/messages/messages-inbox'
import { getLikesPending } from '@/generated/likes/likes'
import {
  getMessagedMatches,
  getUnmessagedMatches,
} from '@/generated/matches/matches'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

export default async function MessagesPage() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const options = {
    headers: { Authorization: `Bearer ${accessToken}` },
  }

  const [likesRes, unmessagedMatchesRes, messagedMatchesRes] =
    await Promise.all([
      getLikesPending(options),
      getUnmessagedMatches(options),
      getMessagedMatches(options),
    ])

  if (
    likesRes.status === 401 ||
    unmessagedMatchesRes.status === 401 ||
    messagedMatchesRes.status === 401
  ) {
    redirect('/login')
  }
  if (
    likesRes.status !== 200 ||
    unmessagedMatchesRes.status !== 200 ||
    messagedMatchesRes.status !== 200
  ) {
    throw new Error('メッセージ一覧の取得に失敗しました')
  }

  return (
    <MessagesInbox
      initialLikes={likesRes.data}
      initialUnmessagedMatches={unmessagedMatchesRes.data}
      initialMessagedMatches={messagedMatchesRes.data}
    />
  )
}
