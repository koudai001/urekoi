import { describe, expect, it, vi } from 'vitest'
import { cookies } from 'next/headers'
import { getSearchAllPartnerUserId } from '@/generated/search/search'
import Modal from './page'

// クッキーをモック化
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/search/search', () => ({
  getSearchAllPartnerUserId: vi.fn(),
}))

describe('Modal', () => {
  it('【200 成功】APIのレスポンスがそのままprofileとして渡ること', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'mock_access_token' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>)

    const profile = {
      user_id: 1,
      nickname: '美咲',
      age: 42,
      prefecture: '東京都',
    }
    vi.mocked(getSearchAllPartnerUserId).mockResolvedValue({
      status: 200,
      data: profile,
    } as Awaited<ReturnType<typeof getSearchAllPartnerUserId>>)

    const element = await Modal({ params: Promise.resolve({ id: '1' }) })

    expect(getSearchAllPartnerUserId).toHaveBeenCalledWith(1, {
      headers: { Authorization: 'Bearer mock_access_token' },
    })
    expect(element?.props).toEqual({ profile })
  })

  it('【200以外】nullを返すこと', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'mock_access_token' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>)

    vi.mocked(getSearchAllPartnerUserId).mockResolvedValue({
      status: 404,
      data: { error: 'not found' },
    } as Awaited<ReturnType<typeof getSearchAllPartnerUserId>>)

    const element = await Modal({ params: Promise.resolve({ id: '9999' }) })

    expect(element).toBeNull()
  })
})
