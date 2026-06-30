import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { postLogin, postSignup } from '@/generated/auth/auth'
import { login, signup } from './auth'

// Next.js のナビゲーションをモック化
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    // Next.jsの仕様上、redirectは内部でエラーを投げるためそれを再現
    throw new Error('NEXT_REDIRECT')
  }),
}))

// クッキーをモック化
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Orval で自動生成された API クライアントをモック化
vi.mock('@/generated/auth/auth', () => ({
  postLogin: vi.fn(),
  postSignup: vi.fn(),
}))

describe('Auth Server Actions', () => {
  let mockCookieStore: { set: ReturnType<typeof vi.fn> }

  // 各テストの前にモックをリセット
  beforeEach(() => {
    vi.clearAllMocks()

    // ダミーのクッキーストアを用意
    mockCookieStore = {
      set: vi.fn(),
    }
    vi.mocked(cookies).mockResolvedValue(
      mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>, // 型を合わせるために unknown を経由
    )
  })

  // login アクションのテスト
  describe('login', () => {
    it('【200 成功】クッキーがセットされ、トップページにリダイレクトすること', async () => {
      // Go バックエンドの成功レスポンスをシミュレート
      vi.mocked(postLogin).mockResolvedValue({
        status: 200,
        data: { access_token: 'mock_access', refresh_token: 'mock_refresh' },
      } as Awaited<ReturnType<typeof postLogin>>)

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      // redirect がエラーを投げるため、rejects で検証する
      await expect(login(null, formData)).rejects.toThrow('NEXT_REDIRECT')

      // クッキーが正しい設定で保存されたか検証
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'access_token',
        'mock_access',
        expect.objectContaining({
          // クッキーのオプションの一部を検証
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60, // 1時間
        }),
      )
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'refresh_token',
        'mock_refresh',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 30, // 30日
        }),
      )

      // リダイレクト先を確認
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('【401 エラー】認証失敗時は適切なエラーメッセージを返すこと', async () => {
      vi.mocked(postLogin).mockResolvedValue({
        status: 401,
        data: {},
      } as Awaited<ReturnType<typeof postLogin>>)

      const formData = new FormData()
      formData.append('email', 'wrong@example.com')
      formData.append('password', 'wrong_pass')

      const result = await login(null, formData)

      expect(result).toEqual({
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません',
      })
      expect(redirect).not.toHaveBeenCalled()
    })

    it('【400 エラー】BEのバリデーションエラーをそのまま返すこと', async () => {
      vi.mocked(postLogin).mockResolvedValue({
        status: 400,
        data: { error: 'メールアドレスの形式が正しくありません' },
      } as Awaited<ReturnType<typeof postLogin>>)

      const formData = new FormData()
      formData.append('email', 'not-an-email')
      formData.append('password', 'password123')

      const result = await login(null, formData)

      expect(result).toEqual({
        success: false,
        error: 'メールアドレスの形式が正しくありません',
      })
      expect(redirect).not.toHaveBeenCalled()
    })

    // BEへのリクエスト自体を送らずに弾くケース
    it('【型チェックエラー】入力値が不正な場合はAPIを呼ばずにエラーを返すこと', async () => {
      const formData = new FormData()
      // email や password を入れない

      const result = await login(null, formData)

      expect(result).toEqual({
        success: false,
        error: '入力内容を確認してください',
      })
      expect(postLogin).not.toHaveBeenCalled()
    })
  })

  // signup アクションのテスト
  describe('signup', () => {
    it('【201 成功】ユーザー登録が成功し、クッキー保存後にリダイレクトすること', async () => {
      vi.mocked(postSignup).mockResolvedValue({
        status: 201,
        data: { access_token: 'new_access', refresh_token: 'new_refresh' },
      } as Awaited<ReturnType<typeof postSignup>>)

      const formData = new FormData()
      formData.append('email', 'new@example.com')
      formData.append('password', 'password123')

      await expect(signup(null, formData)).rejects.toThrow('NEXT_REDIRECT')

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'access_token',
        'new_access',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60, // 1時間
        }),
      )
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'refresh_token',
        'new_refresh',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 30, // 30日
        }),
      )
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('【409 エラー】既に登録済みのメールアドレスの場合、エラーを返すこと', async () => {
      vi.mocked(postSignup).mockResolvedValue({
        status: 409,
        data: {},
      } as Awaited<ReturnType<typeof postSignup>>)

      const formData = new FormData()
      formData.append('email', 'duplicate@example.com')
      formData.append('password', 'password123')

      const result = await signup(null, formData)

      expect(result).toEqual({
        success: false,
        error: 'このメールアドレスは既に登録されています',
      })
      expect(redirect).not.toHaveBeenCalled()
    })

    it('【400 エラー】BEのバリデーションエラーをそのまま返すこと', async () => {
      vi.mocked(postSignup).mockResolvedValue({
        status: 400,
        data: { error: 'パスワードは8文字以上で入力してください' },
      } as Awaited<ReturnType<typeof postSignup>>)

      const formData = new FormData()
      formData.append('email', 'new@example.com')
      formData.append('password', 'short')

      const result = await signup(null, formData)

      expect(result).toEqual({
        success: false,
        error: 'パスワードは8文字以上で入力してください',
      })
      expect(redirect).not.toHaveBeenCalled()
    })

    // ステータスコードは関係なく、BEへのリクエスト自体を送らずに弾くケース
    it('【型チェックエラー】入力値が不正な場合はAPIを呼ばずにエラーを返すこと', async () => {
      const formData = new FormData()
      // email や password を入れない

      const result = await signup(null, formData)

      expect(result).toEqual({
        success: false,
        error: '入力内容を確認してください',
      })
      expect(postSignup).not.toHaveBeenCalled()
    })
  })
})
