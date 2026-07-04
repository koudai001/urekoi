import Image from 'next/image'
import type { TagSummary } from '@/generated/urekoiAPI.schemas'

export function ProfileTagList({ tags }: { tags: TagSummary[] }) {
  return (
    <div className="w-full overflow-hidden rounded-3xl bg-card shadow-xl">
      <div className="px-6 pt-6">
        <h3 className="font-heading text-xl font-bold text-foreground">
          マイタグ
        </h3>
      </div>
      <ul className="flex flex-col px-4 py-3">
        {tags.map((tag) => {
          const label = tag.label ?? ''
          return (
            <li
              key={label}
              className="flex items-center gap-4 rounded-2xl px-2 py-2.5 transition-colors hover:bg-secondary/60"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={tag.image_url || '/placeholder.svg'}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{label}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {tag.category}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
