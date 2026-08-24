import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mocked } from 'storybook/test'
import * as useMatchProfilesModule from '@/hooks/use-match-profiles'
import * as useReceivedLikesModule from '@/hooks/use-received-likes'
import { MessagesInbox } from './messages-inbox'

const initialLikes = { total: 7, profiles: [] }
const initialUnmessagedMatches = [
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
]
const initialMessagedMatches = [
  {
    match_id: 3,
    user_id: 4,
    nickname: '奈々',
    image: '/profiles/woman-3.png',
    last_message: '週末にお話ししませんか？',
    last_message_at: '2026-08-05T12:00:00+09:00',
    last_message_sender_user_id: 4,
  },
]

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
  beforeEach: () => {
    mocked(useReceivedLikesModule.useReceivedLikes).mockReturnValue({
      data: initialLikes,
    } as unknown as ReturnType<typeof useReceivedLikesModule.useReceivedLikes>)
    mocked(useMatchProfilesModule.useUnmessagedMatches).mockReturnValue({
      data: initialUnmessagedMatches,
    } as unknown as ReturnType<
      typeof useMatchProfilesModule.useUnmessagedMatches
    >)
    mocked(useMatchProfilesModule.useMessagedMatches).mockReturnValue({
      data: initialMessagedMatches,
    } as unknown as ReturnType<
      typeof useMatchProfilesModule.useMessagedMatches
    >)
  },
  args: {
    initialLikes,
    initialUnmessagedMatches,
    initialMessagedMatches,
  },
} satisfies Meta<typeof MessagesInbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
