import Image from 'next/image'
import { ThumbsUp, ShieldCheck, Clock } from 'lucide-react'
import { dummyProfileImageFor } from '@/lib/dummy-profile-image'
import { LikeButton } from './like-button'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'

export function ProfileDetailCard({ profile }: { profile: ProfileDetail }) {
  const image =
    profile.images?.[0] || dummyProfileImageFor(profile.user_id ?? 0)

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-card shadow-xl lg:w-80 lg:shrink-0">
      <div className="relative aspect-[3/4] w-full bg-muted">
        <Image
          src={image}
          alt={`${profile.nickname}さんのプロフィール写真`}
          fill
          sizes="320px"
          className="object-cover"
        />
        {/* いいねボタン（写真下端中央に重ねる） */}
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
          <LikeButton toUserId={profile.user_id ?? 0} />
        </div>
      </div>

      <div className="px-5 pb-6 pt-10">
        {profile.is_new && (
          <p className="text-sm font-bold text-primary">新着のお相手</p>
        )}
        <h2 className="mt-1 font-heading text-3xl font-bold text-foreground">
          {profile.nickname}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile.age}歳 {profile.prefecture}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            {profile.online === 'online' ? 'オンライン' : '24時間以内'}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <ThumbsUp className="h-3.5 w-3.5 text-primary" />? いいね！
          </span>
          <span className="inline-flex items-center gap-1 text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            本人確認済み
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground">
          {profile.bio}
        </p>
      </div>
    </div>
  )
}
