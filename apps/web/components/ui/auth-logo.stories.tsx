import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AuthLogo } from './auth-logo'

const meta = {
  title: 'ui/AuthLogo',
  component: AuthLogo,
} satisfies Meta<typeof AuthLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
