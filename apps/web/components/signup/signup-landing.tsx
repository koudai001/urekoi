import Image from 'next/image'
import Link from 'next/link'
import { Apple, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GoogleSignInButton } from './google-signin-button'

export function SignupLanding({
  onSelectEmail,
}: {
  onSelectEmail: () => void
}) {
  return (
    <main className="flex min-h-svh flex-col bg-background px-6 py-6 text-foreground">
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center gap-10">
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
            <p className="text-lg font-bold text-foreground">熟恋へようこそ</p>
            <p className="text-sm font-semibold tracking-[0.12em] text-muted-foreground">
              大人の出会いを、もっと自然に
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button
            type="button"
            onClick={onSelectEmail}
            className="h-11 w-full gap-2.5 rounded-full bg-gradient-to-br from-primary to-primary text-base font-extrabold text-white hover:opacity-90"
          >
            <Mail className="h-5 w-5" />
            メールアドレスで新規登録
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2.5 rounded-full border-border bg-transparent text-base font-bold text-foreground hover:bg-card hover:text-foreground"
          >
            <Apple className="h-5 w-5 fill-current" />
            Appleで始める
          </Button>
          <GoogleSignInButton text="signup_with" />

          <Link
            href="/login"
            className="mt-1 py-3 text-center text-sm font-semibold text-primary underline underline-offset-4"
          >
            ログインはこちら
          </Link>

          <div className="flex justify-center gap-4 pt-1 text-xs text-muted-foreground">
            <span>利用規約</span>
            <span>プライバシーポリシー</span>
          </div>
        </div>
      </div>
    </main>
  )
}
