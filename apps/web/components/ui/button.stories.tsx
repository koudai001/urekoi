import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'

import { Button } from './button'

const meta = {
  title: 'ui/Button',
  component: Button,
  args: { children: 'ボタン', variant: 'default', size: 'default' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'outline',
        'secondary',
        'ghost',
        'destructive',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: [
        'default',
        'xs',
        'sm',
        'lg',
        'icon',
        'icon-xs',
        'icon-sm',
        'icon-lg',
      ],
    },
  },
} satisfies Meta<typeof Button>
//satisfies 型チェックだけして、元の型はなるべくそのまま残す

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

// globals.cssが読み込まれ、--primaryというCSS変数が定義されていることを確認するテスト
export const CssCheck: Story = {
  play: async ({ canvas }) => {
    // canvas = DOMのルート要素
    const button = canvas.getByRole('button', { name: 'ボタン' })
    // 透明色じゃないことを確認
    await expect(getComputedStyle(button).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  },
}
