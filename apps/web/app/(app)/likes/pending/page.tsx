'use client'

import { PendingLikes } from '@/components/likes/pending-likes'
import { usePendingLikesContext } from '@/providers/pending-likes-provider'

export default function PendingLikesPage() {
  const { pendingLikes } = usePendingLikesContext()

  return <PendingLikes pendingLikes={pendingLikes} />
}
