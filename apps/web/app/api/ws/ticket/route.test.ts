import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cookies } from 'next/headers'
import { postWsTicket } from '@/generated/websocket/websocket'
import { POST } from './route'

// クッキーをモック化
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/websocket/websocket', () => ({
  postWsTicket: vi.fn(),
}))

describe('POST /api/ws/ticket', () => {
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

  it('【201 成功】access_tokenを付けてBEを呼び、ticketをそのまま中継すること', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postWsTicket).mockResolvedValue({
      status: 201,
      data: { ticket: 'mock_ticket' },
    } as Awaited<ReturnType<typeof postWsTicket>>)

    const res = await POST()

    expect(postWsTicket).toHaveBeenCalledWith({
      headers: { Authorization: 'Bearer mock_access' },
    })
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ ticket: 'mock_ticket' })
  })

  it('【401 未認証】access_tokenが無い場合も空のAuthorizationヘッダーでBEに中継し、ステータスをそのまま返すこと', async () => {
    mockCookieStore.get.mockReturnValue(undefined)
    vi.mocked(postWsTicket).mockResolvedValue({
      status: 401,
      data: undefined,
    } as Awaited<ReturnType<typeof postWsTicket>>)

    const res = await POST()

    expect(postWsTicket).toHaveBeenCalledWith({
      headers: { Authorization: 'Bearer ' },
    })
    expect(res.status).toBe(401)
  })

  it('【500 サーバーエラー】BEのエラーもそのまま中継すること', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(postWsTicket).mockResolvedValue({
      status: 500,
      data: { error: 'internal server error' },
    } as Awaited<ReturnType<typeof postWsTicket>>)

    const res = await POST()

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'internal server error' })
  })
})
