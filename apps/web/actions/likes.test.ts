import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cookies } from 'next/headers'
import { postLikes } from '@/generated/likes/likes'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'
import { sendLike } from './likes'

// クッキーをモック化
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/likes/likes', () => ({
  postLikes: vi.fn(),
}))

describe('sendLike', () => {
  // 偽物の「クッキーストア」を用意
  let mockCookieStore: {
    get: ReturnType<typeof vi.fn>
  }

  // 各テストの前にモックをリセット
  beforeEach(() => {
    vi.clearAllMocks()

    mockCookieStore = {
      get: vi.fn(), // getメソッドも偽物の関数にしておく
    }
    // cookies() が実行されたら、上の入れ物を「Promise」で包んで返すように設定する
    vi.mocked(cookies).mockResolvedValue(
      mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>, // 型を合わせるために unknown を経由
    )
  })

  it('【201 成功】access_tokenをAuthorizationヘッダーに付けてリクエストし、successを返すこと', async () => {
    // cookies().get('...') をした時に { value: 'mock_access' } が返るように設定
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    // postLikes() が実行されたら、ステータスコード 201 を返すように設定
    vi.mocked(postLikes).mockResolvedValue({
      status: 201,
      data: undefined,
    } as Awaited<ReturnType<typeof postLikes>>)

    // sendLike() を実行
    const result = await sendLike(42)

    // postLikes() が正しい引数で呼ばれたかを検証
    expect(postLikes).toHaveBeenCalledWith(
      { to_user_id: 42 },
      { headers: { Authorization: 'Bearer mock_access' } },
    )
    // sendLike() の戻り値が { success: true } であることを検証
    expect(result).toEqual({ success: true })
  })

  it('【400 自分自身へのいいね】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postLikes).mockResolvedValue({
      status: 400,
      data: { error: 'cannot like yourself' },
    } as Awaited<ReturnType<typeof postLikes>>)

    const result = await sendLike(42)

    expect(result).toEqual({
      success: false,
      error: '自分自身にはいいねできません',
    })
  })

  it('【404 相手が見つからない】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postLikes).mockResolvedValue({
      status: 404,
      data: { error: 'user not found' },
    } as Awaited<ReturnType<typeof postLikes>>)

    const result = await sendLike(9999)

    expect(result).toEqual({
      success: false,
      error: 'お相手が見つかりませんでした',
    })
  })

  it('【409 重複いいね】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postLikes).mockResolvedValue({
      status: 409,
      data: { error: 'already liked' },
    } as Awaited<ReturnType<typeof postLikes>>)

    const result = await sendLike(42)

    expect(result).toEqual({
      success: false,
      error: 'すでにいいねを送っています',
    })
  })

  it('【401 未認証】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue(undefined)
    vi.mocked(postLikes).mockResolvedValue({
      status: 401,
      data: undefined,
    } as Awaited<ReturnType<typeof postLikes>>)

    const result = await sendLike(42)

    expect(postLikes).toHaveBeenCalledWith(
      { to_user_id: 42 },
      { headers: { Authorization: 'Bearer ' } },
    )
    expect(result).toEqual({
      success: false,
      error: 'ログインし直してください',
    })
  })

  it('【500 サーバーエラー】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postLikes).mockResolvedValue({
      status: 500,
      data: { error: 'internal server error' },
    } as Awaited<ReturnType<typeof postLikes>>)

    const result = await sendLike(42)

    expect(result).toEqual({
      success: false,
      error: '通信エラーが発生しました。もう一度お試しください',
    })
  })
})
