import { notFound } from 'next/navigation'
import { SearchProfileDetail } from '@/components/search/search-profile-detail'

// 直リンク時はユーザーIDを検証し、キャッシュ対応の検索プロフィール詳細へ渡す
export default async function SearchProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId: userIdParam } = await params
  const userId = Number(userIdParam)
  if (!Number.isSafeInteger(userId) || userId <= 0) notFound()

  return <SearchProfileDetail userId={userId} />
}
