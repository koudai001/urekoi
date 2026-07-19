import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getMatchesMatchIdMessages } from '@/generated/messages/messages'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// クライアント(SWR)がhttpOnly cookieのaccess_tokenに直接アクセスできないため、
// このRoute Handlerを経由してBEにAuthorizationヘッダーを付けて中継する
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const { matchId } = await params
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const beforeId = request.nextUrl.searchParams.get('before_id')

  const res = await getMatchesMatchIdMessages(
    Number(matchId),
    { before_id: beforeId ? Number(beforeId) : undefined },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  return NextResponse.json(res.data ?? null, { status: res.status })
}
