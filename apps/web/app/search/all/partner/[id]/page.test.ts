import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { cookies } from 'next/headers'
import { getSearchAll, getSearchAllPartnerId } from '@/generated/search/search'
import { ProfileCardGrid } from '@/components/profile/profile-card-grid'
import { ProfileDetailModal } from '@/components/profile/profile-detail-modal'
import Page from './page'

// クッキーをモック化
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/search/search', () => ({
  getSearchAll: vi.fn(),
  getSearchAllPartnerId: vi.fn(),
}))

describe('Page', () => {
  it('【一覧・詳細ともに200】ProfileCardGridとProfileDetailModal(isDirectAccess)に渡ること', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'mock_access_token' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>)

    const profiles = [
      { id: 1, nickname: '美咲', age: 42, prefecture: '東京都' },
    ]
    const profile = { id: 1, nickname: '美咲', age: 42, prefecture: '東京都' }

    vi.mocked(getSearchAll).mockResolvedValue({
      status: 200,
      data: profiles,
    } as Awaited<ReturnType<typeof getSearchAll>>)
    vi.mocked(getSearchAllPartnerId).mockResolvedValue({
      status: 200,
      data: profile,
    } as Awaited<ReturnType<typeof getSearchAllPartnerId>>)

    const element = await Page({ params: Promise.resolve({ id: '1' }) })
    const children = element.props.children as ReactElement[]

    expect(getSearchAll).toHaveBeenCalledWith({
      headers: { Authorization: 'Bearer mock_access_token' },
    })
    expect(getSearchAllPartnerId).toHaveBeenCalledWith(1, {
      headers: { Authorization: 'Bearer mock_access_token' },
    })
    expect(children[0].type).toBe(ProfileCardGrid)
    expect(children[0].props).toEqual({ profiles })
    expect(children[1].type).toBe(ProfileDetailModal)
    expect(children[1].props).toEqual({ profile, isDirectAccess: true })
  })

  it('【一覧取得失敗】ProfileCardGridには空配列が渡ること', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'mock_access_token' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>)

    vi.mocked(getSearchAll).mockResolvedValue({
      status: 404,
      data: { error: 'not found' },
    } as Awaited<ReturnType<typeof getSearchAll>>)
    vi.mocked(getSearchAllPartnerId).mockResolvedValue({
      status: 200,
      data: { id: 1, nickname: '美咲', age: 42, prefecture: '東京都' },
    } as Awaited<ReturnType<typeof getSearchAllPartnerId>>)

    const element = await Page({ params: Promise.resolve({ id: '1' }) })
    const children = element.props.children as ReactElement[]

    expect(children[0].props).toEqual({ profiles: [] })
  })

  it('【詳細取得失敗】ProfileDetailModalが描画されないこと', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'mock_access_token' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>)

    vi.mocked(getSearchAll).mockResolvedValue({
      status: 200,
      data: [],
    } as unknown as Awaited<ReturnType<typeof getSearchAll>>)
    vi.mocked(getSearchAllPartnerId).mockResolvedValue({
      status: 404,
      data: { error: 'not found' },
    } as Awaited<ReturnType<typeof getSearchAllPartnerId>>)

    const element = await Page({ params: Promise.resolve({ id: '9999' }) })
    const children = element.props.children as ReactElement[]

    expect(children[1]).toBeFalsy()
  })
})
