import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getMatchesMatchIdMessages } from '@/generated/messages/messages'
import type { MessageResponse } from '@/generated/urekoiAPI.schemas'
import { GET } from './route'

// クッキーをモック化
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/messages/messages', () => ({
  getMatchesMatchIdMessages: vi.fn(),
}))

describe('GET /api/matches/[matchId]/messages', () => {
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

  it('【200 成功】matchIdをnumberに変換し、access_tokenを付けてBEを呼び、レスポンスをそのまま中継すること', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    const messages = [{ id: 1, sender_user_id: 1, body: 'よろしく' }]
    vi.mocked(getMatchesMatchIdMessages).mockResolvedValue({
      status: 200,
      data: messages,
    } as Awaited<ReturnType<typeof getMatchesMatchIdMessages>>)

    // httpリクエストを模擬するためにNextRequestを作成
    const request = new NextRequest('http://localhost/api/matches/5/messages')
    const res = await GET(request, {
      params: Promise.resolve({ matchId: '5' }),
      // nextjsのapprouterのparamsはPromiseでラップされている
    })

    expect(getMatchesMatchIdMessages).toHaveBeenCalledWith(
      5,
      { before_id: undefined },
      { headers: { Authorization: 'Bearer mock_access' } },
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(messages)
  })

  it('【before_idクエリあり】numberに変換してBEに渡すこと', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(getMatchesMatchIdMessages).mockResolvedValue({
      status: 200,
      data: [] as MessageResponse[],
    } as Awaited<ReturnType<typeof getMatchesMatchIdMessages>>)

    const request = new NextRequest(
      'http://localhost/api/matches/5/messages?before_id=10',
    )
    await GET(request, { params: Promise.resolve({ matchId: '5' }) })

    expect(getMatchesMatchIdMessages).toHaveBeenCalledWith(
      5,
      { before_id: 10 },
      { headers: { Authorization: 'Bearer mock_access' } },
    )
  })

  it('【401 未認証】access_tokenが無い場合も空のAuthorizationヘッダーでBEに中継し、ステータスをそのまま返すこと', async () => {
    mockCookieStore.get.mockReturnValue(undefined)
    vi.mocked(getMatchesMatchIdMessages).mockResolvedValue({
      status: 401,
      data: undefined,
    } as Awaited<ReturnType<typeof getMatchesMatchIdMessages>>)

    const request = new NextRequest('http://localhost/api/matches/5/messages')
    const res = await GET(request, {
      params: Promise.resolve({ matchId: '5' }),
    })

    expect(getMatchesMatchIdMessages).toHaveBeenCalledWith(
      5,
      { before_id: undefined },
      { headers: { Authorization: 'Bearer ' } },
    )
    expect(res.status).toBe(401)
  })

  it('【500 サーバーエラー】BEのエラーもそのまま中継すること', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(getMatchesMatchIdMessages).mockResolvedValue({
      status: 500,
      data: { error: 'internal server error' },
    } as Awaited<ReturnType<typeof getMatchesMatchIdMessages>>)

    const request = new NextRequest('http://localhost/api/matches/5/messages')
    const res = await GET(request, {
      params: Promise.resolve({ matchId: '5' }),
    })

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'internal server error' })
  })
})
