import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, mocked } from 'storybook/test'
import * as useMatchProfilesModule from './use-match-profiles'

import { MatchingCarousel } from './matching-carousel'
import type { MatchProfile } from '@/generated/urekoiAPI.schemas'

const dummyMatches: MatchProfile[] = [
  {
    user_id: 1,
    nickname: '美咲',
    age: 42,
    prefecture: '東京都',
    image: '/profiles/woman-5.png',
  },
  {
    user_id: 2,
    nickname: '由香里',
    age: 38,
    prefecture: '神奈川県',
    image: '/profiles/woman-3.png',
  },
]

const meta = {
  title: 'messages/MatchingCarousel',
  component: MatchingCarousel,
  args: {
    onSelect: () => {},
  },
  // 各storyでの上書きが無い場合は「マッチング無し」を既定にしておく
  beforeEach: () => {
    mocked(useMatchProfilesModule.useMatchProfiles).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMatchProfilesModule.useMatchProfiles>)
  },
} satisfies Meta<typeof MatchingCarousel>

export default meta
type Story = StoryObj<typeof meta>

// マッチング相手がいない場合はアバターが1件も表示されないことを確認
export const NoMatches: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('マッチング')).toBeInTheDocument()
    await expect(canvas.queryByAltText(/さん$/)).not.toBeInTheDocument()
  },
}

// マッチング相手がいる場合、それぞれのアバターが表示されることを確認
export const WithMatches: Story = {
  beforeEach: () => {
    mocked(useMatchProfilesModule.useMatchProfiles).mockReturnValue({
      data: dummyMatches,
    } as unknown as ReturnType<typeof useMatchProfilesModule.useMatchProfiles>)
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByAltText('美咲さん')).toBeInTheDocument()
    await expect(canvas.getByAltText('由香里さん')).toBeInTheDocument()
  },
}
