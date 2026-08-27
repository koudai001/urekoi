import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent } from 'storybook/test'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'
import { SwipeCard } from './swipe-card'

const sampleProfile: ProfileDetail = {
  user_id: 1,
  nickname: '美咲',
  age: 42,
  prefecture_code: 13,
  prefecture: '東京都',
  bio: 'よろしくお願いします',
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
  online: 'online',
  images: [
    { id: 1, url: '/profiles/woman-1.png', sort_order: 0 },
    { id: 2, url: '/profiles/woman-2.png', sort_order: 1 },
  ],
  tags: [],
  is_new: true,
  already_liked: false,
}

const meta = {
  title: 'recs/SwipeCard',
  component: SwipeCard,
  args: {
    profile: sampleProfile,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340, height: 600 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SwipeCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ChangePhoto: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByAltText('美咲さんの写真')).toHaveAttribute(
      'src',
      expect.stringContaining('/profiles/woman-1.png'),
    )

    await userEvent.click(canvas.getByRole('button', { name: '次の写真' }))
    await expect(canvas.getByAltText('美咲さんの写真')).toHaveAttribute(
      'src',
      expect.stringContaining('/profiles/woman-2.png'),
    )
  },
}

export const NoPhotos: Story = {
  args: {
    profile: { ...sampleProfile, images: [] },
  },
}
