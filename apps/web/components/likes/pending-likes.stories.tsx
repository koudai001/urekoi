import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PendingLikes } from './pending-likes'

const meta = {
  title: 'likes/PendingLikes',
  component: PendingLikes,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex h-screen w-full max-w-md flex-col bg-swipe-background">
        <Story />
      </div>
    ),
  ],
  args: {
    pendingLikes: {
      total: 4,
      profiles: [
        {
          user_id: 1,
          nickname: '美咲',
          age: 42,
          prefecture: '東京都',
          online: 'online',
          photos: ['/profiles/woman-1.png'],
        },
        {
          user_id: 2,
          nickname: '由香里',
          age: 38,
          prefecture: '神奈川県',
          online: 'offline',
          photos: ['/profiles/woman-2.png'],
        },
        {
          user_id: 3,
          nickname: '恵',
          age: 45,
          prefecture: '千葉県',
          online: 'online',
          photos: ['/profiles/woman-3.png'],
        },
        {
          user_id: 4,
          nickname: '智子',
          age: 40,
          prefecture: '埼玉県',
          online: 'offline',
          photos: ['/profiles/woman-4.png'],
        },
      ],
    },
  },
} satisfies Meta<typeof PendingLikes>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: {
    pendingLikes: {
      total: 0,
      profiles: [],
    },
  },
}
