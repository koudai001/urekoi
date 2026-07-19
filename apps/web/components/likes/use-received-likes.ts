import useSWR from 'swr'
import type { PendingLikesResponse } from '@/generated/urekoiAPI.schemas'

// 新着いいねをどれくらいの間隔で反映するか
const POLLING_INTERVAL_MS = 15000

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('いいね一覧の取得に失敗しました')
    return res.json() as Promise<PendingLikesResponse>
  })

// もらったいいね一覧をポーリングで取得する。同じキーなので複数箇所で使っても1つにまとめられる
export function useReceivedLikes() {
  return useSWR<PendingLikesResponse>('/api/likes/pending', fetcher, {
    refreshInterval: POLLING_INTERVAL_MS,
  })
}
