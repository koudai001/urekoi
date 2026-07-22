'use client'

import { useState } from 'react'
import { LikeSwipeCard } from '@/components/likes/like-swipe-card'
import { LikeEmptyState } from '@/components/likes/like-empty-state'
import { useReceivedLikes } from '@/components/likes/use-received-likes'
import { showMatchToast } from '@/components/likes/match-toast'
import { showSkipToast } from '@/components/likes/skip-toast'
import { PageHeader } from '@/components/ui/page-header'
import { sendLike } from '@/actions/likes'
import { sendSkip } from '@/actions/skips'
import { ChevronRight } from 'lucide-react'

export default function LikesPage() {
  const { data, isLoading } = useReceivedLikes()
  const likes = data?.profiles ?? []

  // 現在表示中のカードのindex
  const [index, setIndex] = useState(0)
  const current = likes[index]
  const done = !isLoading && index >= likes.length

  const handleSwipe = async (dir: 'like' | 'skip') => {
    if (dir === 'like') {
      const result = await sendLike(current.user_id ?? 0)
      if (result.success && result.matched) {
        showMatchToast(current.nickname ?? '', current.age ?? 0)
      }
    } else {
      await sendSkip(current.user_id ?? 0)
      showSkipToast(current.nickname ?? '')
    }
    setIndex((i) => i + 1)
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader>
        <h1 className="text-3xl font-bold text-foreground">いいね！</h1>
        <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          スキップ一覧
          <ChevronRight className="h-4 w-4" />
        </button>
      </PageHeader>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-8 lg:px-12">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : done ? (
          <LikeEmptyState />
        ) : (
          <>
            <LikeSwipeCard
              key={current.user_id}
              profile={current}
              nextProfile={likes[index + 1]}
              onSwipe={handleSwipe}
            />

            <p className="text-sm text-muted-foreground">
              残り {likes.length - index} 人
            </p>
          </>
        )}
      </div>
    </main>
  )
}
