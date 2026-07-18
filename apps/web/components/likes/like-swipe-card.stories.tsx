import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, mocked, userEvent, waitFor } from 'storybook/test'
import * as likesActions from '@/actions/likes'

import { LikeSwipeCard } from './like-swipe-card'
import { showMatchToast } from './match-toast'
import { Toaster } from '@/components/ui/sonner'
import type { LikeProfile } from '@/generated/urekoiAPI.schemas'

const baseProfile: LikeProfile = {
  user_id: 1,
  nickname: '美咲',
  age: 42,
  prefecture: '東京都',
  online: 'online',
  photos: ['/profiles/woman-1.png', '/profiles/woman-2.png'],
}

const meta = {
  title: 'likes/LikeSwipeCard',
  component: LikeSwipeCard,
  args: {
    profile: baseProfile,
    onSwipe: fn(),
  },
} satisfies Meta<typeof LikeSwipeCard>

export default meta
type Story = StoryObj<typeof meta>

// 1枚のみのカードが表示されることを確認
export const Default: Story = {}

// 次の人がいる場合、背後にそのカードが少し覗いて見えることを確認
export const WithNextProfile: Story = {
  args: {
    nextProfile: {
      user_id: 2,
      nickname: '由香里',
      age: 27,
      prefecture: '神奈川県',
      online: 'online',
      photos: ['/profiles/woman-2.png'],
    },
  },
}

// 写真送りボタンで写真が切り替わり、最後の次は最初にループすることを確認
export const ChangePhoto: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('1 / 2')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: '次の写真' }))
    await expect(canvas.getByText('2 / 2')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: '次の写真' }))
    await expect(canvas.getByText('1 / 2')).toBeInTheDocument()
  },
}

// 下部のいいねボタンを押すと、アニメーション後にonSwipeが'like'付きで呼ばれることを確認
export const LikeButtonTriggersSwipe: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'いいね！を送る' }),
    )

    await waitFor(() => expect(args.onSwipe).toHaveBeenCalledWith('like'))
  },
}

// 下部のスキップボタンを押すと、アニメーション後にonSwipeが'skip'付きで呼ばれることを確認
export const SkipButtonTriggersSwipe: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'スキップ' }))

    await waitFor(() => expect(args.onSwipe).toHaveBeenCalledWith('skip'))
  },
}

// 閾値を超えて右にドラッグすると、アニメーション後にonSwipeが'like'付きで呼ばれることを確認
export const DragRightBeyondThreshold: Story = {
  play: async ({ canvas, args }) => {
    const image = canvas.getByAltText('美咲さんの写真')

    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: image, coords: { x: 0, y: 0 } },
      { coords: { x: 200, y: 0 } },
      { keys: '[/MouseLeft]' },
    ])

    await waitFor(() => expect(args.onSwipe).toHaveBeenCalledWith('like'))
  },
}

// 閾値を超えて左にドラッグすると、アニメーション後にonSwipeが'skip'付きで呼ばれることを確認
export const DragLeftBeyondThreshold: Story = {
  play: async ({ canvas, args }) => {
    const image = canvas.getByAltText('美咲さんの写真')

    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: image, coords: { x: 0, y: 0 } },
      { coords: { x: -200, y: 0 } },
      { keys: '[/MouseLeft]' },
    ])

    await waitFor(() => expect(args.onSwipe).toHaveBeenCalledWith('skip'))
  },
}

// いいねを送ってマッチが成立した場合、マッチトーストが表示されることを確認
export const MatchOnLike: Story = {
  args: {
    // 実際のページと同じく、onSwipe側でいいね送信とトースト表示を行う
    onSwipe: fn(async (dir: 'like' | 'skip') => {
      if (dir !== 'like') return
      const result = await likesActions.sendLike(baseProfile.user_id ?? 0)
      if (result.success && result.matched) {
        showMatchToast(baseProfile.nickname ?? '', baseProfile.age ?? 0)
      }
    }),
  },
  decorators: [
    (StoryFn) => (
      <>
        <StoryFn />
        <Toaster />
      </>
    ),
  ],
  beforeEach: () => {
    mocked(likesActions.sendLike).mockResolvedValue({
      success: true,
      matched: true,
    })
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'いいね！を送る' }),
    )

    await waitFor(() =>
      expect(
        canvas.getByText('美咲さん(42)とマッチング！'),
      ).toBeInTheDocument(),
    )
  },
}

// 閾値未満のドラッグでは確定せず、元の位置にスナックバックしてonSwipeが呼ばれないことを確認
export const DragBelowThresholdSnapsBack: Story = {
  play: async ({ canvas, args }) => {
    const image = canvas.getByAltText('美咲さんの写真')

    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: image, coords: { x: 0, y: 0 } },
      { coords: { x: 50, y: 0 } },
      { keys: '[/MouseLeft]' },
    ])

    // アニメーション時間(280ms)より長く待ってもonSwipeは呼ばれない
    await new Promise((resolve) => setTimeout(resolve, 400))
    await expect(args.onSwipe).not.toHaveBeenCalled()
  },
}
