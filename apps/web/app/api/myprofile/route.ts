import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getMyprofile } from '@/generated/myprofile/myprofile'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// クライアント(SWR)がhttpOnly cookieのaccess_tokenに直接アクセスできないため、
// このRoute Handlerを経由してBEにAuthorizationヘッダーを付けて中継する
export async function GET() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await getMyprofile({
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  // 401/404はBEがボディ無しで返す場合があるため、undefinedのままだとJSONにシリアライズできない
  return NextResponse.json(res.data ?? null, { status: res.status })
}
