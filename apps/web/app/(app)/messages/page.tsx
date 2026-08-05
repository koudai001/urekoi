import { EmptyChat } from '@/components/messages/chat-view'
import { SpMessagesInbox } from '@/components/messages/sp-messages-inbox'

export default function MessagesPage() {
  return (
    <>
      <div className="flex min-h-0 flex-1 md:hidden">
        <SpMessagesInbox />
      </div>
      <div className="hidden min-h-0 flex-1 md:flex">
        <EmptyChat />
      </div>
    </>
  )
}
