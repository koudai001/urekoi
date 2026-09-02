import { notFound } from 'next/navigation'
import { PendingLikeProfileDetail } from '@/components/likes/pending-like-profile-detail'

export default async function PendingLikeProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId: userIdParam } = await params
  const userId = Number(userIdParam)
  if (!Number.isSafeInteger(userId) || userId <= 0) notFound()

  return <PendingLikeProfileDetail userId={userId} />
}
