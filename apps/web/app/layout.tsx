import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/providers/query-provider'
import './globals.css'

export const metadata: Metadata = {
  title: '熟恋',
  description: '熟女と年下男性のためのマッチングアプリ',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="bg-background">
      <body className="font-sans antialiased">
        <QueryProvider>
          {children}
          <Toaster position="bottom-left" />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </QueryProvider>
      </body>
    </html>
  )
}
