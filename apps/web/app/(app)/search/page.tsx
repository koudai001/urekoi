import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SearchProfileGrid } from '@/components/search/search-profile-grid'
import { searchPartners } from '@/generated/partner/partner'
import type { SearchFeed } from '@/hooks/use-search-profiles'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// おすすめ・新着に応じた1ページ目をサーバーで取得し、初期表示へ渡す
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ feed?: string }>
}) {
  const { feed: feedParam } = await searchParams
  const feed: SearchFeed = feedParam === 'newest' ? 'newest' : 'recommended'

  // 初期表示の1ページ目をサーバーで取得する
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const response = await searchPartners(
    feed === 'newest' ? { sort: 'newest' } : undefined,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (response.status === 401) redirect('/login')
  if (response.status !== 200) {
    throw new Error('検索候補の取得に失敗しました')
  }

  return <SearchProfileGrid feed={feed} initialPage={response.data} />
}
