import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, mocked, userEvent, waitFor } from 'storybook/test'
import * as useMessagesModule from './use-messages'
import * as messagesActions from '@/actions/messages'

import { ChatView } from './chat-view'
import type {
  MatchProfile,
  MessageResponse,
} from '@/generated/urekoiAPI.schemas'

const dummyMatch: MatchProfile = {
  match_id: 1,
  user_id: 2,
  nickname: '美咲',
  age: 42,
  prefecture: '東京都',
  image: '/profiles/woman-5.png',
}

// BEは新しい順で返す
const dummyMessages: MessageResponse[] = [
  {
    id: 2,
    sender_user_id: 2,
    body: 'よろしくお願いします',
    created_at: '2026-01-01T10:05:00+09:00',
  },
  {
    id: 1,
    sender_user_id: 1,
    body: 'こんにちは',
    created_at: '2026-01-01T10:00:00+09:00',
  },
]

const meta = {
  title: 'messages/ChatView',
  component: ChatView,
  args: {
    match: dummyMatch,
    onBack: () => {},
  },
  // 各storyでの上書きが無い場合は、ダミーのメッセージ履歴を返す
  beforeEach: () => {
    mocked(useMessagesModule.useMessages).mockReturnValue({
      data: dummyMessages,
      mutate: async () => undefined,
    } as unknown as ReturnType<typeof useMessagesModule.useMessages>)
  },
} satisfies Meta<typeof ChatView>

export default meta
type Story = StoryObj<typeof meta>

// 相手の名前とメッセージが古い順に表示されることを確認
export const WithMessages: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('美咲')).toBeInTheDocument()
    await expect(canvas.getByText('こんにちは')).toBeInTheDocument()
    await expect(canvas.getByText('よろしくお願いします')).toBeInTheDocument()
  },
}

// メッセージを送信するとsendMessageが呼ばれ、入力欄がクリアされることを確認
export const SendMessage: Story = {
  beforeEach: () => {
    // 送信した「はじめまして」がそのまま保存された想定のレスポンス
    mocked(messagesActions.sendMessage).mockResolvedValue({
      success: true,
      message: {
        id: 3,
        sender_user_id: 1,
        body: 'はじめまして',
        created_at: '2026-01-01T10:10:00+09:00',
      },
    })
  },
  play: async ({ canvas }) => {
    const input = canvas.getByPlaceholderText('メッセージを入力')
    const sendButton = canvas.getByRole('button', { name: '送信' })
    await userEvent.type(input, 'はじめまして')
    await userEvent.click(sendButton)

    await waitFor(() =>
      expect(messagesActions.sendMessage).toHaveBeenCalledWith(
        1,
        'はじめまして',
      ),
    )
    await waitFor(() => expect(input).toHaveValue(''))
    // 送信完了後、ボタンがdisabledのままになっていないことを確認
    await waitFor(() => expect(sendButton).not.toBeDisabled())
  },
}
