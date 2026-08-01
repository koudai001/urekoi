'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CardContainer } from '@/components/ui/card-container'
import { ProfilePhotos } from '@/components/myprofile/profile-photos'
import {
  SectionTitle,
  SelectRow,
  InputRow,
} from '@/components/myprofile/profile-form'
import { updateMyProfile } from '@/actions/myprofile'
import { PREFECTURES } from '@/lib/prefectures'
import { cn } from '@/lib/utils'
import type {
  MyProfileResponse,
  TagOption,
} from '@/generated/urekoiAPI.schemas'

const TAGS_PER_CATEGORY_LIMIT = 3

// 「出会いの希望」「タグ」に振り分けるカテゴリ名
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
function groupTagsByCategory(tags: TagOption[], categoryLabels: string[]) {
  return categoryLabels.map((label) => ({
    label,
    tags: tags.filter((t) => t.category === label),
  }))
}

type ProfileFormData = {
  nickname: string
  prefecture_code: number
  bio: string
  occupation: string
  hometown: string
  blood_type: string
  mbti: string
  body_type: string
  education: string
  holiday: string
  alcohol: string
  smoking: string
  height_cm: number
  tag_ids: number[]
}

// 編集/プレビュー タブ+写真編集グリッド+保存ボタンをまとめたカード(サイズはCardContainerに準拠)
export function ProfileEditArea({
  profile,
  tags,
}: {
  profile: MyProfileResponse
  tags: TagOption[]
}) {
  const [formData, setFormData] = useState<ProfileFormData>({
    nickname: profile.nickname ?? '',
    prefecture_code: profile.prefecture_code ?? 0,
    bio: profile.bio ?? '',
    occupation: profile.occupation ?? '',
    hometown: profile.hometown ?? '',
    blood_type: profile.blood_type ?? '',
    mbti: profile.mbti ?? '',
    body_type: profile.body_type ?? '',
    education: profile.education ?? '',
    holiday: profile.holiday ?? '',
    alcohol: profile.alcohol ?? '',
    smoking: profile.smoking ?? '',
    height_cm: profile.height_cm ?? 0,
    tag_ids: profile.tag_ids ?? [],
  })
  const [saving, setSaving] = useState(false)

  function handleChange<K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // タグの選択/解除。カテゴリごとに最大3つまで
  const toggleTag = (tag: TagOption) => {
    const current = formData.tag_ids
    if (current.includes(tag.id!)) {
      handleChange(
        'tag_ids',
        current.filter((id) => id !== tag.id),
      )
      return
    }
    const sameCategoryCount = tags.filter(
      (t) => t.category === tag.category && current.includes(t.id!),
    ).length
    if (sameCategoryCount >= TAGS_PER_CATEGORY_LIMIT) return
    handleChange('tag_ids', [...current, tag.id!])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateMyProfile({ ...formData })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('プロフィールを保存しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <CardContainer>
      <div className="flex h-full w-full flex-col overflow-hidden rounded-card bg-swipe-sidebar">
        {/* 編集タブ: 固定、スクロールしない */}
        <Header />

        {/* 各セクション: 残り領域内でスクロール可能 */}
        <ScrollArea>
          <PhotoArea />

          <MeetingArea
            tags={tags}
            selectedTagIds={formData.tag_ids}
            onToggle={toggleTag}
          />

          <BioArea
            value={formData.bio}
            onChange={(value) => handleChange('bio', value)}
          />

          <TagArea
            tags={tags}
            selectedTagIds={formData.tag_ids}
            onToggle={toggleTag}
          />

          <ProfileFieldsArea formData={formData} onChange={handleChange} />

          <div className="h-4 shrink-0" />
        </ScrollArea>

        {/* 保存ボタン: 固定、スクロールしない */}
        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </CardContainer>
  )
}

// 編集/プレビュー タブ
function Header() {
  return (
    <div className="flex h-[8%] shrink-0 border-b border-swipe-border">
      <span className="flex flex-1 items-center justify-center border-b-2 border-swipe-accent text-xl font-bold text-swipe-accent">
        編集
      </span>
      <span className="flex flex-1 items-center justify-center text-xl font-semibold text-swipe-muted-foreground">
        プレビュー
      </span>
    </div>
  )
}

// 残り高さいっぱいに広がり、はみ出た分だけ縦スクロールする領域
function ScrollArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7">
      {children}
    </div>
  )
}

// プロフィール写真セクション(見出し+アップロード/削除できる写真グリッド)。
// 常にScrollAreaの表示領域いっぱいに埋まり、他のセクションはスクロールしないと見えない
function PhotoArea() {
  return (
    <div className="flex h-full shrink-0 flex-col">
      <h2 className="mt-4 shrink-0 text-lg font-bold text-swipe-foreground">
        プロフィール写真
      </h2>
      <div className="min-h-0 flex-1">
        <ProfilePhotos />
      </div>
    </div>
  )
}

// 出会いの希望セクション
function MeetingArea({
  tags,
  selectedTagIds,
  onToggle,
}: {
  tags: TagOption[]
  selectedTagIds: number[]
  onToggle: (tag: TagOption) => void
}) {
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
              selectedTagIds={selectedTagIds}
              onToggle={onToggle}
            />
          ),
        )}
      </div>
    </div>
  )
}

