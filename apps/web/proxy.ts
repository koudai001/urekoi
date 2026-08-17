import { NextResponse, type NextRequest } from 'next/server'
import { postRefresh } from '@/generated/auth/auth'
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  COOKIE_ACCESS_TOKEN,
  COOKIE_HAS_PROFILE,
  COOKIE_REFRESH_TOKEN,
  HAS_PROFILE_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/cookie'

// ログイン不要でアクセスできるパス
const PUBLIC_PATHS = ['/login', '/signup']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  // ログイン済みかどうかの判定はaccess_tokenの有無で行う
  let isAuthenticated = request.cookies.has(COOKIE_ACCESS_TOKEN)
  let authCookies: {
    accessToken: string
    refreshToken: string
    hasProfile: boolean
  } | null = null

  // access_tokenが無い(切れている)場合はrefresh_tokenで裏更新を試みる
  if (!isAuthenticated) {
    const refreshToken = request.cookies.get(COOKIE_REFRESH_TOKEN)?.value
    if (refreshToken) {
      authCookies = await refresh(refreshToken)
      isAuthenticated = authCookies !== null
    }
  }

  // 認証済みでない場合 x 保護されたパスへのアクセスはログインページにリダイレクト
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 認証済みかつログインページやサインアップページへのアクセスは、プロフィール作成済みならスワイプ画面へ、
  // 未作成ならプロフィール作成画面へリダイレクト
  if (isAuthenticated && isPublicPath) {
    const hasProfile =
      authCookies?.hasProfile ??
      request.cookies.get(COOKIE_HAS_PROFILE)?.value === 'true'
    const response = NextResponse.redirect(
      new URL(hasProfile ? '/recs' : '/signup/profile', request.url),
    )
    if (authCookies) setAuthCookies(response, authCookies)
    return response
  }

  // 認証済みかつ保護されたパスへのアクセスはそのまま通す
  const response = NextResponse.next()
  // アクセストークンを裏更新した場合はレスポンスにセットする
  if (authCookies) setAuthCookies(response, authCookies)
  return response
}

// BEのコールドスタート等で応答が遅い場合に、ミドルウェア全体が長時間ブロックされないための上限
const REFRESH_TIMEOUT_MS = 5000

// refresh_tokenでBEの/refreshを呼び、新しいトークンとプロフィール作成済みかどうかを取得する。失敗時(タイムアウト含む)はnull
async function refresh(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  hasProfile: boolean
} | null> {
  try {
    const res = await postRefresh(
      { refresh_token: refreshToken },
      { signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS) },
    )
    if (res.status !== 200) return null

    return {
      accessToken: res.data.access_token ?? '',
      refreshToken: res.data.refresh_token ?? '',
      hasProfile: res.data.has_profile ?? false,
    }
  } catch {
    return null
  }
}

// 裏更新したaccess_token/refresh_token/has_profileをレスポンスのhttpOnly cookieにセットする
function setAuthCookies(
  response: NextResponse,
  authCookies: {
    accessToken: string
    refreshToken: string
    hasProfile: boolean
  },
) {
  response.cookies.set(
    COOKIE_ACCESS_TOKEN,
    authCookies.accessToken,
    ACCESS_TOKEN_COOKIE_OPTIONS,
  )
  response.cookies.set(
    COOKIE_REFRESH_TOKEN,
    authCookies.refreshToken,
    REFRESH_TOKEN_COOKIE_OPTIONS,
  )
  response.cookies.set(
    COOKIE_HAS_PROFILE,
    String(authCookies.hasProfile),
    HAS_PROFILE_COOKIE_OPTIONS,
  )
}

// _next/static, _next/image、および拡張子を持つパス(public/配下の静的アセット)は除外
export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
}
