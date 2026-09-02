'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sendLike } from '@/actions/likes'
import { showLikeToast } from '@/components/likes/like-toast'
import { showMatchToast } from '@/components/likes/match-toast'
import type {
  PendingLikesResponse,
  ProfileDetail,
} from '@/generated/urekoiAPI.schemas'
import { PENDING_LIKES_QUERY_KEY } from '@/hooks/use-received-likes'

// もらったいいねへ返事をし、一覧・個別プロフィールのキャッシュを揃える
export function useReturnLike({
  userId,
  nickname,
  age,
}: {
  userId: number
  nickname: string
  age: number
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => sendLike(userId),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }

      // 返事をした相手を、もらったいいね一覧から取り除く
      queryClient.setQueryData<PendingLikesResponse>(
        PENDING_LIKES_QUERY_KEY,
        (pendingLikes) => {
          if (!pendingLikes) return pendingLikes

          return {
            ...pendingLikes,
            profiles: pendingLikes.profiles.filter(
              (profile) => profile.user_id !== userId,
            ),
            total: Math.max(0, pendingLikes.total - 1),
          }
        },
      )

      // 詳細を再表示した場合も、いいね済みの状態を使う
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

      if (result.matched) showMatchToast(nickname, age)
      else showLikeToast(nickname)
    },
    onError: () => {
      toast.error('通信エラーが発生しました。もう一度お試しください')
    },
  })

  return {
    returnLike: mutation.mutate,
    isPending: mutation.isPending,
  }
}
