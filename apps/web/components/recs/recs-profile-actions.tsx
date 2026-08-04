'use client'

import { useRouter } from 'next/navigation'
import { SwipeActions } from './swipe-actions'
import { useRecsContext } from '@/providers/recs-provider'

// Recs詳細画面の下部に重ねる、スワイプと同じ意思決定用アクション
export function RecsProfileActions({
  userId,
  returnHref,
}: {
  userId: number
  returnHref: string
}) {
  const router = useRouter()
  const { current, requestSwipe } = useRecsContext()

  // 一覧カードから開いた詳細だけ、デッキへスワイプを依頼できる
  if (current?.user_id !== userId) return null

  const handleAction = (direction: 'like' | 'skip') => {
    requestSwipe({ userId, direction })
    if (window.history.length > 1) router.back()
    else router.replace(returnHref)
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-swipe-background via-swipe-background/85 to-transparent px-6 pb-6 pt-14">
      <SwipeActions
        onSkip={() => handleAction('skip')}
        onLike={() => handleAction('like')}
      />
    </div>
  )
}
