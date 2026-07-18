'use client'

import { useRef, useState } from 'react'
import { LikeActions } from './like-actions'
import { LikeProfileCard } from './like-profile-card'
import type { LikeProfile } from '@/generated/urekoiAPI.schemas'

type Direction = 'like' | 'skip'

// カードが吹っ飛ぶアニメーションの時間(ms)
const FLY_ANIMATION_MS = 500

export function LikeSwipeCard({
  profile,
  nextProfile,
  onSwipe,
}: {
  profile: LikeProfile
  // 背後に覗かせる次の人（居なければ表示しない）
  nextProfile?: LikeProfile
  onSwipe: (dir: Direction) => void
}) {
  // 今のスワイプ量（px）
  const [drag, setDrag] = useState(0)
  // 吹っ飛び中かどうか、どっち方向か
  const [leaving, setLeaving] = useState<Direction | null>(null)
  // ドラッグ中かどうか
  const [isDragging, setIsDragging] = useState(false)
  // ドラッグ開始時のマウス位置（値が変わっても再レンダリングを起こしたくないのでuseRef）
  const startX = useRef<number | null>(null)
  // ドラッグ中フラグ（値が変わっても再レンダリングを起こしたくないのでuseRef）
  const dragging = useRef(false)
  // スワイプ判定の閾値(px)
  const threshold = 110

  // スワイプ確定処理
  const fly = (dir: Direction) => {
    if (leaving) return
    setLeaving(dir)
    // アニメーション後に親へ通知
    window.setTimeout(() => onSwipe(dir), FLY_ANIMATION_MS)
  }

  // 指を置いた瞬間: ドラッグ開始位置を記録してドラッグ中フラグを立てる
  const onPointerDown = (e: React.PointerEvent) => {
    if (leaving) return
    dragging.current = true
    setIsDragging(true)
    startX.current = e.clientX
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  // 指を動かした瞬間: 開始位置との距離を計算してdragに反映
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || startX.current === null) return
    setDrag(e.clientX - startX.current)
  }

  // 指を離した瞬間: dragが閾値を超えていればflyを実行、超えなければdragを0に戻す
  const onPointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    setIsDragging(false)
    if (drag > threshold) fly('like')
    else if (drag < -threshold) fly('skip')
    setDrag(0)
    startX.current = null
  }

  // 見た目の計算関連
  const translateX = leaving ? (leaving === 'like' ? 600 : -600) : drag
  const rotate = translateX / 28
  // スワイプの進捗に応じてラベルの透明度を変える
  const likeOpacity = Math.max(0, Math.min(1, translateX / threshold))
  const skipOpacity = Math.max(0, Math.min(1, -translateX / threshold))

  return (
    <>
      <div className="relative mx-auto aspect-[3/4] w-[300px] max-w-[65vw] shrink-0">
        {/* 次の人（背後に少し覗かせるだけ、操作不可） */}
        {nextProfile && (
          <div className="absolute inset-x-3 bottom-0 top-2">
            <LikeProfileCard profile={nextProfile} />
          </div>
        )}

        <div
          className="absolute inset-0 select-none touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            transform: `translateX(${translateX}px) rotate(${rotate}deg)`,
            transition:
              leaving || !isDragging
                ? `transform ${FLY_ANIMATION_MS}ms ease-out, opacity ${FLY_ANIMATION_MS}ms ease-out`
                : 'none',
            opacity: leaving ? 0 : 1,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <LikeProfileCard profile={profile} priority>
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
          </LikeProfileCard>
        </div>
      </div>

      <LikeActions onSkip={() => fly('skip')} onLike={() => fly('like')} />
    </>
  )
}
