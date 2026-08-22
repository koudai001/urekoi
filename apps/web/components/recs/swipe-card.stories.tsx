import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent } from 'storybook/test'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'
import { SwipeCard } from './swipe-card'

const sampleProfile: ProfileDetail = {
  user_id: 1,
  nickname: '美咲',
  age: 42,
  prefecture: '東京都',
  bio: 'よろしくお願いします',
  online: 'online',
  images: [
    { id: 1, url: '/profiles/woman-1.png', sort_order: 0 },
    { id: 2, url: '/profiles/woman-2.png', sort_order: 1 },
  ],
  tags: [],
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
