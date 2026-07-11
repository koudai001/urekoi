import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent } from 'storybook/test'

import { FavoriteButton } from './favorite-button'

const meta = {
  title: 'ui/FavoriteButton',
  component: FavoriteButton,
} satisfies Meta<typeof FavoriteButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// クリックでお気に入り状態がトグルされ、Starの見た目(色)が変わることを検証
export const ToggleFavorite: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'お気に入りに追加' })
    const star = button.querySelector('svg')

    await expect(star).not.toHaveClass('fill-amber-300')

    await userEvent.click(button)
    await expect(star).toHaveClass('fill-amber-300')

    await userEvent.click(button)
    await expect(star).not.toHaveClass('fill-amber-300')
  },
}
