import { useQuery } from '@tanstack/react-query'
import type { PendingLikesResponse } from '@/generated/urekoiAPI.schemas'

const POLLING_INTERVAL_MS = 30000

export const PENDING_LIKES_QUERY_KEY = ['likes', 'pending'] as const

async function fetchPendingLikes(): Promise<PendingLikesResponse> {
  const response = await fetch('/api/likes/pending')
  if (!response.ok) throw new Error('いいね一覧の取得に失敗しました')
  return response.json()
}

// もらったいいね一覧をポーリングで取得する。同じキーなので複数箇所で使っても1つにまとめられる
export function useReceivedLikes(initialLikes?: PendingLikesResponse) {
  return useQuery({
    queryKey: PENDING_LIKES_QUERY_KEY,
    queryFn: fetchPendingLikes,
    initialData: initialLikes,
    staleTime: POLLING_INTERVAL_MS,
    refetchInterval: POLLING_INTERVAL_MS,
  })
}
