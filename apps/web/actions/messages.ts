'use server'

import { cookies } from 'next/headers'
import { postMatchesMatchIdMessages } from '@/generated/messages/messages'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'
import type { MessageResponse } from '@/generated/urekoiAPI.schemas'

export type SendMessageResult =
  | { success: true; message: MessageResponse }
  | { success: false; error: string }

// matchIdの相手にメッセージを送る
export async function sendMessage(
  matchId: number,
  body: string,
): Promise<SendMessageResult> {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await postMatchesMatchIdMessages(
    matchId,
    { body },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  // 全ケース網羅
  switch (res.status) {
    case 201:
      return { success: true, message: res.data }
    case 400:
      return {
        success: false,
        error: res.data.error ?? '入力内容を確認してください',
      }
    case 403:
      return { success: false, error: 'このやりとりにはメッセージを送れません' }
    case 404:
      return { success: false, error: 'マッチが見つかりませんでした' }
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
