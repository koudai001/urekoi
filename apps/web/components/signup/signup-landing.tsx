import Image from 'next/image'
import Link from 'next/link'
import { Apple, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function SignupLanding({
  onSelectEmail,
}: {
  onSelectEmail: () => void
}) {
  return (
    <main className="flex min-h-svh flex-col bg-swipe-background px-6 py-6 text-swipe-foreground">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/login/urekoi-icon-final.png"
            alt="熟恋"
            width={224}
            height={224}
            priority
            className="h-56 w-56 rounded-full shadow-2xl"
          />
          <div className="space-y-1.5 text-center">
            <p className="text-lg font-bold text-swipe-foreground">
              熟恋へようこそ
            </p>
            <p className="text-sm font-semibold tracking-[0.12em] text-swipe-muted-foreground">
              大人の出会いを、もっと自然に
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button
            type="button"
            onClick={onSelectEmail}
            className="h-auto w-full gap-2.5 rounded-full bg-gradient-to-br from-swipe-accent to-primary py-4 text-base font-extrabold text-white hover:opacity-90"
          >
            <Mail className="h-5 w-5" />
            メールアドレスで新規登録
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto w-full gap-2.5 rounded-full border-swipe-border bg-transparent py-4 text-base font-bold text-swipe-foreground hover:bg-swipe-surface hover:text-swipe-foreground"
          >
            <Apple className="h-5 w-5 fill-current" />
            Appleで始める
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto w-full gap-2.5 rounded-full border-swipe-border bg-transparent py-4 text-base font-bold text-swipe-foreground hover:bg-swipe-surface hover:text-swipe-foreground"
          >
            <GoogleIcon />
            Googleで始める
          </Button>

          <Link
            href="/login"
            className="mt-1 py-3 text-center text-sm font-semibold text-swipe-accent underline underline-offset-4"
          >
            ログインはこちら
          </Link>

          <div className="flex justify-center gap-4 pt-1 text-xs text-swipe-muted-foreground">
            <span>利用規約</span>
            <span>プライバシーポリシー</span>
          </div>
        </div>
      </div>
    </main>
  )
}
