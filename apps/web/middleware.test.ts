import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { postRefresh } from '@/generated/auth/auth'
import { middleware } from './middleware'

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/auth/auth', () => ({
  postRefresh: vi.fn(),
}))

function buildRequest(path: string, cookie?: string): NextRequest {
  return new NextRequest(new URL(path, process.env.APP_URL), {
    headers: cookie ? { cookie } : undefined,
  })
}

function mockRefresh(success: boolean) {
  vi.mocked(postRefresh).mockResolvedValue(
    (success
      ? {
          status: 200,
          data: { access_token: 'new_access', refresh_token: 'new_refresh' },
        }
      : { status: 401, data: {} }) as Awaited<ReturnType<typeof postRefresh>>,
  )
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('保護パス(/)', () => {
    it('access_tokenあり → そのまま通すこと', async () => {
      const response = await middleware(buildRequest('/', 'access_token=valid'))

      expect(response.status).toBe(200)
    })

    it('access_tokenなし・refresh成功 → そのまま通し、cookieを更新すること', async () => {
      mockRefresh(true)

      const response = await middleware(
        buildRequest('/', 'refresh_token=valid'),
      )

      expect(response.status).toBe(200)
      expect(response.cookies.get('access_token')?.value).toBe('new_access')
      expect(response.cookies.get('refresh_token')?.value).toBe('new_refresh')
    })

    it('access_tokenなし・refresh失敗 → /loginにリダイレクトすること', async () => {
      mockRefresh(false)

      const response = await middleware(
        buildRequest('/', 'refresh_token=invalid'),
      )

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(
        `${process.env.APP_URL}/login`,
      )
    })

    it('トークンなし → /loginにリダイレクトすること', async () => {
      const response = await middleware(buildRequest('/'))

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(
        `${process.env.APP_URL}/login`,
      )
    })
  })

  describe('公開パス(/login)', () => {
    it('access_tokenあり → /にリダイレクトすること', async () => {
      const response = await middleware(
        buildRequest('/login', 'access_token=valid'),
      )

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(`${process.env.APP_URL}/`)
    })

    it('access_tokenなし・refresh成功 → /にリダイレクトし、cookieを更新すること', async () => {
      mockRefresh(true)

      const response = await middleware(
        buildRequest('/login', 'refresh_token=valid'),
      )

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(`${process.env.APP_URL}/`)
      expect(response.cookies.get('access_token')?.value).toBe('new_access')
      expect(response.cookies.get('refresh_token')?.value).toBe('new_refresh')
    })

    it('access_tokenなし・refresh失敗 → そのまま通し、cookieはセットしないこと', async () => {
      mockRefresh(false)

      const response = await middleware(
        buildRequest('/login', 'refresh_token=invalid'),
      )

      expect(response.status).toBe(200)
      expect(response.cookies.getAll()).toHaveLength(0)
    })

    it('access_tokenなし → そのまま通し、cookieはセットしないこと', async () => {
      const response = await middleware(buildRequest('/login'))

      expect(response.status).toBe(200)
      expect(response.cookies.getAll()).toHaveLength(0)
    })
  })

  describe('公開パス(/signup)', () => {
    it('access_tokenなし → そのまま通すこと', async () => {
      const response = await middleware(buildRequest('/signup'))

      expect(response.status).toBe(200)
    })
  })
})
