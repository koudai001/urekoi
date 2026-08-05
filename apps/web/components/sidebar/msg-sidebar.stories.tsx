import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, mocked, userEvent } from 'storybook/test'
import * as useReceivedLikesModule from '@/hooks/use-received-likes'
import * as useMatchProfilesModule from '@/hooks/use-match-profiles'
import * as useMyProfileModule from '@/hooks/use-my-profile'
import type {
  MatchProfile,
  MatchProfileWithLastMessage,
} from '@/generated/urekoiAPI.schemas'

import { MsgSidebar } from './msg-sidebar'

const matches: MatchProfile[] = [
  {
    match_id: 1,
    user_id: 2,
    nickname: '美咲',
    age: 24,
    prefecture: '東京都',
    image: '/profiles/woman-1.png',
  },
  {
    match_id: 2,
    user_id: 3,
    nickname: '由香里',
    age: 27,
    prefecture: '神奈川県',
    image: '/profiles/woman-2.png',
  },
]

const messagedMatches: MatchProfileWithLastMessage[] = [
  {
    match_id: 3,
    user_id: 4,
    nickname: '奈々',
    age: 25,
    prefecture: '埼玉県',
    image: '/profiles/woman-3.png',
    last_message: '週末にお話ししませんか？',
    last_message_at: '2026-08-04T12:00:00+09:00',
    last_message_sender_user_id: 4,
  },
]

const meta = {
  title: 'sidebar/MsgSidebar',
  component: MsgSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-80 bg-swipe-background">
        <Story />
      </div>
    ),
  ],
  beforeEach: () => {
    mocked(useMatchProfilesModule.useUnmessagedMatches).mockReturnValue({
      data: matches,
    } as unknown as ReturnType<
      typeof useMatchProfilesModule.useUnmessagedMatches
    >)
    mocked(useMatchProfilesModule.useMessagedMatches).mockReturnValue({
      data: messagedMatches,
    } as unknown as ReturnType<
      typeof useMatchProfilesModule.useMessagedMatches
    >)
    mocked(useReceivedLikesModule.useReceivedLikes).mockReturnValue({
      data: { total: 7 },
    } as unknown as ReturnType<typeof useReceivedLikesModule.useReceivedLikes>)
    mocked(useMyProfileModule.useMyProfile).mockReturnValue({
      data: {
        images: [{ id: 1, url: '/profiles/me-1.png', sort_order: 0 }],
      },
    } as unknown as ReturnType<typeof useMyProfileModule.useMyProfile>)
  },
} satisfies Meta<typeof MsgSidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Matching: Story = {}

export const Messages: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'メッセージ' }))
    await expect(canvas.getByText('奈々 25歳 埼玉県')).toBeInTheDocument()
  },
}
