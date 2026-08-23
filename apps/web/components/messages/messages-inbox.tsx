import { ConversationList } from './conversation-list'
import { NewMatches } from './new-matches'
import type {
  MatchProfile,
  MatchProfileWithLastMessage,
  PendingLikesResponse,
} from '@/generated/urekoiAPI.schemas'

export function MessagesInbox({
  initialLikes,
  initialUnmessagedMatches,
  initialMessagedMatches,
}: {
  initialLikes: PendingLikesResponse
  initialUnmessagedMatches: MatchProfile[]
  initialMessagedMatches: MatchProfileWithLastMessage[]
}) {
  return (
    <main className="flex h-full min-h-0 flex-1 flex-col bg-swipe-background">
      <div className="min-h-0 flex-1 overflow-y-auto pt-4">
        <NewMatches
          initialLikes={initialLikes}
          initialMatches={initialUnmessagedMatches}
        />
        <ConversationList initialMatches={initialMessagedMatches} />
      </div>
    </main>
  )
}
