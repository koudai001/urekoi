import type { Preview } from '@storybook/nextjs-vite'
import { sb } from 'storybook/test'

import '../app/globals.css'

sb.mock(import('../actions/likes.ts'))
sb.mock(import('../actions/messages.ts'))
sb.mock(import('../actions/myprofile.ts'))
sb.mock(import('../actions/profile-images.ts'))
sb.mock(import('../hooks/use-received-likes.ts'))
sb.mock(import('../hooks/use-match-profiles.ts'))
sb.mock(import('../hooks/use-messages.ts'))
sb.mock(import('../hooks/use-my-profile.ts'))

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
