import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, mocked } from 'storybook/test'
import * as useReceivedLikesModule from './use-received-likes'

import { LikeNavItem } from './like-nav-item'
import type { PendingLikesResponse } from '@/generated/urekoiAPI.schemas'

const dummyLikes: PendingLikesResponse = {
  total: 3,
  profiles: [
    { user_id: 1, nickname: '美咲' },
    { user_id: 2, nickname: '由香里' },
    { user_id: 3, nickname: '千夏' },
  ],
}

const meta = {
  title: 'likes/LikeNavItem',
  component: LikeNavItem,
  // 各storyでの上書きが無い場合は「いいね無し」を既定にしておく
  beforeEach: () => {
    mocked(useReceivedLikesModule.useReceivedLikes).mockReturnValue({
      data: { total: 0, profiles: [] },
    } as unknown as ReturnType<typeof useReceivedLikesModule.useReceivedLikes>)
  },
} satisfies Meta<typeof LikeNavItem>

export default meta
type Story = StoryObj<typeof meta>

// いいねが1件も無い場合は「イイネ」ラベルのみで件数バッジが表示されないことを確認
export const NoLikes: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('イイネ')).toBeInTheDocument()
    await expect(canvas.queryByText('3')).not.toBeInTheDocument()
  },
}

// いいねがある場合は件数バッジが表示されることを確認
export const WithLikes: Story = {
  beforeEach: () => {
    mocked(useReceivedLikesModule.useReceivedLikes).mockReturnValue({
      data: dummyLikes,
    } as unknown as ReturnType<typeof useReceivedLikesModule.useReceivedLikes>)
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('イイネ')).toBeInTheDocument()
    await expect(canvas.getByText('3')).toBeInTheDocument()
  },
}
