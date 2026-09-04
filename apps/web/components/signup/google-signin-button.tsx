'use client'

import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { googleLogin } from '@/actions/auth'

// windowを拡張して、GISの型を定義する
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: 'outline' | 'filled_blue' | 'filled_black'
              size: 'large' | 'medium' | 'small'
              shape: 'rectangular' | 'pill'
              text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              logo_alignment: 'left' | 'center'
              width?: number
            },
          ) => void
          // One Tap(自動プロンプト)を表示する
          prompt: () => void
        }
      }
    }
  }
}

// クリックするとGoogle側で認証し、id_tokenをcallbackで受け取ってAPIに渡す
export function GoogleSignInButton({
  text,
  showOneTap = false,
}: {
  text: 'signin_with' | 'signup_with'
  // One Tap(自動プロンプト)を表示するかどうか
  showOneTap?: boolean
}) {
  const buttonRef = useRef<HTMLDivElement>(null)
  // SPA遷移で別ページから既にscriptが読み込み済みの場合、onLoadが呼ばれないため
  // 遅延初期化でマウント時点のwindow.googleの有無を直接見る
  const [isScriptLoaded, setIsScriptLoaded] = useState(
    () => typeof window !== 'undefined' && !!window.google,
  )
  const router = useRouter()
  // StrictMode(開発時)でuseEffectが2回走り、initialize/promptが二重発火するのを防ぐ
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!isScriptLoaded || !buttonRef.current || !window.google) return
    if (hasInitialized.current) return
    hasInitialized.current = true

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      callback: async (response) => {
        const result = await googleLogin(response.credential)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        router.push(result.hasProfile ? '/search' : '/signup/profile')
      },
    })

    // ボタンを表示する(他のボタンと同じくアイコン+文言を中央寄せにする)
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'filled_black',
      size: 'large',
      shape: 'rectangular',
      text,
      logo_alignment: 'left',
      width: buttonRef.current.offsetWidth,
    })

    // One Tap(自動プロンプト)を表示する
    if (showOneTap) {
      window.google.accounts.id.prompt()
    }
  }, [isScriptLoaded, text, showOneTap, router])

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />
      <div ref={buttonRef} />
    </>
  )
}
