'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { MessageList } from '@/components/message-list'
import { ChatView, EmptyChat } from '@/components/chat-view'
import type { Conversation } from '@/lib/conversations'

export default function MessagesPage() {
  const [selected, setSelected] = useState<Conversation | null>(null)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active="メッセージ" />
      <main className="flex flex-1">
        <MessageList selectedId={selected?.id ?? null} onSelect={setSelected} />
        {selected ? (
          <ChatView conversation={selected} onBack={() => setSelected(null)} />
        ) : (
          <EmptyChat />
        )}
      </main>
    </div>
  )
}
