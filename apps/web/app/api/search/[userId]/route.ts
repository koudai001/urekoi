import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPartnerByUserId } from '@/generated/partner/partner'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// 個別キャッシュがない直接アクセス時だけ、相手プロフィール詳細をBEから取得する
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId: userIdParam } = await params
  const userId = Number(userIdParam)
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: 'invalid userId' }, { status: 400 })
  }

  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const response = await getPartnerByUserId(userId, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return NextResponse.json(response.data ?? null, { status: response.status })
}
