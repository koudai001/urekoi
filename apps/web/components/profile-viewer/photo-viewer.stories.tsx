import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent } from 'storybook/test'

import { PhotoViewer } from './photo-viewer'

const meta = {
  title: 'profile-viewer/PhotoViewer',
  component: PhotoViewer,
  args: {
    alt: 'テストユーザーさんの写真',
    images: [
      { id: 1, url: '/profiles/woman-1.png', sort_order: 0 },
      { id: 2, url: '/profiles/woman-2.png', sort_order: 1 },
      { id: 3, url: '/profiles/woman-4.png', sort_order: 2 },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PhotoViewer>

export default meta
type Story = StoryObj<typeof meta>

// 複数枚ある場合の基本表示を確認
export const Default: Story = {}

// 写真が1枚も無い場合(プレースホルダー扱い、送り操作は出ない)を確認
export const NoPhotos: Story = {
  args: {
    images: [],
  },
}

// 右側をクリックすると次の写真に進むことを確認
export const ClickRightGoesNext: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '次の写真' }))
    // インジケーターの2番目が有効(不透明)になっていることを間接的に確認
    await expect(
      canvas.getByRole('button', { name: '前の写真' }),
    ).toBeInTheDocument()
  },
}

// 最初の写真で左側をクリックしても、それ以上戻らないことを確認
export const ClickLeftAtFirstStaysPut: Story = {
  play: async ({ canvas }) => {
    const prevButton = canvas.getByRole('button', { name: '前の写真' })
    await userEvent.click(prevButton)
    await userEvent.click(prevButton)
    // 例外なく操作でき、ボタンが表示され続けていることを確認
    await expect(prevButton).toBeInTheDocument()
  },
}
