import Image from 'next/image'
import { cn } from '@/lib/utils'
import { conversations, type Conversation } from '@/lib/conversations'

// トーク中の相手一覧
export function ConversationList({
  selectedId,
  onSelect,
}: {
  selectedId: number | null
  onSelect: (c: Conversation) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className={cn(
            'flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/40',
            selectedId === c.id && 'bg-accent/60',
          )}
        >
          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
            <Image
              src={c.image || '/placeholder.svg'}
              alt={`${c.name}さん`}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-bold text-foreground">
                {c.name} {c.age}歳 {c.area}
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {c.date}
              </span>
            </span>
            <span className="mt-1 flex items-center gap-1.5">
              <span
                className={cn(
                  'shrink-0 text-xs font-bold',
                  c.status === 'NEW' ? 'text-primary' : 'text-destructive',
                )}
              >
                {c.status}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {c.preview}
              </span>
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
