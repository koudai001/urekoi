'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { MessageListHeader } from '@/components/messages/message-list-header'
import { MatchingCarousel } from '@/components/messages/matching-carousel'
import { ChatList } from '@/components/messages/chat-list'
import { ChatView, EmptyChat } from '@/components/messages/chat-view'
import type { MatchProfile } from '@/generated/urekoiAPI.schemas'

export default function MessagesPage() {
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active="メッセージ" />
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
          <ChatView
            match={selectedMatch}
            onBack={() => setSelectedMatch(null)}
          />
        ) : (
          <EmptyChat />
        )}
      </main>
    </div>
  )
}
