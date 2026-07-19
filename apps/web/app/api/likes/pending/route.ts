import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getLikesPending } from '@/generated/likes/likes'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// クライアント(SWR)がhttpOnly cookieのaccess_tokenに直接アクセスできないため、
// このRoute Handlerを経由してBEにAuthorizationヘッダーを付けて中継する
export async function GET() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await getLikesPending({
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  // 401はBEがボディ無しで返すため、undefinedのままだとJSONにシリアライズできない
  return NextResponse.json(res.data ?? null, { status: res.status })
}
