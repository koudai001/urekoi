import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { Toaster } from '@/components/ui/sonner'
import { showMatchToast } from './match-toast'

function MatchToastTrigger() {
  return (
    <>
      <Toaster />
      <button onClick={() => showMatchToast('美咲', 24)}>トーストを表示</button>
    </>
  )
}

const meta = {
  title: 'likes/MatchToast',
  component: MatchToastTrigger,
} satisfies Meta<typeof MatchToastTrigger>

export default meta
type Story = StoryObj<typeof meta>

// ボタンを押すとマッチトーストが表示されることを確認
export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'トーストを表示' }),
    )

    await waitFor(() =>
      expect(
        canvas.getByText('美咲さん(24)とマッチング！'),
      ).toBeInTheDocument(),
    )
  },
}
