import Image from 'next/image'
import type { MatchProfile } from '@/generated/urekoiAPI.schemas'

// マッチングカルーセルの1人分(アバター + 年齢/エリア)
export function MatchingAvatar({
  match,
  onSelect,
}: {
  match: MatchProfile
  onSelect: (match: MatchProfile) => void
}) {
  return (
    <button
      onClick={() => onSelect(match)}
      className="flex w-16 shrink-0 cursor-pointer flex-col items-center gap-1"
    >
      <span className="relative">
        <span className="block h-16 w-16 overflow-hidden rounded-full ring-2 ring-border">
          <Image
            src={match.image || '/placeholder.svg'}
            alt={`${match.nickname}さん`}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </span>
        {/* {match.online ? (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-chart-2" />
        ) : null} */}
      </span>
      <span className="w-full truncate text-center text-[11px] text-muted-foreground">
        {match.age}歳 {match.prefecture}
      </span>
    </button>
  )
}
