import useSWR from 'swr'
import type { MessageResponse } from '@/generated/urekoiAPI.schemas'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('メッセージ履歴の取得に失敗しました')
    return res.json() as Promise<MessageResponse[]>
  })

// このmatchIdのメッセージ履歴に対応するSWRキー(WS側からのキャッシュ更新にも使う)
export function messagesKey(matchId: number) {
  return `/api/matches/${matchId}/messages`
}

// matchIdのメッセージ履歴(新しい順)を取得する。新着の反映はWS側の役目
export function useMessages(matchId: number) {
  return useSWR<MessageResponse[]>(messagesKey(matchId), fetcher)
}
