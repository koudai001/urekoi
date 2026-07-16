'use client'

import { useState, useTransition } from 'react'
import { ThumbsUp } from 'lucide-react'
import { sendLike } from '@/actions/likes'
import { cn } from '@/lib/utils'

export function LikeButton({
  toUserId,
  alreadyLiked,
}: {
  toUserId: number
  alreadyLiked: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [liked, setLiked] = useState(alreadyLiked)
  const [error, setError] = useState('')

  const onClick = () => {
    startTransition(async () => {
      const result = await sendLike(toUserId)
      if (result.success) {
        setLiked(true)
        setError('')
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label="いいね"
        disabled={isPending || liked}
        onClick={onClick}
        className={cn(
          'flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60',
          liked
            ? 'bg-muted text-muted-foreground'
            : 'bg-primary text-primary-foreground',
        )}
      >
        <ThumbsUp className="h-6 w-6" />
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
