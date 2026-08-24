'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMessagedMatches } from '@/hooks/use-match-profiles'
import type { MatchProfileWithLastMessage } from '@/generated/urekoiAPI.schemas'

// 会話一覧。会話済みマッチを最新メッセージとともに表示する。
export function ConversationList({
  initialMatches,
}: {
  initialMatches?: MatchProfileWithLastMessage[]
}) {
  const { data: matches } = useMessagedMatches(initialMatches)

  return (
    <section>
      <h2 className="px-5 py-3 text-base font-bold text-swipe-foreground">
        メッセージ
      </h2>

      <div className="divide-y divide-swipe-border">
        {(matches ?? []).map((match) => (
          <Link
            key={match.user_id}
            href={`/messages/${match.match_id}`}
            className="flex items-center gap-4 px-5 py-4 transition-colors active:bg-swipe-surface"
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-swipe-surface">
              {match.image && (
                <Image
                  src={match.image}
                  alt={match.nickname ?? 'プロフィール画像'}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-bold text-swipe-foreground">
                {match.nickname}
              </span>
              <span className="mt-0.5 block truncate text-sm text-swipe-muted-foreground">
                {match.last_message_sender_user_id !== match.user_id && '↩ '}
                {match.last_message}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
