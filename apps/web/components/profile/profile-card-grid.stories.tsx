import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'

import { ProfileCardGrid } from './profile-card-grid'
import type { ProfileSummary } from '@/generated/urekoiAPI.schemas'

const profiles: ProfileSummary[] = [
  {
    id: 1,
    nickname: '美咲',
    age: 42,
    prefecture: '東京都',
    image: '/profiles/woman-1.png',
    online: 'online',
    is_new: true,
  },
  {
    id: 2,
    nickname: '由香里',
    age: 38,
    prefecture: '神奈川県',
    image: '/profiles/woman-2.png',
    online: 'recent',
  },
  {
    id: 3,
    nickname: '千夏',
    age: 45,
    prefecture: '東京都',
    image: '/profiles/woman-3.png',
  },
]

const meta = {
  title: 'profile/ProfileCardGrid',
  component: ProfileCardGrid,
  args: {
    profiles,
  },
} satisfies Meta<typeof ProfileCardGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// プロフィールが0件の場合は空のグリッドになることを確認
export const Empty: Story = {
  args: { profiles: [] },
  play: async ({ canvas }) => {
    await expect(canvas.queryAllByRole('link')).toHaveLength(0)
  },
}
