'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { useReceivedLikes } from '@/hooks/use-received-likes'
import { useUnmessagedMatches } from '@/hooks/use-match-profiles'
import type {
  MatchProfile,
  PendingLikesResponse,
} from '@/generated/urekoiAPI.schemas'

// 新しいマッチ一覧。Like件数と未会話のマッチを横スクロールで表示する。
export function NewMatches({
  initialLikes,
  initialMatches,
}: {
  initialLikes?: PendingLikesResponse
  initialMatches?: MatchProfile[]
}) {
  const { data: receivedLikes } = useReceivedLikes(initialLikes)
  const { data: matches } = useUnmessagedMatches(initialMatches)
  const likeCount = receivedLikes?.total ?? 0

  return (
    <section className="shrink-0">
      <div className="flex gap-3 overflow-x-auto px-5 pb-5">
        <Link
          href="/likes/pending"
          className="flex w-20 shrink-0 flex-col items-center gap-2"
        >
          <span className="flex size-20 items-center justify-center rounded-full border-2 border-primary bg-primary/15">
            <Heart className="h-7 w-7 fill-primary text-primary" />
          </span>
          <span className="text-center text-xs font-semibold text-foreground">
            {likeCount}件のいいね
          </span>
        </Link>

        {(matches ?? []).map((match) => (
          <Link
            key={match.user_id}
            href={`/messages/${match.match_id}`}
            className="flex w-20 shrink-0 flex-col items-center gap-2"
          >
            <span className="relative size-20 overflow-hidden rounded-full bg-card">
              {match.image && (
                <Image
                  src={match.image}
                  alt={match.nickname ?? 'プロフィール画像'}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </span>
            <span className="w-full truncate text-center text-xs font-semibold text-foreground">
              {match.nickname}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
