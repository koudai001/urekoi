'use server' //いる？

type SignupResult = { success: true } | { success: false; error: string }

export async function signup(formData: FormData): Promise<SignupResult> {
  const email = formData.get('email')
  const password = formData.get('password')

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { success: false, error: '入力内容を確認してください' }
  }

  const res = await fetch(`${process.env.API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (res.ok) {
    return { success: true }
  }

  if (res.status === 409) {
    return { success: false, error: 'このメールアドレスは既に登録されています' }
  }

  const body = await res.json().catch(() => null) //パースに失敗した場合はnullを返す
  return { success: false, error: body?.error ?? '入力内容を確認してください' }
}
