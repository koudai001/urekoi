import useWebSocket from 'react-use-websocket'
import { useSWRConfig } from 'swr'
import { messagesKey } from './use-messages'
import { applyNewMessageToMatchesCache } from './use-match-profiles'
import type { MessageResponse } from '@/generated/urekoiAPI.schemas'

type NewMessagePayload = {
  recipient_user_id: number
  match_id: number
  message: MessageResponse
}

const getSocketUrl = async () => {
  const res = await fetch('/api/ws/ticket', { method: 'POST' })
  const { ticket } = await res.json()
  return `${process.env.NEXT_PUBLIC_WS_URL}/ws?ticket=${ticket}`
}

// user単位で1本のWS接続を確立し、新着メッセージ受信時に該当matchのメッセージ一覧のキャッシュへ直接反映する
export function useWsConnection() {
  const { mutate, cache } = useSWRConfig()

  useWebSocket(getSocketUrl, {
    onMessage: (event) => {
      const payload: NewMessagePayload = JSON.parse(event.data)
      mutate(
        messagesKey(payload.match_id),
        (current: MessageResponse[] | undefined) => [
          payload.message,
          ...(current ?? []),
        ],
        { revalidate: false },
      )

      applyNewMessageToMatchesCache(mutate, cache, {
        matchId: payload.match_id,
        body: payload.message.body ?? '',
        createdAt: payload.message.created_at ?? '',
        senderUserId: payload.message.sender_user_id ?? 0,
      })
    },
    shouldReconnect: () => true,
  })
}
