import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CardContainer } from './card-container'

const meta = {
  title: 'ui/CardContainer',
  component: CardContainer,
} satisfies Meta<typeof CardContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <div className="h-full w-full rounded-3xl bg-swipe-sidebar" />,
  },
}
