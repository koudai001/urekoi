'use client'

import { useState } from 'react'
import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sendLike } from '@/actions/likes'
import { LikeButton } from '@/components/likes/like-button'
import { showLikeToast } from '@/components/likes/like-toast'
import { showMatchToast } from '@/components/likes/match-toast'
import type {
  PartnerSearchResponse,
  ProfileDetail,
} from '@/generated/urekoiAPI.schemas'
import { SEARCH_PROFILES_QUERY_KEY } from '@/hooks/use-search-profiles'

// 検索詳細から相手へいいねを送り、その場でいいね済み状態へ切り替える
export function SearchProfileActions({
  userId,
  nickname,
  age,
  alreadyLiked = false,
}: {
  userId: number
  nickname: string
  age: number
  alreadyLiked?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [isLiked, setIsLiked] = useState(alreadyLiked)

  const handleLike = async () => {
    if (isPending || isLiked) return
    setIsPending(true)

    // サーバー側でいいねを送信し、失敗時は詳細画面に留まって再操作できるようにする
    const result = await sendLike(userId)
    if (!result.success) {
      toast.error(result.error)
      setIsPending(false)
      return
    }

    // マッチ成立の有無に応じた既存トーストを表示し、その場でいいね済みに切り替える
    if (result.matched) showMatchToast(nickname, age)
    else showLikeToast(nickname)

    // いいね済みの相手を検索一覧から除外し、詳細キャッシュも更新する
    updateSearchProfileCaches(queryClient, userId)
    setIsLiked(true)
    setIsPending(false)
  }

  return (
    <LikeButton
      label={isLiked ? 'いいね済み' : 'いいね'}
      isPending={isPending}
      disabled={isLiked}
      onClick={handleLike}
    />
  )
}

// 検索一覧と個別プロフィールのキャッシュを、いいね後の状態へ揃える
function updateSearchProfileCaches(queryClient: QueryClient, userId: number) {
  queryClient.setQueriesData<InfiniteData<PartnerSearchResponse>>(
    { queryKey: SEARCH_PROFILES_QUERY_KEY },
    (cache) => {
      if (!cache) return cache

      return {
        ...cache,
        pages: cache.pages.map((page) => ({
          ...page,
          profiles: page.profiles.filter(
            (profile) => profile.user_id !== userId,
          ),
        })),
      }
    },
  )

  queryClient.setQueryData<ProfileDetail>(
    ['partner', 'profile', userId],
    (profile) =>
      profile
        ? {
            ...profile,
            already_liked: true,
          }
        : profile,
  )
}
