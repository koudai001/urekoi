import useWebSocket from 'react-use-websocket'
import { useQueryClient } from '@tanstack/react-query'
import { getMessagesQueryKey } from './use-messages'
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
  const queryClient = useQueryClient()

  useWebSocket(getSocketUrl, {
    // 受信イベントの処理
    onMessage: (event) => {
      // WebSocketの受信データから、対象のトークと新着メッセージを取り出す。
      const payload: NewMessagePayload = JSON.parse(event.data)

      // 対象トークのQueryKeyを取得し、現在のキャッシュを取り出す
      const messagesQueryKey = getMessagesQueryKey(payload.match_id)
      const messagesCache =
        queryClient.getQueryData<MessageResponse[]>(messagesQueryKey)

      // キャッシュがあるトーク履歴だけを更新。キャッシュがない時はトーク画面を開いた時に履歴を取得
      if (messagesCache !== undefined) {
        // 新着メッセージを追加
        queryClient.setQueryData<MessageResponse[]>(messagesQueryKey, [
          payload.message,
          ...messagesCache,
        ])
      }

      // マッチ一覧部分のキャッシュを更新
      applyNewMessageToMatchesCache(queryClient, {
        matchId: payload.match_id,
        body: payload.message.body ?? '',
        createdAt: payload.message.created_at ?? '',
        senderUserId: payload.message.sender_user_id ?? 0,
      })
    },
    shouldReconnect: () => true,
  })
}
