import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MessagesInbox } from './messages-inbox'

const meta = {
  title: 'messages/MessagesInbox',
  component: MessagesInbox,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen max-w-sm bg-swipe-background">
        <Story />
      </div>
    ),
  ],
  args: {
    initialLikes: { total: 7, profiles: [] },
    initialUnmessagedMatches: [
      {
        match_id: 1,
        user_id: 2,
        nickname: '美咲',
        image: '/profiles/woman-1.png',
      },
      {
        match_id: 2,
        user_id: 3,
        nickname: '由香里',
        image: '/profiles/woman-2.png',
      },
    ],
    initialMessagedMatches: [
      {
        match_id: 3,
        user_id: 4,
        nickname: '奈々',
        image: '/profiles/woman-3.png',
        last_message: '週末にお話ししませんか？',
        last_message_at: '2026-08-05T12:00:00+09:00',
        last_message_sender_user_id: 4,
      },
    ],
  },
} satisfies Meta<typeof MessagesInbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
