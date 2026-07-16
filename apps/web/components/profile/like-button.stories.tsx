import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, mocked, userEvent } from 'storybook/test'
import * as likesActions from '@/actions/likes'

import { LikeButton } from './like-button'

const meta = {
  title: 'profile/LikeButton',
  component: LikeButton,
  args: {
    toUserId: 1,
    alreadyLiked: false,
  },
  // 各storyでの上書き設定が無い場合の既定の戻り値(Storybook上で実際にクリックしても落ちないように)
  beforeEach: () => {
    mocked(likesActions.sendLike).mockResolvedValue({ success: true })
  },
} satisfies Meta<typeof LikeButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// 既にいいね済みの場合、最初から押せない見た目になっていることを確認
export const AlreadyLiked: Story = {
  args: { alreadyLiked: true },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'いいね' })

    await expect(button).toBeDisabled()
    await expect(button).toHaveClass('bg-muted')
  },
}

// クリックしていいねが成功すると、ボタンが押せなくなり見た目が変わることを確認
export const LikeSuccess: Story = {
  play: async ({ canvas, args }) => {
    mocked(likesActions.sendLike).mockResolvedValue({ success: true })

    const button = canvas.getByRole('button', { name: 'いいね' })
    await userEvent.click(button)

    await expect(likesActions.sendLike).toHaveBeenCalledWith(args.toUserId)
    await expect(button).toBeDisabled()
    await expect(button).toHaveClass('bg-muted')
  },
}

// いいねに失敗した場合、エラーメッセージが表示され再度押せる状態のままであることを確認
export const LikeError: Story = {
  play: async ({ canvas }) => {
    mocked(likesActions.sendLike).mockResolvedValue({
      success: false,
      error: 'すでにいいねを送っています',
    })

    const button = canvas.getByRole('button', { name: 'いいね' })
    await userEvent.click(button)

    await expect(
      canvas.getByText('すでにいいねを送っています'),
    ).toBeInTheDocument()
    await expect(button).not.toBeDisabled()
  },
}
