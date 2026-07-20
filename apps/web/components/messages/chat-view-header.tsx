import Image from 'next/image'
import { ChevronLeft, MoreHorizontal, StickyNote } from 'lucide-react'

export function ChatViewHeader({
  conversation,
  onBack,
}: {
  conversation: { name: string; image: string }
  onBack: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="戻る"
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <span className="h-9 w-9 overflow-hidden rounded-full">
          <Image
            src={conversation.image || '/placeholder.svg'}
            alt={`${conversation.name}さん`}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        </span>
        <span className="font-bold text-foreground">{conversation.name}</span>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        <StickyNote className="h-5 w-5" />
        <MoreHorizontal className="h-5 w-5" />
      </div>
    </div>
  )
}
