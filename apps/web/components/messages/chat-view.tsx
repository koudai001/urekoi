'use client'

import { Fragment } from 'react'
import { useSWRConfig } from 'swr'
import { sendMessage } from '@/actions/messages'
import { useMessages } from '@/hooks/use-messages'
import { applyNewMessageToMatchesCache } from '@/hooks/use-match-profiles'
import { ChatMessageBubble } from './chat-message-bubble'
import { ChatDateDivider, isDifferentDay } from './chat-date-divider'
import { ChatInput } from './chat-input'
import { SpChatHeader } from './sp-chat-header'

type ChatMatch = {
  match_id?: number
  user_id?: number
  nickname?: string
  image?: string
  matched_at?: string
}

function formatMatchedDate(matchedAt?: string) {
  if (!matchedAt) return ''
  return new Date(matchedAt).toLocaleDateString('ja-JP')
}

export function ChatView({ match }: { match: ChatMatch }) {
  const matchId = match.match_id ?? 0
  const { data, mutate } = useMessages(matchId)
  const { mutate: globalMutate, cache } = useSWRConfig()
  // BEは新しい順で返すので、表示用に古い順へ並べ替える
  const messages = [...(data ?? [])].reverse()
  const matchedDate = formatMatchedDate(match.matched_at)

  const handleSend = async (body: string) => {
    const result = await sendMessage(matchId, body)
    if (result.success) {
      // メッセージ画面のキャッシュに反映する
      await mutate()
      // 新着メッセージをマッチ一覧のキャッシュにも反映する
      applyNewMessageToMatchesCache(globalMutate, cache, {
        matchId,
        body: result.message.body ?? '',
        createdAt: result.message.created_at ?? '',
        senderUserId: result.message.sender_user_id ?? 0,
      })
    }
    return result.success
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-swipe-background">
      <SpChatHeader
        conversation={{
          name: match.nickname ?? '',
          image: match.image ?? '',
        }}
      />

      {/* メッセージ部分 */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {matchedDate && (
          <SpMatchBanner matchedDate={matchedDate} nickname={match.nickname} />
        )}
        {messages.map((msg, i) => (
          <Fragment key={msg.id}>
            {isDifferentDay(msg.created_at, messages[i - 1]?.created_at) && (
              <ChatDateDivider createdAt={msg.created_at} />
            )}
            <ChatMessageBubble
              message={msg}
              from={msg.sender_user_id === match.user_id ? 'them' : 'me'}
            />
          </Fragment>
        ))}
      </div>

      <ChatInput onSubmit={handleSend} />
    </div>
  )
}

function SpMatchBanner({
  matchedDate,
  nickname,
}: {
  matchedDate: string
  nickname?: string
}) {
  return (
    <div className="flex justify-center">
      <span className="text-xs text-swipe-muted-foreground">
        {matchedDate}に{nickname}さんとマッチしました
      </span>
    </div>
  )
}

export function EmptyChat() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center bg-swipe-background">
      <p className="text-xl font-bold text-swipe-foreground">
        選択中のやりとりはありません
      </p>
      <p className="mt-2 text-sm text-swipe-muted-foreground">
        選択したやりとりが表示されます
      </p>
    </div>
  )
}
