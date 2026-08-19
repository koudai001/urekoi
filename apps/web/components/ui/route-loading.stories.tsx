import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { RouteLoading } from './route-loading'

const meta = {
  title: 'ui/RouteLoading',
  component: RouteLoading,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex h-screen max-w-md bg-swipe-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RouteLoading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
