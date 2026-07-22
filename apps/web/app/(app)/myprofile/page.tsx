'use client'

import { useState } from 'react'
import { ProfilePhotos } from '@/components/profile-photos'
import { SectionTitle, SelectRow } from '@/components/profile-form'
import { cn } from '@/lib/utils'

const TAGS_PER_CATEGORY_LIMIT = 3

// 仮の選択肢(画面構成確認用)。全カテゴリ共通で3つまで選択可能
const meetingCategories = [
  {
    label: '会える時間',
    tags: ['平日昼', '平日夕方', '平日夜', '土日昼', '土日夕方', '土日夜'],
  },
  {
    label: '待ち合わせ希望エリア',
    tags: ['新宿', '渋谷', '池袋', '銀座', '六本木', '横浜'],
  },
  {
    label: '重視するポイント',
    tags: ['誠実さ', '経済力', '価値観の一致', '一緒にいて楽しい'],
  },
]

const tagCategories = [
  {
    label: '好きなこと・挑戦してみたいこと',
    tags: ['旅行', '料理', '読書', '映画鑑賞', 'スポーツ観戦'],
  },
  {
    label: '好きなグルメやお酒',
    tags: ['ワイン', 'カフェ巡り', '焼肉', 'スイーツ', '日本酒'],
  },
  {
    label: '価値観',
    tags: ['家族第一', '自由重視', '成長志向', '安定志向'],
  },
]

export default function ProfilePage() {
  const [selectedTagsByCategory, setSelectedTagsByCategory] = useState<
    Record<string, string[]>
  >({})
  const [bio, setBio] = useState('')

  const toggleTag = (category: string, tag: string) => {
    setSelectedTagsByCategory((prev) => {
      const current = prev[category] ?? []
      if (current.includes(tag)) {
        return { ...prev, [category]: current.filter((t) => t !== tag) }
      }
      if (current.length >= TAGS_PER_CATEGORY_LIMIT) return prev
      return { ...prev, [category]: [...current, tag] }
    })
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8">
        <div className="mb-4 flex justify-end">
          <button className="text-sm font-bold text-primary hover:underline">
            プレビュー
          </button>
        </div>

        <ProfilePhotos />

        {/* 出会いの希望 */}
        <SectionTitle>出会いの希望</SectionTitle>
        <div className="mt-2 flex flex-col gap-6">
          {meetingCategories.map((category) => (
            <CategoryChips
              key={category.label}
              category={category.label}
              tags={category.tags}
              selected={selectedTagsByCategory[category.label] ?? []}
              onToggle={(tag) => toggleTag(category.label, tag)}
            />
          ))}
        </div>

        {/* 自己紹介 */}
        <SectionTitle>自己紹介</SectionTitle>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="自己紹介を入力してください"
          rows={6}
          className="mt-2 w-full rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />

        {/* タグ */}
        <SectionTitle>タグ</SectionTitle>
        <div className="mt-2 flex flex-col gap-6">
          {tagCategories.map((category) => (
            <CategoryChips
              key={category.label}
              category={category.label}
              tags={category.tags}
              selected={selectedTagsByCategory[category.label] ?? []}
              onToggle={(tag) => toggleTag(category.label, tag)}
            />
          ))}
        </div>

        {/* プロフィール */}
        <SectionTitle>プロフィール</SectionTitle>
        <div>
          <SelectRow
            label="居住地"
            value="東京"
            options={['東京', '神奈川', '埼玉', '千葉', '大阪']}
          />
          <SelectRow
            label="職業"
            options={['エンジニア', '営業', '企画', '公務員', '医療']}
          />
          <SelectRow
            label="出身地"
            options={['北海道', '東京', '大阪', '福岡', '選択しない']}
          />
          <SelectRow label="血液型" options={['A型', 'B型', 'O型', 'AB型']} />
          <SelectRow
            label="MBTI"
            options={['INTJ', 'INFP', 'ENTP', 'ESFJ', 'その他']}
          />
          <SelectRow
            label="体型"
            options={['スリム', '普通', 'がっしり', 'ぽっちゃり']}
          />
          <SelectRow
            label="学歴"
            options={['高校卒', '専門学校卒', '大学卒', '大学院卒']}
          />
          <SelectRow label="休日" options={['土日', '平日', '不定期']} />
          <SelectRow
            label="お酒"
            options={['飲まない', '時々飲む', 'よく飲む']}
          />
          <SelectRow
            label="タバコ"
            options={['吸わない', '吸う', '時々吸う', '電子タバコ']}
          />
          <SelectRow
            label="身長"
            options={['165cm', '170cm', '175cm', '180cm', '185cm']}
          />
        </div>

        <div className="h-16" />
      </div>
    </main>
  )
}

// カテゴリ名・選択数(x/3)・チップ一覧をまとめて表示する
function CategoryChips({
  category,
  tags,
  selected,
  onToggle,
}: {
  category: string
  tags: string[]
  selected: string[]
  onToggle: (tag: string) => void
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">
        {category}
        <span className="ml-2 text-xs text-muted-foreground">
          ({selected.length}/{TAGS_PER_CATEGORY_LIMIT})
        </span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <ChipToggle
            key={tag}
            label={tag}
            selected={selected.includes(tag)}
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
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card text-muted-foreground hover:bg-accent/40',
      )}
    >
      {label}
    </button>
  )
}
