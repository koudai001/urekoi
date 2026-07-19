import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { Toaster } from '@/components/ui/sonner'
import { showSkipToast } from './skip-toast'

function SkipToastTrigger() {
  return (
    <>
      <Toaster />
      <button onClick={() => showSkipToast('美咲')}>トーストを表示</button>
    </>
  )
}

const meta = {
  title: 'likes/SkipToast',
  component: SkipToastTrigger,
} satisfies Meta<typeof SkipToastTrigger>

export default meta
type Story = StoryObj<typeof meta>

// ボタンを押すとスキップトーストが表示されることを確認
export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'トーストを表示' }),
    )

    await waitFor(() =>
      expect(
        canvas.getByText('美咲さんをスキップしました 👋'),
      ).toBeInTheDocument(),
    )
  },
}
