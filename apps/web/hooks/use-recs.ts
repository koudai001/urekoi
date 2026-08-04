'use client'

import { useQuery } from '@tanstack/react-query'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'

export const RECS_QUERY_KEY = ['partner', 'recs'] as const

async function fetchRecs(): Promise<ProfileDetail[]> {
  const response = await fetch('/api/recs')
  if (!response.ok) throw new Error('スワイプ候補の取得に失敗しました')
  return response.json()
}

// 初回はサーバー取得済みの候補を表示し、以後のキャッシュ・再取得をTanStack Queryに任せる
export function useRecs(initialProfiles: ProfileDetail[]) {
  return useQuery({
    queryKey: RECS_QUERY_KEY,
    queryFn: fetchRecs,
    initialData: initialProfiles,
  })
}
