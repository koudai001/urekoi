'use client'

import { ThumbsUp } from 'lucide-react'
import { useReceivedLikes } from './use-received-likes'

// Sidebarの「イイネ」ナビ項目(アイコン+新着件数バッジ+ラベル)
export function LikeNavItem() {
  const { data } = useReceivedLikes()
  const count = data?.length ?? 0

  return (
    <span className="flex items-center gap-3">
      <span className="relative">
        <ThumbsUp className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </span>
      イイネ
    </span>
  )
}
