'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  postGoogleLogin,
  postLogin,
  postLogout,
  postSignup,
} from '@/generated/auth/auth'
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  COOKIE_ACCESS_TOKEN,
  COOKIE_HAS_PROFILE,
  COOKIE_REFRESH_TOKEN,
  HAS_PROFILE_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/cookie'

export type SignupResult =
  | { success: true } // 成功後はプロフィール入力ステップへ進むので、呼び出し側がstateを見て遷移する
  | { success: false; error: string }

export type LoginResult = { success: false; error: string } // 成功時はhasProfileに応じてredirectするので返却されない

export async function signup(
  _prevState: SignupResult | null,
  formData: FormData,
): Promise<SignupResult> {
  const email = formData.get('email')
  const password = formData.get('password')

  // 型ガード
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { success: false, error: '入力内容を確認してください' }
  }

  const res = await postSignup({ email, password })

  // 全ケース網羅
  switch (res.status) {
    case 201: {
      // signup直後は必ずプロフィール未作成
      await setAuthCookies(
        res.data.access_token ?? '',
        res.data.refresh_token ?? '',
        false,
      )
      return { success: true }
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

export type GoogleLoginResult =
  // hasProfileを見て、呼び出し側が/recsか/signup/profileかを振り分ける
  { success: true; hasProfile: boolean } | { success: false; error: string }

// Google Identity Servicesが発行したid_tokenをAPIに渡し、ログイン/初回登録を行う
export async function googleLogin(idToken: string): Promise<GoogleLoginResult> {
  const res = await postGoogleLogin({ id_token: idToken })

  // 全ケース網羅
  switch (res.status) {
    case 200: {
      const hasProfile = res.data.has_profile ?? false
      await setAuthCookies(
        res.data.access_token ?? '',
        res.data.refresh_token ?? '',
        hasProfile,
      )
      return { success: true, hasProfile }
    }
    case 400:
      return {
        success: false,
        error: res.data.error ?? 'Googleログインに失敗しました',
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
      const hasProfile = res.data.has_profile ?? false
      await setAuthCookies(
        res.data.access_token ?? '',
        res.data.refresh_token ?? '',
        hasProfile,
      )
      redirect(hasProfile ? '/search' : '/signup/profile')
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

// access_token/refresh_token/has_profileをhttpOnlycookieにセットする
async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  hasProfile: boolean,
) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_ACCESS_TOKEN, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
  cookieStore.set(
    COOKIE_REFRESH_TOKEN,
    refreshToken,
    REFRESH_TOKEN_COOKIE_OPTIONS,
  )
  cookieStore.set(
    COOKIE_HAS_PROFILE,
    String(hasProfile),
    HAS_PROFILE_COOKIE_OPTIONS,
  )
}
