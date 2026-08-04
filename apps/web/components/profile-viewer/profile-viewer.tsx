import { ScrollContainer } from '@/components/ui/scroll-container'
import { PhotoViewer } from '@/components/profile-viewer/photo-viewer'
import { SectionTitle } from '@/components/myprofile/profile-form'
import { cn } from '@/lib/utils'
import type { ProfileDetail, TagSummary } from '@/generated/urekoiAPI.schemas'

// 「出会いの希望」「タグ」に振り分けるカテゴリ名(profile-edit-areaと同じ分類)
const MEETING_TAG_CATEGORY_LABELS = [
  '会える時間',
  '待ち合わせ希望エリア',
  'パートナーに求めること',
]
const OTHER_TAG_CATEGORY_LABELS = [
  '好きなこと・挑戦してみたいこと',
  '好きなグルメやお酒',
  '価値観',
]

// カテゴリ名一覧の順番で、該当タグをグルーピングする
function groupTagsByCategory(tags: TagSummary[], categoryLabels: string[]) {
  return categoryLabels.map((label) => ({
    label,
    tags: tags.filter((t) => t.category === label),
  }))
}

// プロフィールを読み取り専用で表示する。h-fullで親の高さいっぱいに広がるので、
// サイズは呼び出し側(親要素)が決める
export function ProfileViewer({ profile }: { profile: ProfileDetail }) {
  const tags = profile.tags ?? []

  return (
    <ScrollContainer className="h-full rounded-card bg-swipe-sidebar">
      <div className="flex items-baseline gap-2.5 p-5 pb-3 text-[30px] font-extrabold text-swipe-foreground">
        <span>{profile.nickname}</span>
        <span>{profile.age}</span>
      </div>

      <PhotoViewer
        images={profile.images ?? []}
        alt={`${profile.nickname}さんの写真`}
      />

      <div className="px-5">
        <MeetingArea tags={tags} />

        <BioArea value={profile.bio} />

        <TagArea tags={tags} />

        <ProfileFieldsArea profile={profile} />
      </div>

      <div className="h-28 shrink-0" />
    </ScrollContainer>
  )
}

// 出会いの希望セクション
function MeetingArea({ tags }: { tags: TagSummary[] }) {
  return (
    <div className="shrink-0">
      <SectionTitle>出会いの希望</SectionTitle>
      <div className="mt-2 flex flex-col gap-6">
        {groupTagsByCategory(tags, MEETING_TAG_CATEGORY_LABELS).map(
          (category) => (
            <CategoryChips
              key={category.label}
              category={category.label}
              tags={category.tags}
            />
          ),
        )}
      </div>
    </div>
  )
}

// 自己紹介セクション
function BioArea({ value }: { value?: string }) {
  return (
    <div className="shrink-0">
      <SectionTitle>自己紹介</SectionTitle>
      <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-swipe-border bg-swipe-surface p-4 text-sm leading-relaxed text-swipe-foreground">
        {value || '未設定'}
      </p>
    </div>
  )
}

// タグセクション
function TagArea({ tags }: { tags: TagSummary[] }) {
  return (
    <div className="shrink-0">
      <SectionTitle>タグ</SectionTitle>
      <div className="mt-2 flex flex-col gap-6">
        {groupTagsByCategory(tags, OTHER_TAG_CATEGORY_LABELS).map(
          (category) => (
            <CategoryChips
              key={category.label}
              category={category.label}
              tags={category.tags}
            />
          ),
        )}
      </div>
    </div>
  )
}

// プロフィール(属性)セクション
function ProfileFieldsArea({ profile }: { profile: ProfileDetail }) {
  return (
    <div className="shrink-0">
      <SectionTitle>プロフィール</SectionTitle>
      <div>
        <AttributeRow label="居住地" value={profile.prefecture} />
        <AttributeRow label="職業" value={profile.occupation} />
        <AttributeRow label="出身地" value={profile.hometown} />
        <AttributeRow label="血液型" value={profile.blood_type} />
        <AttributeRow label="MBTI" value={profile.mbti} />
        <AttributeRow label="体型" value={profile.body_type} />
        <AttributeRow label="学歴" value={profile.education} />
        <AttributeRow label="休日" value={profile.holiday} />
        <AttributeRow label="お酒" value={profile.alcohol} />
        <AttributeRow label="タバコ" value={profile.smoking} />
        <AttributeRow
          label="身長"
          value={profile.height_cm ? `${profile.height_cm}cm` : undefined}
        />
      </div>
    </div>
  )
}

// カテゴリ名・タグ一覧を表示する(編集画面と違いトグル操作は無い)
function CategoryChips({
  category,
  tags,
}: {
  category: string
  tags: TagSummary[]
}) {
  if (tags.length === 0) return null

  return (
    <div>
      <p className="text-sm font-medium text-swipe-foreground">{category}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.label}
            className={cn(
              'rounded-full border border-swipe-accent bg-swipe-accent/10 px-3 py-1.5 text-sm font-medium text-swipe-accent',
            )}
          >
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// 未設定のフィールドは「未設定」と表示する読み取り専用の行
function AttributeRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-swipe-border py-4">
      <span className="text-sm font-medium text-swipe-foreground">{label}</span>
      <span
        className={
          value
            ? 'text-sm text-swipe-foreground'
            : 'text-sm text-swipe-muted-foreground'
        }
      >
        {value || '未設定'}
      </span>
    </div>
  )
}
