import useSWR from 'swr'
import type { Cache, ScopedMutator } from 'swr'
import type {
  MatchProfile,
  MatchProfileWithLastMessage,
} from '@/generated/urekoiAPI.schemas'

// マッチングをどれくらいの間隔で反映するか
const POLLING_INTERVAL_MS = 15000

export const UNMESSAGED_MATCHES_KEY = '/api/matches/unmessaged'
export const MESSAGED_MATCHES_KEY = '/api/matches/messaged'

function fetcher<T>(url: string) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error('マッチング一覧の取得に失敗しました')
    return res.json() as Promise<T>
  })
}

// メッセージ未送信のマッチ一覧をポーリングで取得する
export function useUnmessagedMatches() {
  return useSWR<MatchProfile[]>(UNMESSAGED_MATCHES_KEY, fetcher, {
    refreshInterval: POLLING_INTERVAL_MS,
  })
}

// メッセージ送信済みのマッチ一覧(最新メッセージ付き)をポーリングで取得する
export function useMessagedMatches() {
  return useSWR<MatchProfileWithLastMessage[]>(MESSAGED_MATCHES_KEY, fetcher, {
    refreshInterval: POLLING_INTERVAL_MS,
  })
}

// 新着メッセージの受信/送信時に、メッセージ一覧のキャッシュへその場で反映する。
export function applyNewMessageToMatchesCache(
  mutate: ScopedMutator,
  cache: Cache,
  message: {
    matchId: number
    body: string
    createdAt: string
    senderUserId: number
  },
) {
  const current = cache.get(MESSAGED_MATCHES_KEY)?.data as
    MatchProfileWithLastMessage[] | undefined

  if (!current?.some((m) => m.match_id === message.matchId)) {
    mutate(MESSAGED_MATCHES_KEY)
    return
  }

  mutate<MatchProfileWithLastMessage[]>(
    MESSAGED_MATCHES_KEY,
    (list) => {
      const rest = list?.filter((m) => m.match_id !== message.matchId) ?? []
      const target = list?.find((m) => m.match_id === message.matchId)
      if (!target) return list

      return [
        {
          ...target,
          last_message: message.body,
          last_message_at: message.createdAt,
          last_message_sender_user_id: message.senderUserId,
        },
        ...rest,
      ]
    },
    { revalidate: false },
  )
}
