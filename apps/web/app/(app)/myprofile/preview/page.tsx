import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProfilePreview } from '@/components/myprofile/profile-preview'
import { getMyprofile } from '@/generated/myprofile/myprofile'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

export default async function MyProfilePreviewPage() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''
  const profileRes = await getMyprofile({
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (profileRes.status === 401) redirect('/login')
  if (profileRes.status !== 200) {
    throw new Error('プロフィールの取得に失敗しました')
  }

  return (
    <main className="flex min-h-0 flex-1 justify-center pt-2">
      <ProfilePreview profile={profileRes.data} />
    </main>
  )
}
