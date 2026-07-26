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
  // 現在のキャッシュを取得（マッチ一覧）
  const current = cache.get(MESSAGED_MATCHES_KEY)?.data as
    MatchProfileWithLastMessage[] | undefined

  // もし現在のキャッシュに対象matchが無ければ、再検証して最新のマッチ一覧を取得する
  if (!current?.some((m) => m.match_id === message.matchId)) {
    mutate(MESSAGED_MATCHES_KEY)
    return
  }

  // 対象matchがキャッシュにあれば、最新メッセージを反映した上で一覧の先頭に移動する
  mutate<MatchProfileWithLastMessage[]>(
    MESSAGED_MATCHES_KEY,
    (list) => {
      // list:現在のキャッシュデータ
      const rest = list?.filter((m) => m.match_id !== message.matchId) ?? []
      // 更新対象のmatch
      const target = list?.find((m) => m.match_id === message.matchId)
      if (!target) return list

      // キャッシュ一覧の先頭に最新メッセージを反映したmatchを移動する
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
