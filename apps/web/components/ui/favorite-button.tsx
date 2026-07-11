'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FavoriteButton({
  className,
  iconClassName,
  inactiveIconClassName = 'text-white',
}: {
  className?: string
  iconClassName?: string
  inactiveIconClassName?: string
}) {
  const [faved, setFaved] = useState(false)

  return (
    <button
      aria-label="お気に入りに追加"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setFaved((v) => !v)
      }}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/25 backdrop-blur-sm transition-colors hover:bg-black/40',
        className,
      )}
    >
      <Star
        className={cn(
          'h-4 w-4 transition-colors',
          faved ? 'fill-amber-300 text-amber-300' : inactiveIconClassName,
          iconClassName,
        )}
      />
    </button>
  )
}
