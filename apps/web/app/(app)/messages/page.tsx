'use client'

import { useState } from 'react'
import { MessageListHeader } from '@/components/messages/message-list-header'
import { MatchingCarousel } from '@/components/messages/matching-carousel'
import { ChatList } from '@/components/messages/chat-list'
import { ChatView, EmptyChat } from '@/components/messages/chat-view'
import { useWsConnection } from '@/components/messages/use-ws-connection'
import type { MatchProfile } from '@/generated/urekoiAPI.schemas'

export default function MessagesPage() {
  useWsConnection()
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null)

  return (
    <main className="flex flex-1">
      <div className="flex h-screen w-full shrink-0 flex-col border-r border-border bg-card md:w-[360px]">
        <MessageListHeader />
        <MatchingCarousel onSelect={setSelectedMatch} />
        <div className="border-t border-border" />
        <ChatList
          selectedId={selectedMatch?.match_id ?? null}
          onSelect={setSelectedMatch}
        />
      </div>

      {selectedMatch ? (
        <ChatView match={selectedMatch} onBack={() => setSelectedMatch(null)} />
      ) : (
        <EmptyChat />
      )}
    </main>
  )
}
