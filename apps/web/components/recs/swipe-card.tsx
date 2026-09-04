import { PhotoViewer } from '@/components/myprofile/photo-viewer'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'

// スワイプカードの静的な表示部分(写真送り+名前・年齢・自己紹介)。ドラッグなどの操作は持たない
export function SwipeCard({
  profile,
  priority,
  children,
}: {
  profile: ProfileDetail
  // 一番上に表示されるカードなど、LCP対象になり得る場合はtrueにする
  priority?: boolean
  // ラベルを表示するなど、カードの上に重ねて表示する要素があればchildrenで渡す
  children?: React.ReactNode
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-card shadow-xl ring-1 ring-border">
      <PhotoViewer
        images={profile.images ?? []}
        alt={`${profile.nickname}さんの写真`}
        full
        priority={priority}
      />

      {/* 下部の名前・自己紹介*/}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-5 pb-24 pt-12">
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl font-bold text-foreground">
            {profile.nickname}
          </span>
          <span className="text-2xl font-semibold text-foreground">
            {profile.age}
          </span>
        </div>
        <p className="mt-1 text-base font-medium text-foreground/90">
          {profile.prefecture}
        </p>
        {profile.bio && (
          <p className="mt-3 text-lg text-foreground/90">{profile.bio}</p>
        )}
      </div>

      {children}
    </div>
  )
}