// 自己紹介セクション
function BioArea({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="shrink-0">
      <SectionTitle>自己紹介</SectionTitle>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="自己紹介を入力してください"
        rows={7}
        className="mt-2 w-full rounded-2xl border border-swipe-border bg-swipe-surface p-4 text-sm leading-relaxed text-swipe-foreground outline-none placeholder:text-swipe-muted-foreground focus:border-swipe-accent"
      />
    </div>
  )
}

// タグセクション
function TagArea({
  tags,
  selectedTagIds,
  onToggle,
}: {
  tags: TagOption[]
  selectedTagIds: number[]
  onToggle: (tag: TagOption) => void
}) {
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
              selectedTagIds={selectedTagIds}
              onToggle={onToggle}
            />
          ),
        )}
      </div>
    </div>
  )
}

// プロフィール(属性選択)セクション
function ProfileFieldsArea({
  formData,
  onChange,
}: {
  formData: ProfileFormData
  onChange: <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => void
}) {
  return (
    <div className="shrink-0">
      <SectionTitle>プロフィール</SectionTitle>
      <div>
        <InputRow
          label="ニックネーム"
          value={formData.nickname}
          onChange={(value) => onChange('nickname', value)}
        />
        <SelectRow
          label="居住地"
          value={
            PREFECTURES.find((p) => p.code === formData.prefecture_code)?.name
          }
          options={PREFECTURES.map((p) => p.name)}
          onChange={(name) =>
            onChange(
              'prefecture_code',
              PREFECTURES.find((p) => p.name === name)?.code ?? 0,
            )
          }
        />
        <SelectRow
          label="職業"
          value={formData.occupation}
          onChange={(value) => onChange('occupation', value)}
          options={['エンジニア', '営業', '企画', '公務員', '医療']}
        />
        <SelectRow
          label="出身地"
          value={formData.hometown}
          onChange={(value) => onChange('hometown', value)}
          options={['北海道', '東京', '大阪', '福岡', '選択しない']}
        />
        <SelectRow
          label="血液型"
          value={formData.blood_type}
          onChange={(value) => onChange('blood_type', value)}
          options={['A型', 'B型', 'O型', 'AB型']}
        />
        <SelectRow
          label="MBTI"
          value={formData.mbti}
          onChange={(value) => onChange('mbti', value)}
          options={['INTJ', 'INFP', 'ENTP', 'ESFJ', 'その他']}
        />
        <SelectRow
          label="体型"
          value={formData.body_type}
          onChange={(value) => onChange('body_type', value)}
          options={['スリム', '普通', 'がっしり', 'ぽっちゃり']}
        />
        <SelectRow
          label="学歴"
          value={formData.education}
          onChange={(value) => onChange('education', value)}
          options={['高校卒', '専門学校卒', '大学卒', '大学院卒']}
        />
        <SelectRow
          label="休日"
          value={formData.holiday}
          onChange={(value) => onChange('holiday', value)}
          options={['土日', '平日', '不定期']}
        />
        <SelectRow
          label="お酒"
          value={formData.alcohol}
          onChange={(value) => onChange('alcohol', value)}
          options={['飲まない', '時々飲む', 'よく飲む']}
        />
        <SelectRow
          label="タバコ"
          value={formData.smoking}
          onChange={(value) => onChange('smoking', value)}
          options={['吸わない', '吸う', '時々吸う', '電子タバコ']}
        />
        <SelectRow
          label="身長"
          value={formData.height_cm ? `${formData.height_cm}cm` : undefined}
          onChange={(value) => onChange('height_cm', parseInt(value, 10))}
          options={['165cm', '170cm', '175cm', '180cm', '185cm']}
        />
      </div>
    </div>
  )
}

// 保存ボタン
function SaveButton({
  onClick,
  saving,
}: {
  onClick: () => void
  saving: boolean
}) {
  return (
    <div className="flex h-[11%] shrink-0 items-center justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="rounded-full bg-swipe-foreground px-12 py-3.5 text-[15px] font-bold text-swipe-background disabled:opacity-60"
      >
        {saving ? '保存中...' : '保存'}
      </button>
    </div>
  )
}

// カテゴリ名・選択数(x/3)・チップ一覧をまとめて表示する
function CategoryChips({
  category,
  tags,
  selectedTagIds,
  onToggle,
}: {
  category: string
  tags: TagOption[]
  selectedTagIds: number[]
  onToggle: (tag: TagOption) => void
}) {
  const selectedCount = tags.filter((t) =>
    selectedTagIds.includes(t.id!),
  ).length

  return (
    <div>
      <p className="text-sm font-medium text-swipe-foreground">
        {category}
        <span className="ml-2 text-xs text-swipe-muted-foreground">
          ({selectedCount}/{TAGS_PER_CATEGORY_LIMIT})
        </span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <ChipToggle
            key={tag.id}
            label={tag.label ?? ''}
            selected={selectedTagIds.includes(tag.id!)}
            onToggle={() => onToggle(tag)}
          />
        ))}
      </div>
    </div>
  )
}

function ChipToggle({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        selected
          ? 'border-swipe-accent bg-swipe-accent/10 text-swipe-accent'
          : 'border-swipe-border bg-swipe-surface text-swipe-muted-foreground hover:bg-swipe-surface/60',
      )}
    >
      {label}
    </button>
  )
}
