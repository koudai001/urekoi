import Image from 'next/image'
import Link from 'next/link'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'
import { dummyProfileImageFor } from '@/lib/dummy-profile-image'

// ユーザー概要を縦型一覧の1行として表示する
export function UserListItem({
  profile,
  href,
  actions,
  priority = false,
}: {
  profile: ProfileDetail
  href: string
  actions?: React.ReactNode
  priority?: boolean
}) {
  const imageUrl =
    profile.images.find((image) => image.url)?.url ??
    dummyProfileImageFor(profile.user_id)

  return (
    <article className="flex gap-4 border-b border-swipe-border px-4 py-5">
      <Link
        href={href}
        aria-label={`${profile.nickname}さんのプロフィールを見る`}
        className="relative size-24 shrink-0 overflow-hidden rounded-full bg-swipe-surface"
      >
        <Image
          src={imageUrl}
          alt={`${profile.nickname}さんの写真`}
          fill
          sizes="96px"
          className="object-cover"
          priority={priority}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={href} className="block min-w-0">
          <p className="truncate text-xl font-bold text-swipe-foreground">
            {profile.nickname}
          </p>
          <p className="mt-1 truncate text-base text-swipe-muted-foreground">
            {profile.occupation || '職業未設定'} {profile.age}歳/
            {profile.prefecture}
          </p>
        </Link>

        {actions && <div className="mt-3">{actions}</div>}
      </div>
    </article>
  )
}
