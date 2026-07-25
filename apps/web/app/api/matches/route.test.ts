import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { getMatches } from '@/generated/matches/matches'
import type { MatchProfile } from '@/generated/urekoiAPI.schemas'
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
    mockCookieStore.get.mockReturnValue({ value: 'mock_access' })
    vi.mocked(getMatches).mockResolvedValue({
      status: 200,
      data: [] as MatchProfile[],
    } as Awaited<ReturnType<typeof getMatches>>)
  })

  it('has_messagesクエリが無い場合、paramsを渡さずBEを呼ぶこと', async () => {
    const request = new NextRequest('http://localhost/api/matches')
    await GET(request)

    expect(getMatches).toHaveBeenCalledWith(
      {},
      { headers: { Authorization: 'Bearer mock_access' } },
    )
  })

  it('has_messages=trueをbooleanに変換してBEへ中継すること', async () => {
    const request = new NextRequest(
      'http://localhost/api/matches?has_messages=true',
    )
    await GET(request)

    expect(getMatches).toHaveBeenCalledWith(
      { has_messages: true },
      { headers: { Authorization: 'Bearer mock_access' } },
    )
  })
})
