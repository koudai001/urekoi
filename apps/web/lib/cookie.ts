// cookieの設定値
export const COOKIE_ACCESS_TOKEN = 'access_token'
export const COOKIE_REFRESH_TOKEN = 'refresh_token'

// BEのaccess_token/refresh_tokenの有効期限と合わせる(apps/api/usecases/auth_usecase.go)
const ACCESS_TOKEN_MAX_AGE = 60 * 60
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30

const COMMON_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  // ローカル開発(http://localhost)はSafariがsecure cookieを保存しないため、production buildの時だけtrueにする
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  ...COMMON_COOKIE_OPTIONS,
  maxAge: ACCESS_TOKEN_MAX_AGE,
}

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...COMMON_COOKIE_OPTIONS,
  maxAge: REFRESH_TOKEN_MAX_AGE,
}
