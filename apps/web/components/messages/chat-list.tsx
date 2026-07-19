'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useMatchProfiles } from './use-match-profiles'
import type { MatchProfile } from '@/generated/urekoiAPI.schemas'

// トーク中の相手一覧(最新メッセージプレビューは未実装。今はマッチ済み全員を表示する)
export function ChatList({
  selectedId,
  onSelect,
}: {
  selectedId: number | null
  onSelect: (match: MatchProfile) => void
}) {
  const { data } = useMatchProfiles()
  const matches = data ?? []

  return (
    <div className="flex-1 overflow-y-auto">
      {matches.map((m) => (
        <button
          key={m.user_id}
          onClick={() => onSelect(m)}
          className={cn(
            'flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/40',
            selectedId === m.match_id && 'bg-accent/60',
          )}
        >
          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
            <Image
              src={m.image || '/placeholder.svg'}
              alt={`${m.nickname}さん`}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="truncate text-sm font-bold text-foreground">
              {m.nickname} {m.age}歳 {m.prefecture}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
