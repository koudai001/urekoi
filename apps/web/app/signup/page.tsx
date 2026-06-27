"use client"

import { useState } from "react"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      {/* ロゴ */}
      <div className="mb-8 flex flex-col items-center leading-none">
        <span className="font-heading text-4xl font-bold tracking-tight text-primary">
          熟恋
        </span>
        <span className="mt-1 text-xs font-medium tracking-[0.3em] text-muted-foreground">
          UREKOI
        </span>
      </div>

      {/* カード */}
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-lg sm:p-10">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Mail className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-5 text-balance text-center font-heading text-2xl font-bold text-card-foreground">
            アカウントを作成
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
            メールアドレスとパスワードを入力してください
          </p>
        </div>

        <form
          className="mt-8 flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          {/* メール */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-card-foreground"
            >
              メールアドレス
            </label>
            <div className="flex items-center gap-3 border-b border-border pb-2 focus-within:border-primary">
              <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sample@example.com"
                className="w-full bg-transparent text-base text-card-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* パスワード */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-card-foreground"
            >
              パスワード
            </label>
            <div className="flex items-center gap-3 border-b border-border pb-2 focus-within:border-primary">
              <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上のパスワード"
                className="w-full bg-transparent text-base text-card-foreground outline-none placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                className="shrink-0 text-muted-foreground transition-colors hover:text-card-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              半角英数字8文字以上で設定してください
            </p>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-primary py-3.5 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            メールアドレスでログイン
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちの方は{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            ログイン
          </a>
        </p>
      </div>

      <p className="mt-8 max-w-md text-center text-xs leading-relaxed text-muted-foreground">
        登録することで、
        <a href="#" className="text-primary hover:underline">
          利用規約
        </a>
        および
        <a href="#" className="text-primary hover:underline">
          プライバシーポリシー
        </a>
        に同意したものとみなされます。
      </p>
    </main>
  )
}
