// BEのaccess_token/refresh_tokenの有効期限と合わせる(apps/api/usecases/auth_usecase.go)
const ACCESS_TOKEN_MAX_AGE = 60 * 60
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30

const COMMON_COOKIE_OPTIONS = {
  httpOnly: true, //jsからアクセス不可（xss対策）
  sameSite: 'strict' as const, // 他サイトからのリクエストにはこのcookieを一切付けない(csrf対策)
  secure: true, // httpsでのみ送信
  path: '/', // ルートパス以下の全てのリクエストにcookieを付与
}

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  ...COMMON_COOKIE_OPTIONS,
  maxAge: ACCESS_TOKEN_MAX_AGE,
}

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...COMMON_COOKIE_OPTIONS,
  maxAge: REFRESH_TOKEN_MAX_AGE,
}
