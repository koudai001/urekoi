'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ProfileImageResponse } from '@/generated/urekoiAPI.schemas'

// 枚数カウンター付きの写真カルーセル。デフォルトはaspect-[3/4]、
// full指定時は親の高さいっぱいに広がる(スワイプカードなど親がサイズを決める場合用)。
// 画像の左1/3・右1/3をクリックすると前後の写真に切り替わる(端では止まり循環しない)
export function PhotoViewer({
  images,
  alt,
  full,
  className,
  priority,
}: {
  images: ProfileImageResponse[]
  alt: string
  full?: boolean
  className?: string
  // LCP対象になり得る最上段のカードなどでtrueにする
  priority?: boolean
}) {
  const [index, setIndex] = useState(0)
  const photos = images.length > 0 ? images : [{ url: '' }]

  const changePhoto = (dir: -1 | 1) => {
    setIndex((i) => {
      const next = i + dir
      if (next < 0) return i
      if (next >= photos.length) return i
      return next
    })
  }

  return (
    <div
      className={cn(
        'relative bg-swipe-surface',
        full ? 'h-full w-full' : 'aspect-[3/4] w-full shrink-0',
        photos.length > 1 && 'cursor-pointer',
        className,
      )}
    >
      {/* 複数枚ある場合だけ、現在位置と総数を右上へ表示する */}
      {photos.length > 1 && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-swipe-background/70 px-3 py-1 text-sm font-semibold text-swipe-foreground">
          {index + 1} / {photos.length}
        </span>
      )}

      {photos[index].url && (
        <Image
          src={photos[index].url}
          alt={alt}
          fill
          sizes="448px"
          className="object-cover"
          draggable={false}
          priority={priority}
        />
      )}

      {photos.length > 1 && (
        <>
          <button
            aria-label="前の写真"
            onClick={() => changePhoto(-1)}
            className="absolute inset-y-0 left-0 w-1/3 cursor-pointer"
          />
          <button
            aria-label="次の写真"
            onClick={() => changePhoto(1)}
            className="absolute inset-y-0 right-0 w-1/3 cursor-pointer"
          />
        </>
      )}
    </div>
  )
}
