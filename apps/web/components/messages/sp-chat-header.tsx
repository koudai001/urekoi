import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

// SPのチャット詳細ヘッダー
export function SpChatHeader({
  conversation,
}: {
  conversation: { name: string; image: string }
}) {
  return (
    <header className="relative flex shrink-0 items-center justify-center border-b border-swipe-border px-5 py-3">
      <Link
        href="/messages"
        aria-label="メッセージ一覧へ戻る"
        className="absolute left-3 flex h-10 w-10 items-center justify-center text-swipe-accent"
      >
        <ChevronLeft className="h-6 w-6" />
      </Link>

      <div className="flex flex-col items-center gap-1.5">
        <span className="h-11 w-11 overflow-hidden rounded-full bg-swipe-surface">
          <Image
            src={conversation.image || '/placeholder.svg'}
            alt={`${conversation.name}さん`}
            width={44}
            height={44}
            loading="eager"
            className="h-full w-full object-cover"
          />
        </span>
        <span className="text-sm font-bold text-swipe-foreground">
          {conversation.name}
        </span>
      </div>
    </header>
  )
}
