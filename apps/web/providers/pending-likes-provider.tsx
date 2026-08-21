'use client'

import { createContext, useContext } from 'react'
import { useReceivedLikes } from '@/hooks/use-received-likes'
import type { PendingLikesResponse } from '@/generated/urekoiAPI.schemas'

type PendingLikesContextValue = {
  pendingLikes: PendingLikesResponse
}

const PendingLikesContext = createContext<PendingLikesContextValue | null>(null)

// サーバーで取得したLike一覧をTanStack Queryへ渡し、/likes/pending配下で共有する。
export function PendingLikesProvider({
  initialLikes,
  children,
}: {
  initialLikes: PendingLikesResponse
  children: React.ReactNode
}) {
  const { data: pendingLikes = initialLikes } = useReceivedLikes(initialLikes)

  return (
    <PendingLikesContext.Provider value={{ pendingLikes }}>
      {children}
    </PendingLikesContext.Provider>
  )
}

export function usePendingLikesContext() {
  const context = useContext(PendingLikesContext)
  if (!context) {
    throw new Error(
      'usePendingLikesContext must be used within PendingLikesProvider',
    )
  }
  return context
}
