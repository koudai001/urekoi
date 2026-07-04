'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { postLogin, postLogout, postSignup } from '@/generated/auth/auth'
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/cookie'

export type SignupResult = { success: false; error: string } // 成功時はredirect('/search/all')するので返却されない

export type LoginResult = { success: false; error: string } // 成功時はredirect('/search/all')するので返却されない

export async function signup(
  _prevState: SignupResult | null,
  formData: FormData,
): Promise<SignupResult> {
  const email = formData.get('email')
  const password = formData.get('password')

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { success: false, error: '入力内容を確認してください' }
  }

  const res = await postSignup({ email, password })

  // 全ケース網羅
  switch (res.status) {
    case 201: {
      await setAuthCookies(
        res.data.access_token ?? '',
        res.data.refresh_token ?? '',
      )
      redirect('/search/all')
    }
    case 409:
      return {
        success: false,
        error: 'このメールアドレスは既に登録されています',
      }
    case 400:
      return {
        success: false,
        error: res.data.error ?? '入力内容を確認してください',
      }
    default: {
      const _exhaustive: never = res
      return _exhaustive
    }
  }
}

export async function login(
  _prevState: LoginResult | null,
  formData: FormData,
): Promise<LoginResult> {
  const email = formData.get('email')
  const password = formData.get('password')

  // 型チェックのみ
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { success: false, error: '入力内容を確認してください' }
  }

  const res = await postLogin({ email, password })

  // 全ケース網羅
  switch (res.status) {
    case 200: {
      await setAuthCookies(
        res.data.access_token ?? '',
        res.data.refresh_token ?? '',
      )
      redirect('/search/all')
    }
    case 401:
      return {
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません',
      }
    case 400:
      return {
        success: false,
        error: res.data.error ?? '入力内容を確認してください',
      }
    default: {
      const _exhaustive: never = res
      return _exhaustive
    }
  }
}

// クッキーの削除とログアウトAPIの呼び出し・ログインページへのリダイレクトを行う
export async function logout() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value ?? ''

  if (refreshToken) {
    await postLogout({ refresh_token: refreshToken })
  }

  cookieStore.delete(COOKIE_ACCESS_TOKEN)
  cookieStore.delete(COOKIE_REFRESH_TOKEN)
  redirect('/login')
}

// access_token/refresh_tokenをhttpOnlycookieにセットする
async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_ACCESS_TOKEN, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
  cookieStore.set(
    COOKIE_REFRESH_TOKEN,
    refreshToken,
    REFRESH_TOKEN_COOKIE_OPTIONS,
  )
}
