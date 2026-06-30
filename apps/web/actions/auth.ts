'use server'

import { postSignup } from '@/generated/auth/auth'

export type SignupResult = { success: true } | { success: false; error: string }

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
    case 201:
      return { success: true }
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
