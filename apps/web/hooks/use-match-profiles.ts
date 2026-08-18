import { useQuery } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import type {
  MatchProfile,
  MatchProfileWithLastMessage,
} from '@/generated/urekoiAPI.schemas'

// ポーリング間隔
const POLLING_INTERVAL_MS = 15000

export const UNMESSAGED_MATCHES_QUERY_KEY = ['matches', 'unmessaged'] as const
export const MESSAGED_MATCHES_QUERY_KEY = ['matches', 'messaged'] as const

async function fetchUnmessagedMatches(): Promise<MatchProfile[]> {
  const response = await fetch('/api/matches/unmessaged')
  if (!response.ok) throw new Error('未メッセージ一覧の取得に失敗しました')
  return response.json()
}

async function fetchMessagedMatches(): Promise<MatchProfileWithLastMessage[]> {
  const response = await fetch('/api/matches/messaged')
  if (!response.ok) throw new Error('メッセージ一覧の取得に失敗しました')
  return response.json()
}

// メッセージ未送信のマッチ一覧をポーリングで取得する
export function useUnmessagedMatches() {
  return useQuery({
    queryKey: UNMESSAGED_MATCHES_QUERY_KEY,
    queryFn: fetchUnmessagedMatches,
    refetchInterval: POLLING_INTERVAL_MS,
  })
}

// メッセージ送信済みのマッチ一覧(最新メッセージ付き)を取得する。
// 新着メッセージはWebSocket受信時にキャッシュへ反映
export function useMessagedMatches() {
  return useQuery({
    queryKey: MESSAGED_MATCHES_QUERY_KEY,
    queryFn: fetchMessagedMatches,
  })
}

// 新着メッセージの受信/送信時に、マッチ一覧のキャッシュへその場で反映する。
export function applyNewMessageToMatchesCache(
  queryClient: QueryClient,
  newMessage: {
    matchId: number
    body: string
    createdAt: string
    senderUserId: number
  },
) {
  const unmessagedMatchesCache = queryClient.getQueryData<MatchProfile[]>(
    UNMESSAGED_MATCHES_QUERY_KEY,
  )
  const unmessagedMatch = unmessagedMatchesCache?.find(
    (match) => match.match_id === newMessage.matchId,
  )

  // 未メッセージ一覧から対象を削除し、メッセージ済み一覧へ移動する
  queryClient.setQueryData<MatchProfile[]>(
    UNMESSAGED_MATCHES_QUERY_KEY,
    (matches) =>
      matches?.filter((match) => match.match_id !== newMessage.matchId),
  )

  // 対象のマッチをメッセージ済み一覧キャッシュから取得。未メッセージ一覧にいた場合はそちらを使う
  const messagedMatchesCache = queryClient.getQueryData<
    MatchProfileWithLastMessage[]
  >(MESSAGED_MATCHES_QUERY_KEY)

  // 対象のマッチをメッセージ済み一覧キャッシュから取得。未メッセージ一覧にいた場合はそちらを使う
  const messagedMatch = messagedMatchesCache?.find(
    (match) => match.match_id === newMessage.matchId,
  )
  const targetMatch = messagedMatch ?? unmessagedMatch

  // メッセージ済みマッチ一覧のキャッシュが未取得 or 対象がいない場合は、部分データを作らず全体を再検証
  if (messagedMatchesCache === undefined || targetMatch === undefined) {
    void queryClient.invalidateQueries({
      queryKey: MESSAGED_MATCHES_QUERY_KEY,
    })
    return
  }

  queryClient.setQueryData<MatchProfileWithLastMessage[]>(
    MESSAGED_MATCHES_QUERY_KEY,
    (matches) => {
      const otherMatches =
        matches?.filter((match) => match.match_id !== newMessage.matchId) ?? []

      return [
        {
          ...targetMatch,
          last_message: newMessage.body,
          last_message_at: newMessage.createdAt,
          last_message_sender_user_id: newMessage.senderUserId,
        },
        ...otherMatches,
      ]
    },
  )
}
