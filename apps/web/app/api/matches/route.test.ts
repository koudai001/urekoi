import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cookies } from 'next/headers'
import { getMatches } from '@/generated/matches/matches'
import { GET } from './route'

// クッキーをモック化
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/matches/matches', () => ({
  getMatches: vi.fn(),
}))

describe('GET /api/matches', () => {
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

  it('【200 成功】access_tokenをAuthorizationヘッダーに付けてBEを呼び、レスポンスをそのまま中継すること', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    const matches = [{ user_id: 1, nickname: '美咲' }]
    vi.mocked(getMatches).mockResolvedValue({
      status: 200,
      data: matches,
    } as Awaited<ReturnType<typeof getMatches>>)

    const res = await GET()

    expect(getMatches).toHaveBeenCalledWith({
      headers: { Authorization: 'Bearer mock_access' },
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(matches)
  })

  it('【401 未認証】access_tokenが無い場合も空のAuthorizationヘッダーでBEに中継し、ステータスをそのまま返すこと', async () => {
    mockCookieStore.get.mockReturnValue(undefined)
    vi.mocked(getMatches).mockResolvedValue({
      status: 401,
      data: undefined,
    } as Awaited<ReturnType<typeof getMatches>>)

    const res = await GET()

    expect(getMatches).toHaveBeenCalledWith({
      headers: { Authorization: 'Bearer ' },
    })
    expect(res.status).toBe(401)
  })

  it('【500 サーバーエラー】BEのエラーもそのまま中継すること', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(getMatches).mockResolvedValue({
      status: 500,
      data: { error: 'internal server error' },
    } as Awaited<ReturnType<typeof getMatches>>)

    const res = await GET()

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'internal server error' })
  })
})
