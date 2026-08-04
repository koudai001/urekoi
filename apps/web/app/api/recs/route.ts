import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPartnerRecs } from '@/generated/partner/partner'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// TanStack Queryから候補を再取得するため、httpOnly cookie付きでBEへ中継する
export async function GET() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const res = await getPartnerRecs({
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return NextResponse.json(res.data ?? null, { status: res.status })
}
