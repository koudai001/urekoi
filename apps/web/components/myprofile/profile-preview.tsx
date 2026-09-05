import { ProfileDetail } from '@/components/search/profile-detail'
import type { ProfileDetail as ProfileDetailData } from '@/generated/urekoiAPI.schemas'

export function ProfilePreview({ profile }: { profile: ProfileDetailData }) {
  return <ProfileDetail profile={profile} returnHref="/myprofile" />
}
