'use client'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useState } from 'react'
import { useSWRConfig } from 'swr'
import { toast } from 'sonner'
import { sendLike } from '@/actions/likes'
import { sendSkip } from '@/actions/skips'
import { showLikeToast } from '@/components/likes/like-toast'
import { showMatchToast } from '@/components/likes/match-toast'
import { showSkipToast } from '@/components/likes/skip-toast'
import { UNMESSAGED_MATCHES_KEY } from '@/components/messages/use-match-profiles'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'
import { RECS_QUERY_KEY, useRecs } from '@/hooks/use-recs'

export type SwipeDirection = 'like' | 'skip'

export type SwipeRequest = {
  userId: number
  direction: SwipeDirection
}

export type RecsContextValue = {
  current: ProfileDetail | undefined
  next: ProfileDetail | undefined
  swipeRequest: SwipeRequest | null
  requestSwipe: (swipe: SwipeRequest) => void
  clearSwipeRequest: () => void
  submitDecision: (direction: SwipeDirection) => Promise<boolean>
}

const RecsContext = createContext<RecsContextValue | null>(null)

// 候補一覧・現在のカード・スワイプ実行を一箇所に集約する
export function RecsProvider({
  initialRecs,
  children,
}: {
  initialRecs: ProfileDetail[]
  children: React.ReactNode
}) {
  const { data: recs = [] } = useRecs(initialRecs)
  const queryClient = useQueryClient()
  const { mutate: mutateSWR } = useSWRConfig()
  const [swipeRequest, setSwipeRequest] = useState<SwipeRequest | null>(null)
  const current = recs[0]
  const next = recs[1]

  const submitDecision = async (direction: SwipeDirection) => {
    if (!current) return false

    try {
      if (direction === 'like') {
        const result = await sendLike(current.user_id ?? 0)
        if (!result.success) {
          toast.error(result.error)
          return false
        }

        if (result.matched) {
          // TODO:あとでtanstackのmutateを使うようにする
          await mutateSWR(UNMESSAGED_MATCHES_KEY)
          showMatchToast(current.nickname ?? '', current.age ?? 0)
        } else {
          showLikeToast(current.nickname ?? '')
        }
      } else {
        const result = await sendSkip(current.user_id ?? 0)
        if (!result.success) {
          toast.error(result.error)
          return false
        }
        showSkipToast(current.nickname ?? '')
      }
    } catch {
      toast.error('通信エラーが発生しました。もう一度お試しください')
      return false
    }

    // API成功時だけキャッシュから外す
    queryClient.setQueryData<ProfileDetail[]>(RECS_QUERY_KEY, (items) =>
      items?.filter((item) => item.user_id !== current.user_id),
    )
    return true
  }

  return (
    <RecsContext.Provider
      value={{
        current,
        next,
        swipeRequest,
        requestSwipe: setSwipeRequest,
        clearSwipeRequest: () => setSwipeRequest(null),
        submitDecision,
      }}
    >
      {children}
    </RecsContext.Provider>
  )
}

export function useRecsContext() {
  const context = useContext(RecsContext)
  if (!context) {
    throw new Error('useRecsContext must be used within RecsProvider')
  }
  return context
}
