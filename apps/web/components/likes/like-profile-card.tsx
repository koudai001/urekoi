'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LikeProfile } from '@/generated/urekoiAPI.schemas'

// いいねカードの静的な表示部分(写真送り+名前・年齢・都道府県)。ドラッグなどの操作は持たない
export function LikeProfileCard({
  profile,
  priority,
  children,
}: {
  profile: LikeProfile
  priority?: boolean
  children?: React.ReactNode
}) {
  // 今何枚目の写真を表示しているか
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = profile.photos ?? []

  const changePhoto = (e: React.MouseEvent, dir: -1 | 1) => {
    e.stopPropagation()
    setPhotoIndex((i) => {
      const next = i + dir
      if (next < 0) return photos.length - 1
      if (next >= photos.length) return 0
      return next
    })
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-muted shadow-xl ring-1 ring-border">
      <Image
        src={photos[photoIndex] || '/placeholder.svg'}
        alt={`${profile.nickname}さんの写真`}
        fill
        className="object-cover"
        draggable={false}
        priority={priority}
      />

      {/* 写真カウンター */}
      <span className="absolute right-4 top-4 rounded-md bg-black/55 px-2.5 py-1 text-sm font-medium text-white">
        {photoIndex + 1} / {photos.length}
      </span>

      {/* 写真送りの左右矢印 */}
      <button
        aria-label="前の写真"
        onClick={(e) => changePhoto(e, -1)}
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-foreground/70 shadow backdrop-blur transition hover:bg-white"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="次の写真"
        onClick={(e) => changePhoto(e, 1)}
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-foreground/70 shadow backdrop-blur transition hover:bg-white"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* 下部グラデーション＋名前 */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-12">
        <div className="flex items-center gap-2">
          {profile.online && (
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                profile.online === 'online' ? 'bg-green-400' : 'bg-yellow-400',
              )}
            />
          )}
          <span className="font-heading text-2xl font-bold text-white">
            {profile.nickname}
          </span>
        </div>
        <p className="mt-0.5 text-sm font-medium text-white/90">
          {profile.age}歳　{profile.prefecture}
        </p>
      </div>

      {children}
    </div>
  )
}
