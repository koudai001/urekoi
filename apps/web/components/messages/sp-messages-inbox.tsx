import { SpConversationList } from './sp-conversation-list'
import { SpNewMatches } from './sp-new-matches'

// SPのメッセージ受信箱
export function SpMessagesInbox() {
  return (
    <main className="flex h-full min-h-0 flex-1 flex-col bg-swipe-background">
      <div className="min-h-0 flex-1 overflow-y-auto pt-4">
        <SpNewMatches />
        <SpConversationList />
      </div>
    </main>
  )
}
