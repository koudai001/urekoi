import { useQuery } from '@tanstack/react-query'
import type { MessageResponse } from '@/generated/urekoiAPI.schemas'

export function getMessagesQueryKey(matchId: number) {
  return ['matches', matchId, 'messages'] as const
}

async function fetchMessages(matchId: number): Promise<MessageResponse[]> {
  const response = await fetch(`/api/matches/${matchId}/messages`)
  if (!response.ok) throw new Error('メッセージ履歴の取得に失敗しました')
  return response.json()
}

// matchIdのメッセージ履歴(新しい順)を取得する。新着の反映はWS側の役目
export function useMessages(matchId: number) {
  return useQuery({
    queryKey: getMessagesQueryKey(matchId),
    queryFn: () => fetchMessages(matchId),
  })
}
