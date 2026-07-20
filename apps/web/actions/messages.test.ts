import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cookies } from 'next/headers'
import { postMatchesMatchIdMessages } from '@/generated/messages/messages'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'
import { sendMessage } from './messages'

// クッキーをモック化
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/messages/messages', () => ({
  postMatchesMatchIdMessages: vi.fn(),
}))

describe('sendMessage', () => {
  // 偽物の「クッキーストア」を用意
  let mockCookieStore: {
    get: ReturnType<typeof vi.fn>
  }

  // 各テストの前にモックをリセット
  beforeEach(() => {
    vi.clearAllMocks()

    mockCookieStore = {
      get: vi.fn(),
    }
    vi.mocked(cookies).mockResolvedValue(
      mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>,
    )
  })

  it('【201 成功】access_tokenをAuthorizationヘッダーに付けてリクエストし、送信したメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    const message = {
      id: 1,
      sender_user_id: 1,
      body: 'よろしく',
      created_at: '2026-01-01T00:00:00Z',
    }
    vi.mocked(postMatchesMatchIdMessages).mockResolvedValue({
      status: 201,
      data: message,
    } as Awaited<ReturnType<typeof postMatchesMatchIdMessages>>)

    const result = await sendMessage(42, 'よろしく')

    expect(postMatchesMatchIdMessages).toHaveBeenCalledWith(
      42,
      { body: 'よろしく' },
      { headers: { Authorization: 'Bearer mock_access' } },
    )
    expect(result).toEqual({ success: true, message })
  })

  it('【400 バリデーションエラー】BEのエラーメッセージをそのまま返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postMatchesMatchIdMessages).mockResolvedValue({
      status: 400,
      data: { error: 'メッセージを入力してください' },
    } as Awaited<ReturnType<typeof postMatchesMatchIdMessages>>)

    const result = await sendMessage(42, '')

    expect(result).toEqual({
      success: false,
      error: 'メッセージを入力してください',
    })
  })

  it('【403 当事者でない】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postMatchesMatchIdMessages).mockResolvedValue({
      status: 403,
      data: { error: 'not a participant of this match' },
    } as Awaited<ReturnType<typeof postMatchesMatchIdMessages>>)

    const result = await sendMessage(42, 'hi')

    expect(result).toEqual({
      success: false,
      error: 'このやりとりにはメッセージを送れません',
    })
  })

  it('【404 マッチが見つからない】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postMatchesMatchIdMessages).mockResolvedValue({
      status: 404,
      data: { error: 'match not found' },
    } as Awaited<ReturnType<typeof postMatchesMatchIdMessages>>)

    const result = await sendMessage(9999, 'hi')

    expect(result).toEqual({
      success: false,
      error: 'マッチが見つかりませんでした',
    })
  })

  it('【401 未認証】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue(undefined)
    vi.mocked(postMatchesMatchIdMessages).mockResolvedValue({
      status: 401,
      data: undefined,
    } as Awaited<ReturnType<typeof postMatchesMatchIdMessages>>)

    const result = await sendMessage(42, 'hi')

    expect(postMatchesMatchIdMessages).toHaveBeenCalledWith(
      42,
      { body: 'hi' },
      { headers: { Authorization: 'Bearer ' } },
    )
    expect(result).toEqual({
      success: false,
      error: 'ログインし直してください',
    })
  })

  it('【500 サーバーエラー】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postMatchesMatchIdMessages).mockResolvedValue({
      status: 500,
      data: { error: 'internal server error' },
    } as Awaited<ReturnType<typeof postMatchesMatchIdMessages>>)

    const result = await sendMessage(42, 'hi')

    expect(result).toEqual({
      success: false,
      error: '通信エラーが発生しました。もう一度お試しください',
    })
  })
})
