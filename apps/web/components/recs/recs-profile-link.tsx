import Link from 'next/link'
import { ArrowUp } from 'lucide-react'

// Recsカード上から相手の詳細プロフィールへ移動する導線
export function RecsProfileLink({
  userId,
  from,
}: {
  userId?: number
  from?: 'likes'
}) {
  if (!userId) return null

  const query = from ? '?from=likes' : ''

  return (
    <Link
      href={`/recs/profile/${userId}${query}`}
      aria-label="プロフィール詳細を見る"
      className="absolute bottom-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur transition hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <ArrowUp className="h-6 w-6" strokeWidth={3} />
    </Link>
  )
}
