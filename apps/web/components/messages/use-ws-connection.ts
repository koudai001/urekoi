import useWebSocket from 'react-use-websocket'
import { useSWRConfig } from 'swr'
import { messagesKey } from './use-messages'
import { applyNewMessageToMatchesCache } from './use-match-profiles'
import type { MessageResponse } from '@/generated/urekoiAPI.schemas'

// asyncapi.yamlのNewMessagePayloadに対応(openapiの自動生成対象外)
type NewMessagePayload = {
  recipient_user_id: number
  match_id: number
  message: MessageResponse
}

// 使い捨てticketを取得し、WS接続用URLを組み立てる(再接続のたびに新しいticketを取り直す)
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
      // 再フェッチはせず、届いたmessageをそのままキャッシュに反映する
      mutate(
        messagesKey(payload.match_id),
        (current: MessageResponse[] | undefined) => [
          payload.message,
          ...(current ?? []),
        ],
        { revalidate: false },
      )

      // 新着メッセージをマッチ一覧のキャッシュにも反映する
      applyNewMessageToMatchesCache(mutate, cache, {
        matchId: payload.match_id,
        body: payload.message.body ?? '',
        createdAt: payload.message.created_at ?? '',
        senderUserId: payload.message.sender_user_id ?? 0,
      })
    },
    // 切断時は再接続する
    shouldReconnect: () => true,
  })
}
