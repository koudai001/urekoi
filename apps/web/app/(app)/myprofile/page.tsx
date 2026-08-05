import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getMyprofile } from '@/generated/myprofile/myprofile'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'
import { CardContainer } from '@/components/ui/card-container'
import { ProfileViewer } from '@/components/myprofile/profile-viewer'

// サーバーコンポーネントで自分のプロフィールを取得し、閲覧専用のProfileViewerを表示する
export default async function ProfilePage() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const profileRes = await getMyprofile({
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (profileRes.status === 401) redirect('/login')
  if (profileRes.status !== 200) {
    throw new Error('プロフィールの取得に失敗しました')
  }

  return (
    <main className="flex flex-1 justify-center p-2 md:items-center md:px-6 md:py-12">
      <div className="relative h-full w-full md:h-auto md:w-auto">
        <CardContainer fullBleed>
          <ProfileViewer profile={profileRes.data} />
        </CardContainer>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <EditButton />
        </div>
      </div>
    </main>
  )
}

// プロフィール編集画面への遷移ボタン
function EditButton() {
  return (
    <Link
      href="/myprofile/edit"
      className="whitespace-nowrap rounded-full bg-swipe-foreground px-12 py-3.5 text-lg font-bold text-swipe-background shadow-lg"
    >
      プロフィールの編集
    </Link>
  )
}
