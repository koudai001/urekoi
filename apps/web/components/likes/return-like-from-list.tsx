'use client'

import { LikeButton } from '@/components/likes/like-button'
import { useReturnLike } from '@/hooks/use-return-like'

// いいね一覧から、画面遷移せず相手へいいねを返す
export function ReturnLikeFromList({
  userId,
  nickname,
  age,
}: {
  userId: number
  nickname: string
  age: number
}) {
  const { returnLike, isPending } = useReturnLike({ userId, nickname, age })

  return (
    <LikeButton
      label="ありがとう"
      isPending={isPending}
      onClick={() => returnLike()}
      className="h-11 w-full min-w-0 rounded-lg py-0 text-base shadow-none hover:scale-100 hover:opacity-90"
    />
  )
}
