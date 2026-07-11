import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'

import { PasswordInput } from './password-input'

const meta = {
  title: 'ui/PasswordInput',
  component: PasswordInput,
  args: { placeholder: 'パスワード' },
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: { disabled: true },
}

// 表示/非表示トグルをクリックするとtype属性がpassword⇄textで切り替わることを確認
export const ToggleVisibility: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText('パスワード')
    await expect(input).toHaveAttribute('type', 'password')

    const toggle = canvas.getByRole('button')
    await userEvent.click(toggle)
    await expect(input).toHaveAttribute('type', 'text')

    await userEvent.click(toggle)
    await expect(input).toHaveAttribute('type', 'password')
  },
}
