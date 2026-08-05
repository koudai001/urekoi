import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mocked } from 'storybook/test'
import * as useReceivedLikesModule from '@/hooks/use-received-likes'
import * as useMatchProfilesModule from '@/hooks/use-match-profiles'

import { SpMessagesInbox } from './sp-messages-inbox'

const meta = {
  title: 'messages/SpMessagesInbox',
  component: SpMessagesInbox,
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
  beforeEach: () => {
    mocked(useReceivedLikesModule.useReceivedLikes).mockReturnValue({
      data: { total: 7 },
    } as unknown as ReturnType<typeof useReceivedLikesModule.useReceivedLikes>)
    mocked(useMatchProfilesModule.useUnmessagedMatches).mockReturnValue({
      data: [
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
        {
          match_id: 3,
          user_id: 4,
          nickname: '由香里',
          image: '/profiles/woman-2.png',
        },
        {
          match_id: 4,
          user_id: 5,
          nickname: '由香里',
          image: '/profiles/woman-2.png',
        },
        {
          match_id: 5,
          user_id: 6,
          nickname: '由香里',
          image: '/profiles/woman-2.png',
        },
      ],
    } as unknown as ReturnType<
      typeof useMatchProfilesModule.useUnmessagedMatches
    >)
    mocked(useMatchProfilesModule.useMessagedMatches).mockReturnValue({
      data: [
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
    } as unknown as ReturnType<
      typeof useMatchProfilesModule.useMessagedMatches
    >)
  },
} satisfies Meta<typeof SpMessagesInbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
