import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// SPのチャット詳細ヘッダー
export function SpChatHeader({
  conversation,
}: {
  conversation: { name: string; image: string }
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-swipe-border px-4">
      <Link
        href="/messages"
        aria-label="メッセージ一覧へ戻る"
        className="flex size-10 shrink-0 items-center justify-center text-swipe-foreground"
      >
        <ArrowLeft className="size-6" aria-hidden="true" />
      </Link>

      <span className="size-10 shrink-0 overflow-hidden rounded-full bg-swipe-surface">
        <Image
          src={conversation.image || '/placeholder.svg'}
          alt={`${conversation.name}さん`}
          width={40}
          height={40}
          loading="eager"
          className="h-full w-full object-cover"
        />
      </span>

      <span className="truncate text-lg font-bold text-swipe-foreground">
        {conversation.name}
      </span>
    </header>
  )
}
