import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent } from 'storybook/test'

import { CloseButton } from './close-button'

const meta = {
  title: 'ui/CloseButton',
  component: CloseButton,
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof CloseButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// クリックでonClickが呼ばれることを確認
export const Click: Story = {
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole('button', { name: '閉じる' })

    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalled()
  },
}
