import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn } from 'storybook/test'

import { SignupStepNav } from './signup-step-nav'

const meta = {
  title: 'signup/SignupStepNav',
  component: SignupStepNav,
  args: { onBack: fn(), onNext: fn() },
} satisfies Meta<typeof SignupStepNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NextDisabled: Story = {
  args: { nextDisabled: true },
}

// 戻る/次へをクリックするとそれぞれのハンドラが呼ばれることを確認
export const Click: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '前へ戻る' }))
    await expect(args.onBack).toHaveBeenCalledOnce()

    await userEvent.click(canvas.getByRole('button', { name: '次へ進む' }))
    await expect(args.onNext).toHaveBeenCalledOnce()
  },
}
