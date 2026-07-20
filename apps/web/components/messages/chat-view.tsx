'use client'

import { sendMessage } from '@/actions/messages'
import { useMessages } from './use-messages'
import { ChatViewHeader } from './chat-view-header'
import { ChatMessageBubble } from './chat-message-bubble'
import { ChatInput } from './chat-input'
import type { MatchProfile } from '@/generated/urekoiAPI.schemas'

export function ChatView({
  match,
  onBack,
}: {
  match: MatchProfile
  onBack: () => void
}) {
  const matchId = match.match_id ?? 0
  const { data, mutate } = useMessages(matchId)
  // BEは新しい順で返すので、表示用に古い順へ並べ替える
  const messages = [...(data ?? [])].reverse()

  const handleSend = async (body: string) => {
    const result = await sendMessage(matchId, body)
    if (result.success) await mutate()
    return result.success
  }

  return (
    <div className="flex h-screen flex-1 flex-col bg-card">
      <ChatViewHeader
        conversation={{ name: match.nickname ?? '', image: match.image ?? '' }}
        onBack={onBack}
      />

      {/* メッセージ部分 */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            from={msg.sender_user_id === match.user_id ? 'them' : 'me'}
          />
        ))}
      </div>

      <ChatInput onSubmit={handleSend} />
    </div>
  )
}

export function EmptyChat() {
  return (
    <div className="hidden h-screen flex-1 flex-col items-center justify-center bg-card md:flex">
      <p className="text-xl font-bold text-foreground">
        選択中のやりとりはありません
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        選択したやりとりが表示されます
      </p>
    </div>
  )
}
