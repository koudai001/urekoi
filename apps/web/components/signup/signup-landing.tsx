import Image from 'next/image'
import { Apple, Mail, MessageCircle } from 'lucide-react'
import { AuthLogo } from '@/components/ui/auth-logo'
import { Button } from '@/components/ui/button'

// Googleの4色ロゴマーク(lucide-reactには収録されていないため個別実装)
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
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

// signupフローの入口。登録方法の選択(LINE/Apple/Google/メール)を行う
export function SignupLanding({
  onSelectEmail,
}: {
  onSelectEmail: () => void
}) {
  return (
    <main className="flex min-h-svh justify-center bg-card">
      <div className="grid w-full max-w-[1280px] grid-cols-[minmax(360px,480px)_1fr]">
        <div className="flex flex-col justify-center px-14 py-16">
          <AuthLogo align="left" />

          <span className="mb-2.5 self-start rounded-full bg-accent px-4 py-1.5 text-[13px] font-bold text-accent-foreground">
            お得な情報をお届けします!
          </span>

          <div className="flex flex-col gap-3.5">
            {/* LINE（ダミー） */}
            <Button
              type="button"
              className="h-auto w-full gap-2.5 rounded-full bg-line py-4 text-base font-bold text-white hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5 fill-white" />
              LINEで新規登録
            </Button>

            {/* Apple（ダミー） */}
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full gap-2.5 rounded-full py-4 text-base font-bold"
            >
              <Apple className="h-5 w-5" />
              Appleで新規登録
            </Button>

            {/* Google（ダミー） */}
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full gap-2.5 rounded-full py-4 text-base font-bold"
            >
              <GoogleIcon />
              Googleで新規登録
            </Button>

            {/* メールアドレス */}
            <Button
              type="button"
              onClick={onSelectEmail}
              className="h-auto w-full gap-2.5 rounded-full py-4 text-base font-bold hover:opacity-90"
            >
              <Mail className="h-5 w-5" />
              メールアドレスではじめる
            </Button>
          </div>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            熟恋は、大人の女性と年下男性のためのマッチングサービスです。18歳未満の方・独身でない方・上記をご理解いただけない方は、ご登録いただけません。
          </p>

          <div className="mt-10 flex flex-col items-start gap-2.5">
            <a
              href="#"
              className="text-sm font-bold text-primary hover:underline"
            >
              新規登録でお困りの方はこちら
            </a>
            <a
              href="/login"
              className="text-base font-bold text-card-foreground hover:underline"
            >
              ログインはこちら
            </a>
          </div>
        </div>

        <div className="relative hidden overflow-hidden sm:block">
          <Image
            src="/profiles/woman-8.png"
            alt="登録イメージ"
            fill
            priority
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, color-mix(in oklch, var(--card-foreground) 8%, transparent) 0%, transparent 30%, transparent 70%, color-mix(in oklch, var(--card-foreground) 28%, transparent) 100%)',
            }}
          />
          <span className="absolute right-6 bottom-6 rounded-full bg-card/92 px-[18px] py-2 text-[13px] text-muted-foreground">
            利用規約・プライバシーポリシーなど
          </span>
        </div>
      </div>
    </main>
  )
}
