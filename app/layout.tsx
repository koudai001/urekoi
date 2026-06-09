import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Noto_Sans_JP, Shippori_Mincho } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})
const shipporiMincho = Shippori_Mincho({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Anémone（アネモネ） | 大人の女性と年下男性のためのマッチング',
  description: '熟女と年下男性のための上質なマッチングアプリ',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${shipporiMincho.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
