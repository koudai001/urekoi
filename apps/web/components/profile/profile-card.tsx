import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { dummyProfileImageFor } from '@/lib/dummy-profile-image'
import type { ProfileSummary } from '@/generated/urekoiAPI.schemas'
import { FavoriteButton } from '@/components/ui/favorite-button'

export function ProfileCard({ profile }: { profile: ProfileSummary }) {
  return (
    <Link
      href={`/search/all/partner/${profile.id}`}
      prefetch={false}
      className="group flex w-full flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      aria-label={`${profile.nickname}さんのプロフィールを開く`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-sm">
        <Image
          src={profile.image || dummyProfileImageFor(profile.id ?? 0)}
          alt={`${profile.nickname}さんのプロフィール写真`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {profile.is_new && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow">
            NEW
          </span>
        )}

        <FavoriteButton className="absolute right-2 top-2" />
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        <span
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            profile.online === 'online'
              ? 'bg-green-500'
              : profile.online === 'recent'
                ? 'bg-amber-400'
                : 'bg-muted-foreground/40',
          )}
        />
        <span className="text-sm font-medium text-foreground">
          {profile.age}歳
        </span>
        <span className="text-sm font-medium text-foreground">
          {profile.prefecture}
        </span>
      </div>
    </Link>
  )
}
