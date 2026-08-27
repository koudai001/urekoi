'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { sendLike } from '@/actions/likes'
import { showLikeToast } from '@/components/likes/like-toast'
import { showMatchToast } from '@/components/likes/match-toast'

// 検索詳細から相手へいいねを送り、その場でいいね済み状態へ切り替える
export function SearchProfileActions({
  userId,
  nickname,
  age,
  alreadyLiked = false,
}: {
  userId: number
  nickname: string
  age: number
  alreadyLiked?: boolean
}) {
  const [isPending, setIsPending] = useState(false)
  const [isLiked, setIsLiked] = useState(alreadyLiked)

  const handleLike = async () => {
    if (isPending || isLiked) return
    setIsPending(true)

    // サーバー側でいいねを送信し、失敗時は詳細画面に留まって再操作できるようにする
    const result = await sendLike(userId)
    if (!result.success) {
      toast.error(result.error)
      setIsPending(false)
      return
    }

    // マッチ成立の有無に応じた既存トーストを表示し、その場でいいね済みに切り替える
    if (result.matched) showMatchToast(nickname, age)
    else showLikeToast(nickname)
    setIsLiked(true)
    setIsPending(false)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center bg-gradient-to-t from-swipe-background via-swipe-background/90 to-transparent px-6 pb-6 pt-14">
      <button
        type="button"
        disabled={isPending || isLiked}
        onClick={handleLike}
        className="pointer-events-auto flex min-w-44 cursor-pointer items-center justify-center gap-2 rounded-full bg-swipe-accent px-8 py-4 text-lg font-bold text-swipe-foreground shadow-xl transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Heart className="size-6 fill-current" aria-hidden="true" />
        {isLiked ? 'いいね済み' : isPending ? '送信中...' : 'いいね'}
      </button>
    </div>
  )
}
