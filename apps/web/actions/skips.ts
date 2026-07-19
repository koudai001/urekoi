'use server'

import { cookies } from 'next/headers'
import { postSkips } from '@/generated/skips/skips'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

export type SendSkipResult =
  { success: true } | { success: false; error: string }

// to_user_idをスキップする
export async function sendSkip(toUserId: number): Promise<SendSkipResult> {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await postSkips(
    { to_user_id: toUserId },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  // 全ケース網羅
  switch (res.status) {
    case 201:
      return { success: true }
    case 400:
      return { success: false, error: '自分自身はスキップできません' }
    case 404:
      return { success: false, error: 'お相手が見つかりませんでした' }
    case 409:
      return { success: false, error: 'すでにスキップ済みです' }
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
