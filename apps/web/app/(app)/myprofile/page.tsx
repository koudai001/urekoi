import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Pencil, Settings } from 'lucide-react'
import { getMyprofile } from '@/generated/myprofile/myprofile'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

export default async function MyProfilePage() {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const profileRes = await getMyprofile({
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (profileRes.status === 401) redirect('/login')
  if (profileRes.status !== 200) {
    throw new Error('プロフィールの取得に失敗しました')
  }

  const profile = profileRes.data
  const profileImage = profile.images?.[0]?.url || '/placeholder.svg'

  return (
    <main className="flex min-h-0 flex-1 flex-col items-center bg-swipe-background px-6 pt-10 text-swipe-foreground">
      <div className="relative size-44 overflow-hidden rounded-full bg-swipe-surface ring-4 ring-swipe-accent">
        <Image
          src={profileImage}
          alt={`${profile.nickname ?? ''}さんのプロフィール画像`}
          fill
          sizes="176px"
          loading="eager"
          className="object-cover"
        />
      </div>

      <div className="mt-6 flex items-baseline gap-2 text-3xl font-bold">
        <span>{profile.nickname}</span>
        <span>{profile.age}</span>
      </div>

      <div className="mt-10 flex w-full max-w-xs items-start justify-around">
        <ProfileAction href="/settings" label="設定">
          <Settings className="size-7" />
        </ProfileAction>
        <ProfileAction href="/myprofile/edit" label="プロフィールを編集">
          <Pencil className="size-7" />
        </ProfileAction>
      </div>
    </main>
  )
}

function ProfileAction({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex w-32 flex-col items-center gap-3 text-center font-bold text-swipe-foreground"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-swipe-surface shadow-lg ring-1 ring-swipe-border transition hover:scale-105">
        {children}
      </span>
      <span>{label}</span>
    </Link>
  )
}
