import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProfileCardGrid } from '@/components/profile/profile-card-grid'
import { getSearchAll } from '@/generated/search/search'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

// サーバーコンポーネントで検索結果を取得し、ProfileCardGridに渡す
export default async function Page() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const res = await getSearchAll({
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 401) redirect('/login')
  if (res.status === 500) throw new Error('検索結果の取得に失敗しました')

  // 404(登録ユーザー0件)は空の検索結果として扱う
  return <ProfileCardGrid profiles={res.status === 200 ? res.data : []} />
}
