import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getMyprofile } from '@/generated/myprofile/myprofile'
import { getTags } from '@/generated/profile/profile'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'
import { ProfileEditArea } from '@/components/myprofile/profile-edit-area'

// サーバーコンポーネントで自分のプロフィールとタグ一覧を取得し、ProfileEditAreaに渡す
export default async function ProfileEditPage() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const [profileRes, tagsRes] = await Promise.all([
    getMyprofile({ headers: { Authorization: `Bearer ${accessToken}` } }),
    getTags({ headers: { Authorization: `Bearer ${accessToken}` } }),
  ])

  if (profileRes.status === 401 || tagsRes.status === 401) redirect('/login')
  if (profileRes.status !== 200) {
    throw new Error('プロフィールの取得に失敗しました')
  }
  if (tagsRes.status !== 200) {
    throw new Error('タグ一覧の取得に失敗しました')
  }

  return (
    <main className="flex min-h-0 flex-1 justify-center md:items-center md:px-6 md:py-12">
      <ProfileEditArea profile={profileRes.data} tags={tagsRes.data} />
    </main>
  )
}
