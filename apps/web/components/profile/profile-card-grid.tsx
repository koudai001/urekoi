import { ProfileCard } from '@/components/profile/profile-card'
import type { ProfileSummary } from '@/generated/urekoiAPI.schemas'

export function ProfileCardGrid({ profiles }: { profiles: ProfileSummary[] }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {profiles.map((profile) => (
          <ProfileCard key={profile.user_id} profile={profile} />
        ))}
      </div>
    </div>
  )
}
