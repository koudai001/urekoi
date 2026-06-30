import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn } from 'storybook/test'

import { BackButton } from './back-button'

const meta = {
  title: 'ui/BackButton',
  component: BackButton,
  args: { onClick: fn() },
} satisfies Meta<typeof BackButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// クリックするとonClickが呼ばれることを確認
export const Click: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: '戻る' })
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
