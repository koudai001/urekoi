import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent } from 'storybook/test'
import { SwipeCardDeck } from './swipe-card-deck'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'
import { QueryProvider } from '@/providers/query-provider'
import { RecsProvider } from '@/providers/recs-provider'

const baseProfile: ProfileDetail = {
  user_id: 1,
  nickname: '美咲',
  age: 42,
  prefecture: '東京都',
  bio: 'よろしくお願いします',
  online: 'online',
  images: [
    { id: 1, url: '/profiles/woman-1.png', sort_order: 0 },
    { id: 2, url: '/profiles/woman-2.png', sort_order: 1 },
  ],
  tags: [],
  already_liked: false,
}

const nextProfile: ProfileDetail = {
  user_id: 2,
  nickname: '由香里',
  age: 27,
  prefecture: '神奈川県',
  bio: 'よろしくお願いします',
  online: 'online',
  images: [{ id: 3, url: '/profiles/woman-2.png', sort_order: 0 }],
  tags: [],
  already_liked: false,
}

function WithProviders({
  children,
  recs = [baseProfile],
}: {
  children: React.ReactNode
  recs?: ProfileDetail[]
}) {
  return (
    <QueryProvider>
      <RecsProvider initialRecs={recs}>
        <div style={{ width: 340, height: 600 }}>{children}</div>
      </RecsProvider>
    </QueryProvider>
  )
}

const meta = {
  title: 'recs/SwipeCardDeck',
  component: SwipeCardDeck,
  decorators: [
    (Story) => (
      <WithProviders>
        <Story />
      </WithProviders>
    ),
  ],
} satisfies Meta<typeof SwipeCardDeck>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithNextProfile: Story = {
  decorators: [
    (Story) => (
      <WithProviders recs={[baseProfile, nextProfile]}>
        <Story />
      </WithProviders>
    ),
  ],
}

export const ChangePhoto: Story = {
  play: async ({ canvas }) => {
    // next/imageが最適化用のクエリパラメータ(?w=...&q=...)を付与するため部分一致で検証
    await expect(canvas.getByAltText('美咲さんの写真')).toHaveAttribute(
      'src',
      expect.stringContaining('/profiles/woman-1.png'),
    )

    await userEvent.click(canvas.getByRole('button', { name: '次の写真' }))
    await expect(canvas.getByAltText('美咲さんの写真')).toHaveAttribute(
      'src',
      expect.stringContaining('/profiles/woman-2.png'),
    )
  },
}
