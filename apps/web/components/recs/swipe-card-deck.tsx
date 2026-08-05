'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SwipeActions } from './swipe-actions'
import { SwipeCard } from './swipe-card'
import { CardContainer } from '@/components/ui/card-container'
import { RecsProfileLink } from './recs-profile-link'
import {
  type RecsContextValue,
  useRecsContext,
} from '@/providers/recs-provider'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'

type Direction = 'like' | 'skip'

// カードが吹っ飛ぶアニメーションの時間(ms)
const FLY_ANIMATION_MS = 500

// 候補デッキを表示し、現在の候補が切り替わるたびに操作状態をリセットする
export function SwipeCardDeck() {
  return <SwipeCardDeckContent {...useRecsContext()} />
}

// Providerの値を受け取り、現在の候補をカード本体へ渡すローカルコンポーネント
function SwipeCardDeckContent({
  current,
  next,
  swipeRequest,
  clearSwipeRequest,
  submitDecision,
}: RecsContextValue) {
  if (!current) {
    return <p className="text-sm text-swipe-muted-foreground">候補がいません</p>
  }

  return (
    <SwipeCardDeckItem
      key={current.user_id}
      profile={current}
      nextProfile={next}
      swipeRequest={
        swipeRequest?.userId === current.user_id ? swipeRequest : null
      }
      clearSwipeRequest={clearSwipeRequest}
      submitDecision={submitDecision}
    />
  )
}

// スワイプ対象1人分のカード(ドラッグ/フリックでいいね・スキップできる)
function SwipeCardDeckItem({
  profile,
  nextProfile,
  swipeRequest,
  clearSwipeRequest,
  submitDecision,
}: {
  profile: ProfileDetail
  // 背後に覗かせる次の人(居なければ表示しない)
  nextProfile?: ProfileDetail
  swipeRequest: RecsContextValue['swipeRequest']
  clearSwipeRequest: () => void
  submitDecision: (direction: Direction) => Promise<boolean>
}) {
  // 今のスワイプ量(px)
  const [drag, setDrag] = useState(0)
  // 吹っ飛ぶ方向が決まったかどうかと、どっち方向か
  const [leaving, setLeaving] = useState<Direction | null>(null)
  // ドラッグ中かどうか
  const [isDragging, setIsDragging] = useState(false)
  // ドラッグ開始時のマウス位置(値が変わっても再レンダリングを起こしたくないのでuseRef)
  const startX = useRef<number | null>(null)
  // ドラッグ中フラグ(値が変わっても再レンダリングを起こしたくないのでuseRef)
  const dragging = useRef(false)
  // スワイプ判定の閾値(px)
  const threshold = 110

  // カードを画面外へ飛ばす見た目の処理
  const startSwipeAnimation = useCallback(
    (direction: Direction) => {
      if (leaving) return
      setLeaving(direction)
    },
    [leaving],
  )

  // 詳細画面から届いた依頼も、通常操作と同じアニメーションへ流す
  useEffect(() => {
    if (!swipeRequest || leaving) return

    // ブラウザAPIを使って、レンダリングのタイミングでアニメーションを開始
    const frame = window.requestAnimationFrame(() => {
      clearSwipeRequest()
      startSwipeAnimation(swipeRequest.direction)
    })

    // クリーンアップ
    return () => window.cancelAnimationFrame(frame)
  }, [clearSwipeRequest, leaving, startSwipeAnimation, swipeRequest])

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
    if (drag > threshold) startSwipeAnimation('like')
    else if (drag < -threshold) startSwipeAnimation('skip')
    setDrag(0)
    startX.current = null
  }

  // CSSの移動アニメーションが完了してから、Providerでデータ操作を委ねる
  const handleTransitionEnd = async (event: React.TransitionEvent) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'transform' ||
      !leaving
    ) {
      return
    }

    const succeeded = await submitDecision(leaving)
    if (!succeeded) setLeaving(null)
  }

  // 見た目の計算関連
  const translateX = leaving ? (leaving === 'like' ? 600 : -600) : drag
  const rotate = translateX / 28
  // スワイプの進捗に応じてラベルの透明度を変える
  const likeOpacity = Math.max(0, Math.min(1, translateX / threshold))
  const skipOpacity = Math.max(0, Math.min(1, -translateX / threshold))

  return (
    <div className="flex h-full w-full flex-col items-center md:h-auto md:max-w-[460px]">
      <div className="relative h-full w-full md:h-auto md:max-w-96">
        <CardContainer fullBleed>
          <div className="relative h-full w-full">
            {/* ドラッグ・退出アニメーション中は、次の人を背後に表示する */}
            {nextProfile && (isDragging || leaving) && (
              <div className="absolute inset-0 md:inset-x-3 md:bottom-0 md:top-2">
                <SwipeCard profile={nextProfile} />
              </div>
            )}

            <div
              className="absolute inset-0 select-none touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onTransitionEnd={handleTransitionEnd}
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
              <SwipeCard profile={profile}>
                <RecsProfileLink userId={profile.user_id} />
                {/* スワイプ中のラベル */}
                <span
                  className="pointer-events-none absolute left-5 top-5 rotate-[-12deg] rounded-lg border-4 border-swipe-accent px-4 py-1 text-2xl font-extrabold tracking-wide text-swipe-accent"
                  style={{ opacity: likeOpacity }}
                >
                  いいね！
                </span>
                <span
                  className="pointer-events-none absolute right-5 top-5 rotate-[12deg] rounded-lg border-4 border-swipe-muted-foreground px-4 py-1 text-2xl font-extrabold tracking-wide text-swipe-muted-foreground"
                  style={{ opacity: skipOpacity }}
                >
                  スキップ
                </span>
              </SwipeCard>
            </div>
          </div>
        </CardContainer>

        <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 md:-bottom-6">
          <SwipeActions
            onSkip={() => startSwipeAnimation('skip')}
            onLike={() => startSwipeAnimation('like')}
          />
        </div>
      </div>
    </div>
  )
}
