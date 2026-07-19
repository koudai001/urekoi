'use client'

import { useMatchProfiles } from './use-match-profiles'
import { MatchingAvatar } from './matching-carousel-avatar'

// マッチング済みでまだメッセージのやり取りがない相手を横スクロールで表示する
export function MatchingCarousel() {
  const { data } = useMatchProfiles()
  const matches = data ?? []

  return (
    <div className="px-5 pb-4">
      <p className="mb-3 text-sm font-bold text-foreground">マッチング</p>
      <div className="relative">
        <div className="flex cursor-pointer gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {matches.map((m) => (
            <MatchingAvatar key={m.user_id} match={m} />
          ))}
        </div>
      </div>
    </div>
  )
}
