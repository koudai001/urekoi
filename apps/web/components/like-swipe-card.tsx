'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LikeProfile } from '@/lib/likes'

type Direction = 'like' | 'skip'

export function LikeSwipeCard({
  profile,
  onDecision,
  registerArrowAction,
}: {
  profile: LikeProfile
  onDecision: (dir: Direction) => void
  // 親（外側の矢印）からスワイプを発火できるように関数を渡す
  registerArrowAction?: (fn: (dir: Direction) => void) => void
}) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const [drag, setDrag] = useState(0)
  const [leaving, setLeaving] = useState<Direction | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef<number | null>(null)
  const dragging = useRef(false)

  const threshold = 110

  function fly(dir: Direction) {
    if (leaving) return
    setLeaving(dir)
    // アニメーション後に親へ通知
    window.setTimeout(() => onDecision(dir), 280)
  }

  // 外側の矢印ボタンからも同じアクションを呼べるよう登録
  registerArrowAction?.(fly)

  function onPointerDown(e: React.PointerEvent) {
    if (leaving) return
    dragging.current = true
    setIsDragging(true)
    startX.current = e.clientX
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || startX.current === null) return
    setDrag(e.clientX - startX.current)
  }

  function onPointerUp() {
    if (!dragging.current) return
    dragging.current = false
    setIsDragging(false)
    if (drag > threshold) fly('like')
    else if (drag < -threshold) fly('skip')
    setDrag(0)
    startX.current = null
  }

  const translateX = leaving ? (leaving === 'like' ? 600 : -600) : drag
  const rotate = translateX / 28
  const likeOpacity = Math.max(0, Math.min(1, translateX / threshold))
  const skipOpacity = Math.max(0, Math.min(1, -translateX / threshold))

  function changePhoto(e: React.MouseEvent, dir: -1 | 1) {
    e.stopPropagation()
    setPhotoIndex((i) => {
      const next = i + dir
      if (next < 0) return profile.photos.length - 1
      if (next >= profile.photos.length) return 0
      return next
    })
  }

  return (
    <div
      className="relative aspect-[3/4] w-full select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        transform: `translateX(${translateX}px) rotate(${rotate}deg)`,
        transition:
          leaving || !isDragging ? 'transform 0.28s ease-out' : 'none',
        opacity: leaving ? 0 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-muted shadow-xl ring-1 ring-border">
        <Image
          src={profile.photos[photoIndex] || '/placeholder.svg'}
          alt={`${profile.name}さんの写真`}
          fill
          className="object-cover"
          draggable={false}
          priority
        />

        {/* 写真カウンター */}
        <span className="absolute right-4 top-4 rounded-md bg-black/55 px-2.5 py-1 text-sm font-medium text-white">
          {photoIndex + 1} / {profile.photos.length}
        </span>

        {/* 写真送りの左右矢印（カード内） */}
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
                  profile.online === 'online'
                    ? 'bg-green-400'
                    : 'bg-yellow-400',
                )}
              />
            )}
            <span className="font-heading text-2xl font-bold text-white">
              {profile.name}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-white/90">
            {profile.age}歳　{profile.area}
          </p>
        </div>

        {/* スワイプ中のラベル */}
        <span
          className="pointer-events-none absolute left-5 top-5 rotate-[-12deg] rounded-lg border-4 border-primary px-4 py-1 text-2xl font-extrabold tracking-wide text-primary"
          style={{ opacity: likeOpacity }}
        >
          いいね！
        </span>
        <span
          className="pointer-events-none absolute right-5 top-5 rotate-[12deg] rounded-lg border-4 border-muted-foreground px-4 py-1 text-2xl font-extrabold tracking-wide text-muted-foreground"
          style={{ opacity: skipOpacity }}
        >
          スキップ
        </span>
      </div>
    </div>
  )
}
