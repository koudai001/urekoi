import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'

import { ProfileViewer } from './profile-viewer'

const sampleProfile: ProfileDetail = {
  user_id: 1,
  nickname: '美咲',
  age: 42,
  prefecture_code: 13,
  prefecture: '東京都',
  bio: 'よろしくお願いします。落ち着いた時間を一緒に過ごせる方を探しています。',
  occupation: '会社員',
  hometown: '東京都',
  blood_type: 'A型',
  mbti: 'ENFP',
  body_type: '普通',
  education: '大学卒',
  holiday: '土日',
  alcohol: '時々飲む',
  smoking: '吸わない',
  height_cm: 160,
  tag_ids: [],
  images: [
    { id: 1, url: '/profiles/woman-1.png', sort_order: 0 },
    { id: 2, url: '/profiles/woman-2.png', sort_order: 1 },
  ],
  tags: [
    { label: '平日夕方', category: '会える時間' },
    { label: 'ワイン', category: '好きなグルメやお酒' },
  ],
  is_new: true,
  online: 'online',
  already_liked: false,
}

const meta = {
  title: 'profile-viewer/ProfileViewer',
  component: ProfileViewer,
  args: {
    profile: sampleProfile,
  },
  // ProfileViewerはh-full/w-fullで親のサイズに合わせるため、サイズを持つ枠で囲む
  decorators: [
    (Story) => (
      <div style={{ width: 340, height: 600 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileViewer>

export default meta
type Story = StoryObj<typeof meta>

// 写真・タグ・自己紹介が揃った基本の表示を確認
export const Default: Story = {}

// 写真が1枚も無い状態(プレースホルダー表示)を確認
export const NoPhotos: Story = {
  args: {
    profile: { ...sampleProfile, images: [] },
  },
}

// タグ・自己紹介が未設定の状態を確認
export const Minimal: Story = {
  args: {
    profile: {
      ...sampleProfile,
      nickname: '花子',
      age: 30,
      prefecture_code: 27,
      prefecture: '大阪府',
      bio: '',
      images: [],
      tags: [],
    },
  },
}
