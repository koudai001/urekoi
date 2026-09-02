import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PendingLikesResponse } from '@/generated/urekoiAPI.schemas'

const POLLING_INTERVAL_MS = 30000
// 使われなくなったプロフィールのキャッシュを削除するまでの時間
const PROFILE_CACHE_GC_TIME_MS = 30 * 60 * 1000

export const PENDING_LIKES_QUERY_KEY = ['likes', 'pending'] as const

// もらったいいね一覧をポーリングで取得
export function useReceivedLikes(initialLikes?: PendingLikesResponse) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: PENDING_LIKES_QUERY_KEY,
    queryFn: fetchPendingLikes,
    initialData: initialLikes,
    staleTime: POLLING_INTERVAL_MS,
    refetchInterval: POLLING_INTERVAL_MS,
  })

  // 一覧で取得したプロフィールを、詳細画面から使う個別キャッシュへ保存する
  useEffect(() => {
    if (!query.data) return

    queryClient.setQueryDefaults(['partner', 'profile'], {
      staleTime: Infinity,
      gcTime: PROFILE_CACHE_GC_TIME_MS,
    })

    for (const profile of query.data.profiles) {
      queryClient.setQueryData(['partner', 'profile', profile.user_id], profile)
    }
  }, [query.data, queryClient])

  return query
}

async function fetchPendingLikes(): Promise<PendingLikesResponse> {
  const response = await fetch('/api/likes/pending')
  if (!response.ok) throw new Error('いいね一覧の取得に失敗しました')
  return response.json()
}
