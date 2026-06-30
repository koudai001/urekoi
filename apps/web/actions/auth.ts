'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { postLogin, postSignup } from '@/generated/auth/auth'
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/auth'

export type SignupResult = { success: false; error: string } // 成功時はredirect('/')するので返却されない

export type LoginResult = { success: false; error: string } // 成功時はredirect('/')するので返却されない

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
      redirect('/')
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
      redirect('/')
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

// access_token/refresh_tokenをhttpOnlycookieにセットする
async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()
  cookieStore.set('access_token', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
  cookieStore.set('refresh_token', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
}
