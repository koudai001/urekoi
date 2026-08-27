import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mocked } from 'storybook/test'
import * as useMyProfileModule from '@/hooks/use-my-profile'
import type { ProfileDetail, TagOption } from '@/generated/urekoiAPI.schemas'

import { ProfileEditArea } from './profile-edit-area'

const sampleProfile: ProfileDetail = {
  user_id: 1,
  nickname: 'たろう',
  age: 42,
  prefecture_code: 13,
  prefecture: '東京都',
  bio: 'よろしくお願いします',
  occupation: 'エンジニア',
  hometown: '東京',
  blood_type: 'A型',
  mbti: 'INTJ',
  body_type: '普通',
  education: '大学卒',
  holiday: '土日',
  alcohol: '時々飲む',
  smoking: '吸わない',
  height_cm: 175,
  tag_ids: [1],
  tags: [],
  images: [],
  is_new: false,
  online: 'offline',
  already_liked: false,
}

const sampleTags: TagOption[] = [
  { id: 1, label: '平日昼', category: '会える時間' },
  { id: 2, label: '平日夕方', category: '会える時間' },
  { id: 3, label: '新宿', category: '待ち合わせ希望エリア' },
  { id: 4, label: '旅行', category: '好きなこと・挑戦してみたいこと' },
  { id: 5, label: 'ワイン', category: '好きなグルメやお酒' },
]

const meta = {
  title: 'myprofile/ProfileEditArea',
  component: ProfileEditArea,
  args: {
    profile: sampleProfile,
    tags: sampleTags,
  },
  beforeEach: () => {
    mocked(useMyProfileModule.useMyProfile).mockReturnValue({
      data: {
        images: [
          { id: 1, url: '/profiles/woman-1.png', sort_order: 0 },
          { id: 2, url: '/profiles/woman-2.png', sort_order: 1 },
        ],
      },
    } as unknown as ReturnType<typeof useMyProfileModule.useMyProfile>)
  },
} satisfies Meta<typeof ProfileEditArea>

export default meta
type Story = StoryObj<typeof meta>

// 登録済み写真が2枚ある状態を確認
export const Default: Story = {}

// 写真が1枚も無い状態(全枠が空き枠になる)を確認
export const NoPhotos: Story = {
  beforeEach: () => {
    mocked(useMyProfileModule.useMyProfile).mockReturnValue({
      data: { images: [] },
    } as unknown as ReturnType<typeof useMyProfileModule.useMyProfile>)
  },
}
