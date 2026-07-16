import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent } from 'storybook/test'

import { ProfileCard } from './profile-card'
import type { ProfileSummary } from '@/generated/urekoiAPI.schemas'

const baseProfile: ProfileSummary = {
  user_id: 1,
  nickname: '美咲',
  age: 42,
  prefecture: '東京都',
  image: '/profiles/woman-1.png',
  online: 'online',
  is_new: true,
}

const meta = {
  title: 'profile/ProfileCard',
  component: ProfileCard,
  args: {
    profile: baseProfile,
  },
  // 実際のグリッド1カラム分の幅(240px程度)に合わせる
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileCard>

export default meta
type Story = StoryObj<typeof meta>

// NEWバッジが表示され、プロフィール詳細へのリンクになっていることを確認
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('NEW')).toBeInTheDocument()

    const link = canvas.getByRole('link', {
      name: `${baseProfile.nickname}さんのプロフィールを開く`,
    })
    await expect(link).toHaveAttribute(
      'href',
      `/search/all/partner/${baseProfile.user_id}`,
    )
  },
}

// is_newがfalseの場合はNEWバッジが表示されないことを確認
export const NotNew: Story = {
  args: { profile: { ...baseProfile, is_new: false } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('NEW')).not.toBeInTheDocument()
  },
}

export const Recent: Story = {
  args: { profile: { ...baseProfile, online: 'recent' } },
}

export const Offline: Story = {
  args: { profile: { ...baseProfile, online: undefined } },
}

// お気に入りボタンをクリックしてもカードへのリンクは維持されたままであることを確認
export const FavoriteButtonDoesNotBreakLink: Story = {
  play: async ({ canvas }) => {
    const favoriteButton = canvas.getByRole('button', {
      name: 'お気に入りに追加',
    })

    await userEvent.click(favoriteButton)

    const link = canvas.getByRole('link', {
      name: `${baseProfile.nickname}さんのプロフィールを開く`,
    })
    await expect(link).toBeInTheDocument()
  },
}
