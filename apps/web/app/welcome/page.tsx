import Link from 'next/link'

// 初回訪問時に登録・ログインの入口を案内する
export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-16 bg-background px-6 text-foreground">
      <header className="text-center">
        <h1 className="text-6xl font-bold tracking-widest">熟恋</h1>
        <p className="mt-2 text-md font-bold tracking-widest">UREKOI</p>
      </header>

      <div className="flex flex-col gap-3">
        <Link
          href="/signup"
          className="flex h-16 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white"
        >
          新しくはじめる（無料）
        </Link>
        <Link
          href="/login"
          className="flex h-16 items-center justify-center rounded-xl border border-border text-lg font-semibold"
        >
          すでに登録されている方はこちら
        </Link>

        <p className="pt-3 text-center text-xs text-muted-foreground">
          <span className="underline underline-offset-2">利用規約</span>、
          <span className="underline underline-offset-2">
            プライバシーポリシー
          </span>
          に同意してはじめる
        </p>
      </div>
    </main>
  )
}
