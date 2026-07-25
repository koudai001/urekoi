import Image from 'next/image'
import Link from 'next/link'
import { MoreHorizontal, X } from 'lucide-react'

// マッチ日時を「2025/4/6」形式に整形する
function formatMatchedDate(matchedAt?: string) {
  if (!matchedAt) return ''
  return new Date(matchedAt).toLocaleDateString('ja-JP')
}

export function ChatViewHeader({
  conversation,
  matchedAt,
}: {
  conversation: { name: string; image: string }
  matchedAt?: string
}) {
  const matchedDate = formatMatchedDate(matchedAt)

  return (
    <div className="flex items-center justify-between border-b border-swipe-border px-6 py-5">
      <div className="flex items-center gap-4">
        <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-swipe-surface">
          <Image
            src={conversation.image || '/placeholder.svg'}
            alt={`${conversation.name}さん`}
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        </span>
        <span className="text-lg text-swipe-foreground/90">
          {matchedDate
            ? `${matchedDate}に${conversation.name}さんとマッチしました`
            : conversation.name}
        </span>
      </div>
      <div className="flex items-center gap-4 text-swipe-muted-foreground">
        <MoreHorizontal className="h-5 w-5" />
        <Link
          href="/messages"
          aria-label="閉じる"
          className="hover:text-swipe-foreground"
        >
          <X className="h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}
