import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { postWsTicket } from '@/generated/websocket/websocket'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// クライアント(WebSocket接続)がhttpOnly cookieのaccess_tokenに直接アクセスできないため、
// このRoute Handlerを経由してBEにAuthorizationヘッダーを付けて中継する
export async function POST() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await postWsTicket({
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return NextResponse.json(res.data ?? null, { status: res.status })
}
