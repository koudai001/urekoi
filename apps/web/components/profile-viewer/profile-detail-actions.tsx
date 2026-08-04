'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, X } from 'lucide-react'
import { toast } from 'sonner'
import { sendLike } from '@/actions/likes'
import { sendSkip } from '@/actions/skips'
import { showLikeToast } from '@/components/likes/like-toast'
import { showMatchToast } from '@/components/likes/match-toast'

// 詳細画面の下部に重ねる、スワイプと同じ意思決定用アクション
export function ProfileDetailActions({
  userId,
  nickname,
  age,
  returnHref,
}: {
  userId: number
  nickname: string
  age: number
  returnHref: string
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleAction = async (action: 'like' | 'skip') => {
    if (isPending) return
    setIsPending(true)

    if (action === 'like') {
      const result = await sendLike(userId)
      if (!result.success) {
        toast.error(result.error)
        setIsPending(false)
        return
      }
      if (result.matched) showMatchToast(nickname, age)
      else showLikeToast(nickname)
    } else {
      const result = await sendSkip(userId)
      if (!result.success) {
        toast.error(result.error)
        setIsPending(false)
        return
      }
    }

    router.replace(returnHref)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-swipe-background via-swipe-background/85 to-transparent px-6 pb-6 pt-14">
      <div className="pointer-events-auto flex items-center gap-5">
        <button
          type="button"
          aria-label="スキップ"
          disabled={isPending}
          onClick={() => handleAction('skip')}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-swipe-surface text-swipe-foreground shadow-xl ring-1 ring-swipe-border transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X className="h-7 w-7" />
        </button>
        <button
          type="button"
          aria-label="いいね！を送る"
          disabled={isPending}
          onClick={() => handleAction('like')}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-swipe-accent to-primary text-swipe-foreground shadow-xl transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Heart className="h-7 w-7" />
        </button>
      </div>
    </div>
  )
}
