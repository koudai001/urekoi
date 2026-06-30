import { NextResponse, type NextRequest } from 'next/server'
import { postRefresh } from '@/generated/auth/auth'
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/auth'

// ログイン不要でアクセスできるパス
const PUBLIC_PATHS = ['/login', '/signup']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  // ログイン済みかどうかの判定はaccess_tokenの有無で行う
  let isAuthenticated = request.cookies.has('access_token')
  let refreshedTokens: { accessToken: string; refreshToken: string } | null =
    null

  // access_tokenが無い(切れている)場合はrefresh_tokenで裏更新を試みる
  if (!isAuthenticated) {
    const refreshToken = request.cookies.get('refresh_token')?.value
    if (refreshToken) {
      refreshedTokens = await refresh(refreshToken)
      isAuthenticated = refreshedTokens !== null
    }
  }

  // 認証済みでない場合 x 保護されたパスへのアクセスはログインページにリダイレクト
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 認証済みかつログインページやサインアップページへのアクセスはトップページにリダイレクト
  if (isAuthenticated && isPublicPath) {
    const response = NextResponse.redirect(new URL('/', request.url))
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
    'access_token',
    tokens.accessToken,
    ACCESS_TOKEN_COOKIE_OPTIONS,
  )
  response.cookies.set(
    'refresh_token',
    tokens.refreshToken,
    REFRESH_TOKEN_COOKIE_OPTIONS,
  )
}

// _next/static, _next/image, favicon.icoなどの静的アセットは除外
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
