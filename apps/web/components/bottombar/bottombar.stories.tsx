import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BottomBar } from './bottombar'

const meta = {
  title: 'bottombar/BottomBar',
  component: BottomBar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen flex-col justify-end bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BottomBar>

export default meta
type Story = StoryObj<typeof meta>

export const Search: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: '/search' },
    },
  },
}

export const Likes: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: '/likes/pending' },
    },
  },
}
