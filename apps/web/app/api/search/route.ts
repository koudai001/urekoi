import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { searchPartners } from '@/generated/partner/partner'
import type { SearchPartnersParams } from '@/generated/urekoiAPI.schemas'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// 検索条件を維持しながら、httpOnly cookie付きで相手検索APIへ中継する
export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const searchParams = request.nextUrl.searchParams
  const params: SearchPartnersParams = {
    sort: (searchParams.get('sort') ?? undefined) as
      SearchPartnersParams['sort'] | undefined,
    cursor: toOptionalNumber(searchParams.get('cursor')),
    limit: toOptionalNumber(searchParams.get('limit')),
  }

  const res = await searchPartners(params, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return NextResponse.json(res.data ?? null, { status: res.status })
}

// 未指定は送信せず、不正な数値文字列はNaNとしてバックエンドの400判定へ
function toOptionalNumber(value: string | null) {
  return value === null ? undefined : Number(value)
}
