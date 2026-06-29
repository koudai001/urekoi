import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'

import { Input } from './input'

const meta = {
  title: 'ui/Input',
  component: Input,
  args: { placeholder: 'プレースホルダー', type: 'text' },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel'],
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Email: Story = {
  args: { type: 'email' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

// 入力した文字がそのまま値として反映されることを確認
export const TypeText: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText('プレースホルダー')
    await userEvent.type(input, 'hello')
    await expect(input).toHaveValue('hello')
  },
}
