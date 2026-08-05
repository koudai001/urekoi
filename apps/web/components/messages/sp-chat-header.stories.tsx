import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SpChatHeader } from './sp-chat-header'

const meta = {
  title: 'messages/SpChatHeader',
  component: SpChatHeader,
  args: {
    conversation: {
      name: '美咲',
      image: '/profiles/woman-1.png',
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-swipe-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpChatHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
