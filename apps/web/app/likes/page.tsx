'use client'

import { useRef, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { LikeSwipeCard } from '@/components/like-swipe-card'
import { receivedLikes } from '@/lib/likes'
import { ChevronLeft, ChevronRight, Undo2, ThumbsUp } from 'lucide-react'

type Direction = 'like' | 'skip'

export default function LikesPage() {
  const [index, setIndex] = useState(0)
  // 現在のカードのスワイプ関数を保持（外側の矢印・ボタンから呼ぶ）
  const arrowAction = useRef<((dir: Direction) => void) | null>(null)

  const current = receivedLikes[index]
  const done = index >= receivedLikes.length

  function handleDecision() {
    setIndex((i) => i + 1)
  }

  function trigger(dir: Direction) {
    arrowAction.current?.(dir)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active="イイネ" />

      <main className="flex flex-1 flex-col px-6 py-8 lg:px-12">
        <header className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            いいね！
          </h1>
          <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            スキップ一覧
            <ChevronRight className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
          {done ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                <ThumbsUp className="h-7 w-7 text-primary" />
              </div>
              <p className="font-heading text-xl font-bold text-foreground">
                すべて確認しました
              </p>
              <p className="text-sm text-muted-foreground">
                新しいいいね！が届くとここに表示されます
              </p>
            </div>
          ) : (
            <>
              {/* カード＋外側の矢印 */}
              <div className="flex items-center gap-4 sm:gap-8">
                <button
                  aria-label="スキップ"
                  onClick={() => trigger('skip')}
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground shadow-md ring-1 ring-border transition hover:bg-muted sm:flex"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <div className="w-[380px] max-w-[78vw] shrink-0">
                  <LikeSwipeCard
                    key={current.id}
                    profile={current}
                    onDecision={handleDecision}
                    registerArrowAction={(fn) => (arrowAction.current = fn)}
                  />
                </div>

                <button
                  aria-label="いいね！"
                  onClick={() => trigger('like')}
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-md ring-1 ring-border transition hover:bg-muted sm:flex"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              {/* 下部アクションボタン */}
              <div className="flex items-center gap-6">
                <button
                  aria-label="スキップ"
                  onClick={() => trigger('skip')}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-muted-foreground shadow-lg ring-1 ring-border transition hover:scale-105 hover:text-foreground"
                >
                  <Undo2 className="h-7 w-7" />
                </button>
                <button
                  aria-label="いいね！を送る"
                  onClick={() => trigger('like')}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105"
                >
                  <ThumbsUp className="h-7 w-7" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground">
                残り {receivedLikes.length - index} 人
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
