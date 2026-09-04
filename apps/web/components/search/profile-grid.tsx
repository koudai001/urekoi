import Image from 'next/image'
import Link from 'next/link'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'
import { dummyProfileImageFor } from '@/lib/dummy-profile-image'

// プロフィール一覧を、遷移先に応じた2列グリッドとして表示する
export function ProfileGrid({
  profiles,
  hrefPrefix,
}: {
  profiles: ProfileDetail[]
  hrefPrefix: string
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {profiles.map((profile, index) => (
        <ProfileGridCard
          key={profile.user_id}
          profile={profile}
          href={`${hrefPrefix}/${profile.user_id}`}
          priority={index < 2}
        />
      ))}
    </div>
  )
}

// 写真と判断に必要なプロフィール概要をコンパクトに表示する
function ProfileGridCard({
  profile,
  href,
  priority,
}: {
  profile: ProfileDetail
  href: string
  priority: boolean
}) {
  const imageUrl =
    profile.images.find((image) => image.url)?.url ??
    dummyProfileImageFor(profile.user_id)

  return (
    <Link
      href={href}
      aria-label={`${profile.nickname}さんのプロフィールを見る`}
      className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square bg-card">
        <Image
          src={imageUrl}
          alt={`${profile.nickname}さんの写真`}
          fill
          sizes="(max-width: 448px) 50vw, 216px"
          className="object-cover"
          priority={priority}
        />
      </div>

      <div className="space-y-1 px-3 py-2">
        <p className="flex min-w-0 items-baseline gap-1 text-foreground">
          <span className="shrink-0 text-base font-bold">{profile.age}歳</span>
          <span className="truncate text-sm font-semibold">
            {profile.prefecture}
          </span>
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {profile.occupation || '職業未設定'}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {profile.bio || 'よろしくお願いします'}
        </p>
      </div>
    </Link>
  )
}
