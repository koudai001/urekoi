'use client'

import { useEffect, useMemo } from 'react'
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  PartnerSearchResponse,
  ProfileDetail,
} from '@/generated/urekoiAPI.schemas'

export type SearchFeed = 'recommended' | 'newest'

export const SEARCH_PROFILES_QUERY_KEY = ['partner', 'search'] as const

// おすすめ・新着ごとに検索候補を取得し、キャッシュするカスタムフック
export function useSearchProfiles({ feed }: { feed: SearchFeed }) {
  const queryClient = useQueryClient()

  // ページング対応
  const query = useInfiniteQuery({
    // おすすめと新着でキャッシュを分ける
    queryKey: [...SEARCH_PROFILES_QUERY_KEY, feed],
    // APIレスポンスのnext_cursorを次回リクエストに渡す
    queryFn: ({ pageParam }) => fetchSearchProfiles(feed, pageParam),
    initialPageParam: undefined as number | undefined,
    // 最後に取得したページのnext_cursorを次回リクエストに渡す
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: SEARCH_PROFILES_STALE_TIME_MS,
  })

  // １つの配列に結合
  const profiles = useMemo(
    () => query.data?.pages.flatMap((page) => page.profiles) ?? [],
    [query.data?.pages],
  )

  // 一覧で取得したプロフィールを、詳細画面から使う個別キャッシュへ保存する
  useEffect(() => {
    queryClient.setQueryDefaults(['partner', 'profile'], {
      staleTime: Infinity,
      gcTime: PROFILE_CACHE_GC_TIME_MS,
    })

    for (const profile of profiles) {
      queryClient.setQueryData(['partner', 'profile', profile.user_id], profile)
    }
  }, [profiles, queryClient])

  // useInfiniteQueryが返す状態と、結合済みの一覧を返す
  return { ...query, profiles }
}

// 相手詳細を取得するカスタムフック。キャッシュを優先し、未取得の場合だけAPIリクエストを発行する
export function usePartnerProfile(userId: number) {
  return useQuery({
    queryKey: ['partner', 'profile', userId],
    queryFn: () => fetchPartnerProfile(userId),
    // 一覧から保存した個別キャッシュを再取得せずに使い続ける
    staleTime: Infinity,
    gcTime: PROFILE_CACHE_GC_TIME_MS,
  })
}

// APIから候補を取得
async function fetchSearchProfiles(
  feed: SearchFeed,
  cursor?: number,
): Promise<PartnerSearchResponse> {
  const params = new URLSearchParams()
  if (feed === 'newest') params.set('sort', 'newest')
  if (cursor != null) params.set('cursor', String(cursor))

  const query = params.toString()
  const response = await fetch(`/api/search${query ? `?${query}` : ''}`)
  if (!response.ok) throw new Error('検索候補の取得に失敗しました')
  return response.json()
}

// 直接アクセスやリロード時のフォールバックとして相手のプロフィールを取得する
async function fetchPartnerProfile(userId: number): Promise<ProfileDetail> {
  const response = await fetch(`/api/search/${userId}`)
  if (!response.ok) throw new Error('相手プロフィールの取得に失敗しました')
  return response.json()
}

const PROFILE_CACHE_GC_TIME_MS = 30 * 60 * 1000
const SEARCH_PROFILES_STALE_TIME_MS = 5 * 60 * 1000
