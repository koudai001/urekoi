'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// アプリ全体でTanStack Queryのキャッシュを共有するProvider
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // 初期化時にQueryClientを作成し、アプリ全体で共有する
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000 },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
