'use client'

import Link from 'next/link'
import { useMessagedMatches } from '@/hooks/use-match-profiles'

// SPの会話一覧。会話済みマッチを最新メッセージとともに表示する。
export function SpConversationList() {
  const { data: matches } = useMessagedMatches()

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
            <span className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-swipe-surface">
              {match.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={match.image}
                  alt={match.nickname}
                  className="h-full w-full object-cover"
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
