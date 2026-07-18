'use server'

import { cookies } from 'next/headers'
import { postLikes } from '@/generated/likes/likes'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

export type SendLikeResult =
  { success: true; matched: boolean } | { success: false; error: string }

// to_user_idにいいねを送る
export async function sendLike(toUserId: number): Promise<SendLikeResult> {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await postLikes(
    { to_user_id: toUserId },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  // 全ケース網羅
  switch (res.status) {
    case 201:
      return { success: true, matched: res.data.matched ?? false }
    case 400:
      return { success: false, error: '自分自身にはいいねできません' }
    case 404:
      return { success: false, error: 'お相手が見つかりませんでした' }
    case 409:
      return { success: false, error: 'すでにいいねを送っています' }
    case 401:
      return { success: false, error: 'ログインし直してください' }
    case 500:
      return {
        success: false,
        error: '通信エラーが発生しました。もう一度お試しください',
      }
    default: {
      const _exhaustive: never = res
      return _exhaustive
    }
  }
}
