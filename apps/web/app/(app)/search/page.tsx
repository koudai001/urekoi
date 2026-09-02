import { SearchProfileGrid } from '@/components/search/search-profile-grid'
import type { SearchFeed } from '@/hooks/use-search-profiles'

// URLからおすすめ・新着を判定し、クライアントの検索一覧へ渡す
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ feed?: string }>
}) {
  const { feed: feedParam } = await searchParams
  const feed: SearchFeed = feedParam === 'newest' ? 'newest' : 'recommended'

  return <SearchProfileGrid feed={feed} />
}
