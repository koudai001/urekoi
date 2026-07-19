import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cookies } from 'next/headers'
import { postSkips } from '@/generated/skips/skips'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'
import { sendSkip } from './skips'

// クッキーをモック化
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/skips/skips', () => ({
  postSkips: vi.fn(),
}))

describe('sendSkip', () => {
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

  it('【201 成功】access_tokenをAuthorizationヘッダーに付けてリクエストし、successを返すこと', async () => {
    //   const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postSkips).mockResolvedValue({
      status: 201,
      data: undefined,
    } as Awaited<ReturnType<typeof postSkips>>)

    const result = await sendSkip(42)

    expect(postSkips).toHaveBeenCalledWith(
      { to_user_id: 42 },
      { headers: { Authorization: 'Bearer mock_access' } },
    )
    expect(result).toEqual({ success: true })
  })

  it('【400 自分自身へのスキップ】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postSkips).mockResolvedValue({
      status: 400,
      data: { error: 'cannot skip yourself' },
    } as Awaited<ReturnType<typeof postSkips>>)

    const result = await sendSkip(42)

    expect(result).toEqual({
      success: false,
      error: '自分自身はスキップできません',
    })
  })

  it('【404 相手が見つからない】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postSkips).mockResolvedValue({
      status: 404,
      data: { error: 'user not found' },
    } as Awaited<ReturnType<typeof postSkips>>)

    const result = await sendSkip(9999)

    expect(result).toEqual({
      success: false,
      error: 'お相手が見つかりませんでした',
    })
  })

  it('【409 重複スキップ】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postSkips).mockResolvedValue({
      status: 409,
      data: { error: 'already skipped' },
    } as Awaited<ReturnType<typeof postSkips>>)

    const result = await sendSkip(42)

    expect(result).toEqual({
      success: false,
      error: 'すでにスキップ済みです',
    })
  })

  it('【401 未認証】専用のエラーメッセージを返すこと', async () => {
    mockCookieStore.get.mockReturnValue(undefined)
    vi.mocked(postSkips).mockResolvedValue({
      status: 401,
      data: undefined,
    } as Awaited<ReturnType<typeof postSkips>>)

    const result = await sendSkip(42)

    expect(postSkips).toHaveBeenCalledWith(
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
    vi.mocked(postSkips).mockResolvedValue({
      status: 500,
      data: { error: 'internal server error' },
    } as Awaited<ReturnType<typeof postSkips>>)

    const result = await sendSkip(42)

    expect(result).toEqual({
      success: false,
      error: '通信エラーが発生しました。もう一度お試しください',
    })
  })
})
