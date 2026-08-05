import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BottomBar } from './bottom-bar'

const meta = {
  title: 'sidebar/BottomBar',
  component: BottomBar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen flex-col justify-end bg-swipe-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BottomBar>

export default meta
type Story = StoryObj<typeof meta>

export const Recs: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: '/recs' },
    },
  },
}

export const Likes: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: '/likes/from-partner-card' },
    },
  },
}

export const Messages: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: '/messages' },
    },
  },
}

export const MyProfile: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: '/myprofile' },
    },
  },
}
