'use client'

import type { Conversation } from '@/lib/conversations'
import { MessageListHeader } from './message-list-header'
import { MatchingCarousel } from './matching-carousel'
import { ConversationList } from './conversation-list'

export function MessageList({
  selectedId,
  onSelect,
}: {
  selectedId: number | null
  onSelect: (c: Conversation) => void
}) {
  return (
    <div className="flex h-screen w-full shrink-0 flex-col border-r border-border bg-card md:w-[360px]">
      <MessageListHeader />
      <MatchingCarousel />
      <div className="border-t border-border" />
      <ConversationList selectedId={selectedId} onSelect={onSelect} />
    </div>
  )
}
