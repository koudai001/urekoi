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

// ユーザー詳細を一覧・詳細など複数画面から同じキーで参照する
export function userProfileQueryKey(userId: number) {
  return ['partner', 'profile', userId] as const
}

// おすすめ・新着ごとに検索候補を取得し、キャッシュするカスタムフック
export function useSearchProfiles({
  feed,
  initialPage,
}: {
  feed: SearchFeed
  initialPage: PartnerSearchResponse
}) {
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
    initialData: {
      pages: [initialPage],
      pageParams: [undefined],
    },
  })

  // １つの配列に結合
  const profiles = useMemo(
    () => query.data.pages.flatMap((page) => page.profiles),
    [query.data.pages],
  )

  // 一覧レスポンスに含まれる詳細情報を、ユーザー単位の共通キャッシュにも登録する
  useEffect(() => {
    for (const profile of profiles) {
      queryClient.setQueryData(userProfileQueryKey(profile.user_id), profile)
    }
  }, [profiles, queryClient])

  // useInfiniteQueryが返す状態と、結合済みの一覧を返す
  return { ...query, profiles }
}

// 詳細を取得するカスタムフック。キャッシュを優先し、未取得の場合だけAPIリクエストを発行する
export function useSearchProfile(userId: number) {
  return useQuery({
    queryKey: userProfileQueryKey(userId),
    queryFn: () => fetchSearchProfile(userId),
    // 一覧キャッシュが存在する場合は詳細画面で再取得しない
    staleTime: Infinity,
  })
}

// BFF経由で候補を取得
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
async function fetchSearchProfile(userId: number): Promise<ProfileDetail> {
  const response = await fetch(`/api/search/${userId}`)
  if (!response.ok) throw new Error('相手プロフィールの取得に失敗しました')
  return response.json()
}
