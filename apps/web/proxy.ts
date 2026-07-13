import { NextResponse, type NextRequest } from 'next/server'
import { postRefresh } from '@/generated/auth/auth'
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/cookie'

// ログイン不要でアクセスできるパス
const PUBLIC_PATHS = ['/login', '/signup']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  // ログイン済みかどうかの判定はaccess_tokenの有無で行う
  let isAuthenticated = request.cookies.has(COOKIE_ACCESS_TOKEN)
  let refreshedTokens: { accessToken: string; refreshToken: string } | null =
    null

  // access_tokenが無い(切れている)場合はrefresh_tokenで裏更新を試みる
  if (!isAuthenticated) {
    const refreshToken = request.cookies.get(COOKIE_REFRESH_TOKEN)?.value
    if (refreshToken) {
      refreshedTokens = await refresh(refreshToken)
      isAuthenticated = refreshedTokens !== null
    }
  }

  // 認証済みでない場合 x 保護されたパスへのアクセスはログインページにリダイレクト
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 認証済みかつログインページやサインアップページへのアクセスは検索ページにリダイレクト
  if (isAuthenticated && isPublicPath) {
    const response = NextResponse.redirect(new URL('/search/all', request.url))
    if (refreshedTokens) setAuthCookies(response, refreshedTokens)
    return response
  }

  // 認証済みかつ保護されたパスへのアクセスはそのまま通す
  const response = NextResponse.next()
  // アクセストークンを裏更新した場合はレスポンスにセットする
  if (refreshedTokens) setAuthCookies(response, refreshedTokens)
  return response
}

// refresh_tokenでBEの/refreshを呼び、新しいトークンを取得する。失敗時はnull
async function refresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const res = await postRefresh({ refresh_token: refreshToken })
  if (res.status !== 200) return null

  return {
    accessToken: res.data.access_token ?? '',
    refreshToken: res.data.refresh_token ?? '',
  }
}

// 裏更新したaccess_token/refresh_tokenをレスポンスのhttpOnly cookieにセットする
function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  response.cookies.set(
    COOKIE_ACCESS_TOKEN,
    tokens.accessToken,
    ACCESS_TOKEN_COOKIE_OPTIONS,
  )
  response.cookies.set(
    COOKIE_REFRESH_TOKEN,
    tokens.refreshToken,
    REFRESH_TOKEN_COOKIE_OPTIONS,
  )
}

// _next/static, _next/image、および拡張子を持つパス(public/配下の静的アセット)は除外
export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
}
