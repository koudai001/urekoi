import useSWR from 'swr'
import type { MatchProfile } from '@/generated/urekoiAPI.schemas'

// マッチングをどれくらいの間隔で反映するか
const POLLING_INTERVAL_MS = 15000

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('マッチング一覧の取得に失敗しました')
    return res.json() as Promise<MatchProfile[]>
  })

// マッチング済みの相手一覧をポーリングで取得する
export function useMatchProfiles() {
  return useSWR<MatchProfile[]>('/api/matches', fetcher, {
    refreshInterval: POLLING_INTERVAL_MS,
  })
}
