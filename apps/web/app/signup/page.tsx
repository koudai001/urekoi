"use client"

import { useState } from "react"
import { Mail, Lock, Eye, EyeOff, MessageCircle, ArrowLeft } from "lucide-react"

type Step = "select" | "email"

export default function SignupPage() {
  const [step, setStep] = useState<Step>("select")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      {/* ロゴ */}
      <div className="mb-8 flex flex-col items-center leading-none">
        <span className="font-heading text-5xl font-bold tracking-tight text-primary">
          熟恋
        </span>
        <span className="mt-2 text-xs font-medium tracking-[0.3em] text-muted-foreground">
          UREKOI
        </span>
      </div>

      {step === "select" ? (
        /* ===== ステップ1: 登録方法の選択 ===== */
        <div className="flex w-full max-w-md flex-col items-center">
          <div className="flex w-full flex-col gap-4">
            {/* LINE（ダミー） */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#06c755] py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5 fill-white" />
              LINEで新規登録
            </button>

            {/* メールアドレス */}
            <button
              type="button"
              onClick={() => setStep("email")}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Mail className="h-5 w-5" />
              メールアドレスで新規登録
            </button>
          </div>

          <p className="mt-6 w-full text-left text-sm leading-relaxed text-muted-foreground">
            熟恋は、大人の女性と年下男性のためのマッチングサービスです。
            <br />
            18歳未満の方・独身でない方・上記をご理解いただけない方は、ご登録いただけません。
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href="#"
              className="text-sm font-medium text-primary hover:underline"
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
      ) : (
        /* ===== ステップ2: メールアドレス＋パスワード ===== */
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => setStep("select")}
            className="mb-6 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-card-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </button>

          <form
            className="flex flex-col gap-7"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            {/* メール */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-base font-bold text-card-foreground"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sample@sample.com"
                className="w-full border-b border-border bg-transparent pb-2 text-lg text-card-foreground outline-none transition-colors focus:border-primary placeholder:text-muted-foreground/50"
              />
            </div>

            {/* パスワード */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-base font-bold text-card-foreground"
              >
                パスワード
              </label>
              <div className="flex items-center gap-3 border-b border-border pb-2 focus-within:border-primary">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワード"
                  className="w-full bg-transparent text-lg text-card-foreground outline-none placeholder:text-muted-foreground/50"
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
            </div>

            {/* 同意文 */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              アカウント登録すると、
              <a href="#" className="font-bold text-card-foreground hover:underline">
                利用規約
              </a>
              、
              <a href="#" className="font-bold text-card-foreground hover:underline">
                プライバシーポリシー
              </a>
              、
              <a href="#" className="font-bold text-card-foreground hover:underline">
                コミュニティガイドライン
              </a>
              に同意したこととみなします。
            </p>

            {/* 登録ボタン */}
            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-primary py-4 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              登録する
            </button>
          </form>
        </div>
      )}
    </main>
  )
}
