import { describe, expect, it, vi } from 'vitest'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSearchAll } from '@/generated/search/search'
import Page from './page'

// クッキーをモック化
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Next.jsのredirectは内部でエラーを投げるためそれを再現
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/search/search', () => ({
  getSearchAll: vi.fn(),
}))

describe('Page', () => {
  it('【200 成功】APIのレスポンスがそのままprofilesとして渡ること', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'mock_access_token' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>)

    const profiles = [
      { user_id: 1, nickname: '美咲', age: 42, prefecture: '東京都' },
    ]
    vi.mocked(getSearchAll).mockResolvedValue({
      status: 200,
      data: profiles,
    } as Awaited<ReturnType<typeof getSearchAll>>)

    const element = await Page()

    expect(getSearchAll).toHaveBeenCalledWith({
      headers: { Authorization: 'Bearer mock_access_token' },
    })
    expect(element.props).toEqual({ profiles })
  })

  it('【401 エラー】セッション切れはログインページにリダイレクトされること', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as Awaited<ReturnType<typeof cookies>>)

    vi.mocked(getSearchAll).mockResolvedValue({
      status: 401,
      data: undefined,
    } as unknown as Awaited<ReturnType<typeof getSearchAll>>)

    await expect(Page()).rejects.toThrow('NEXT_REDIRECT')

    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('【404 エラー】登録ユーザー0件として空のprofilesが渡ること', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'mock_access_token' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>)

    vi.mocked(getSearchAll).mockResolvedValue({
      status: 404,
      data: { error: 'not found' },
    } as Awaited<ReturnType<typeof getSearchAll>>)

    const element = await Page()

    expect(element.props).toEqual({ profiles: [] })
  })

  it('【500 エラー】エラーがthrowされること', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'mock_access_token' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>)

    vi.mocked(getSearchAll).mockResolvedValue({
      status: 500,
      data: { error: 'internal server error' },
    } as Awaited<ReturnType<typeof getSearchAll>>)

    await expect(Page()).rejects.toThrow('検索結果の取得に失敗しました')
  })
})
