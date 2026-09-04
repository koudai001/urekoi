import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mocked } from 'storybook/test'
import * as useReceivedLikesModule from '@/hooks/use-received-likes'
import { PendingLikes } from './pending-likes'

const profiles = [
  createProfile(1, '美咲', 42, '東京都', '/profiles/woman-1.png'),
  createProfile(2, '由香里', 38, '神奈川県', '/profiles/woman-2.png'),
  createProfile(3, '恵', 45, '千葉県', '/profiles/woman-3.png'),
  createProfile(4, '智子', 40, '埼玉県', '/profiles/woman-4.png'),
]
const queryClient = new QueryClient()

const meta = {
  title: 'likes/PendingLikes',
  component: PendingLikes,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="mx-auto flex h-screen w-full max-w-md flex-col bg-background">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  beforeEach: () => {
    // 受信したいいね一覧を返し、ユーザーがいる状態を表示する
    mockReceivedLikes(profiles)
  },
} satisfies Meta<typeof PendingLikes>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  beforeEach: () => {
    // 空の一覧を返し、いいねがない状態を表示する
    mockReceivedLikes([])
  },
}

// 一覧表示に必要なプロフィール情報を生成する
function createProfile(
  userId: number,
  nickname: string,
  age: number,
  prefecture: string,
  imageUrl: string,
) {
  return {
    user_id: userId,
    nickname,
    age,
    prefecture_code: userId,
    prefecture,
    bio: 'よろしくお願いします',
    occupation: '会社員',
    hometown: prefecture,
    blood_type: 'A型',
    mbti: 'ENFP',
    body_type: '普通',
    education: '大学卒',
    holiday: '土日',
    alcohol: 'ときどき飲む',
    smoking: '吸わない',
    height_cm: 160,
    tag_ids: [],
    tags: [],
    images: [{ id: userId, url: imageUrl, sort_order: 0 }],
    already_liked: false,
  }
}

// フックの返却値をStoryごとの受信いいね一覧に差し替える
function mockReceivedLikes(profiles: ReturnType<typeof createProfile>[]) {
  mocked(useReceivedLikesModule.useReceivedLikes).mockReturnValue({
    data: { total: profiles.length, profiles },
    isPending: false,
  } as unknown as ReturnType<typeof useReceivedLikesModule.useReceivedLikes>)
}
