import { Quote, Tag } from 'lucide-react'
import type {
  MatchProfileDetail,
  TagSummary,
} from '@/generated/urekoiAPI.schemas'

// マッチ相手のプロフィールパネル(チャット画面の右側)
export function PartnerProfilePanel({
  profile,
}: {
  profile: MatchProfileDetail
}) {
  const images = profile.images ?? []
  const tagGroups = groupTagsByCategory(profile.tags ?? [])

  return (
    <div className="flex w-[340px] shrink-0 flex-col overflow-y-auto border-l border-swipe-border">
      <div className="relative aspect-[3/4] w-full shrink-0 bg-swipe-surface">
        <div className="absolute inset-x-3 top-3 z-10 flex gap-1.5">
          {(images.length > 0 ? images : ['']).map((_, i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-full ${i === 0 ? 'bg-swipe-foreground' : 'bg-swipe-foreground/35'}`}
            />
          ))}
        </div>

        {images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0]}
            alt={profile.nickname}
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[30px] font-extrabold text-swipe-foreground">
              {profile.nickname}
            </span>
            <span className="text-[22px] font-semibold text-swipe-foreground">
              {profile.age}
            </span>
          </div>
        </div>
      </div>

      {tagGroups.map(([category, tags]) => (
        <div
          key={category}
          className="flex flex-col gap-2 border-b border-swipe-border p-5"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-swipe-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            {category}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag.label}
                className="rounded-full bg-swipe-surface px-3 py-1 text-xs text-swipe-foreground"
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      ))}

      {profile.bio && (
        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-swipe-muted-foreground">
            <Quote className="h-3.5 w-3.5" />
            自己紹介
          </div>
          <p className="text-sm leading-relaxed text-swipe-foreground/90">
            {profile.bio}
          </p>
        </div>
      )}
    </div>
  )
}

// タグをcategoryごとにグループ化する(出現順を保つ)
function groupTagsByCategory(tags: TagSummary[]): [string, TagSummary[]][] {
  const groups = new Map<string, TagSummary[]>()
  for (const tag of tags) {
    const category = tag.category ?? ''
    const list = groups.get(category) ?? []
    list.push(tag)
    groups.set(category, list)
  }
  return [...groups.entries()]
}
