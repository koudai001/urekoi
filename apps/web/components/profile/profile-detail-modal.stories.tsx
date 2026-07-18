import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, mocked, userEvent } from 'storybook/test'
import { getRouter } from '@storybook/nextjs-vite/navigation.mock'
import * as likesActions from '@/actions/likes'

import { ProfileDetailModal } from './profile-detail-modal'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'

const baseProfile: ProfileDetail = {
  user_id: 1,
  nickname: '美咲',
  age: 42,
  prefecture: '東京都',
  bio: '落ち着いた時間を一緒に過ごせる方を探しています。',
  is_new: true,
  online: 'online',
  already_liked: false,
  images: ['/profiles/woman-1.png'],
  tags: [
    {
      label: '甘いもの大好き',
      category: 'グルメ・お酒',
      image_url: '/tags/sweets.png',
    },
    {
      label: 'ディズニー好き',
      category: '趣味全般',
      image_url: '/tags/themepark.png',
    },
  ],
}

const meta = {
  title: 'profile/ProfileDetailModal',
  component: ProfileDetailModal,
  args: {
    profile: baseProfile,
  },
  // 設定値を変更することで、App Routerのnext/navigation由来のuseRouter()を使えるようになる
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  // 中に含まれるいいねボタンをクリックしても落ちないよう、既定の戻り値を設定しておく
  beforeEach: () => {
    mocked(likesActions.sendLike).mockResolvedValue({ success: true })
  },
} satisfies Meta<typeof ProfileDetailModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Offline: Story = {
  args: { profile: { ...baseProfile, online: undefined, is_new: false } },
}

// お気に入りボタンをクリックすると見た目(色)がトグルされることを確認
export const ToggleFavorite: Story = {
  play: async ({ canvas }) => {
    const favoriteButton = canvas.getByRole('button', {
      name: 'お気に入りに追加',
    })
    const star = favoriteButton.querySelector('svg')

    await expect(star).not.toHaveClass('fill-amber-300')

    await userEvent.click(favoriteButton)
    await expect(star).toHaveClass('fill-amber-300')
  },
}

// Escキーを押すと1つ前の履歴に戻る(router.back)が呼ばれることを確認
export const CloseWithEsc: Story = {
  play: async () => {
    await userEvent.keyboard('{Escape}')
    await expect(getRouter().back).toHaveBeenCalled()
  },
}

// モーダルの外側(背景)をクリックすると1つ前の履歴に戻る(router.back)が呼ばれることを確認
export const CloseByBackgroundClick: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('dialog'))
    await expect(getRouter().back).toHaveBeenCalled()
  },
}

// 閉じるボタンを押すと1つ前の履歴に戻る(router.back)が呼ばれることを確認
export const CloseByCloseButton: Story = {
  play: async ({ canvas }) => {
    const closeButton = canvas.getByRole('button', { name: '閉じる' })

    await userEvent.click(closeButton)
    await expect(getRouter().back).toHaveBeenCalled()
  },
}

// isDirectAccess時は閉じるボタンを押すとbackではなく一覧ページへのpushが呼ばれることを確認
export const DirectAccess: Story = {
  args: { isDirectAccess: true },
  play: async ({ canvas }) => {
    const closeButton = canvas.getByRole('button', { name: '閉じる' })

    await userEvent.click(closeButton)
    await expect(getRouter().push).toHaveBeenCalledWith('/search/all')
    await expect(getRouter().back).not.toHaveBeenCalled()
  },
}
