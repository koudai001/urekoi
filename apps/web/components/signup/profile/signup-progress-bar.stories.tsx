import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Smile } from 'lucide-react'

import { SignupProgressBar } from './signup-progress-bar'

const meta = {
  title: 'signup/SignupProgressBar',
  component: SignupProgressBar,
  args: {
    icon: <Smile className="h-5 w-5" />,
    currentStep: 1,
    totalSteps: 4,
  },
} satisfies Meta<typeof SignupProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Step1: Story = {}

export const Step2: Story = {
  args: { currentStep: 2 },
}

export const Step3: Story = {
  args: { currentStep: 3 },
}

export const LastStep: Story = {
  args: { currentStep: 4 },
}
