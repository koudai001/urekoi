'use client'

import { useWsConnection } from '@/hooks/use-ws-connection'

// ログイン後の画面全体でユーザー単位のWebSocket接続を1本だけ維持する。
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useWsConnection()

  return children
}
