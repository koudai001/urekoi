"use client"

import Image from "next/image"
import { useState } from "react"
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check, Timer } from "lucide-react"

type Step = "consent" | "intro" | "email"

export default function SignupPage() {
  const [step, setStep] = useState<Step>("consent")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isAdult, setIsAdult] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const canProceed = isAdult && agreeTerms

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

      {step === "consent" ? (
        /* ===== ステップ0: 注意事項への同意 ===== */
        <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-sm">
          <p className="mb-8 text-center text-sm leading-relaxed text-muted-foreground">
            熟恋は、大人の女性と年下男性のためのマッチングサービスです。
            <br />
            ご登録の前に、以下の内容をご確認ください。
          </p>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setIsAdult((v) => !v)}
              className="flex w-full items-center gap-3 text-left"
              aria-pressed={isAdult}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                  isAdult
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent"
                }`}
              >
                {isAdult && <Check className="h-4 w-4" strokeWidth={3} />}
              </span>
              <span className="text-base text-card-foreground">
                私は18歳以上で独身です
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAgreeTerms((v) => !v)}
              className="flex w-full items-center gap-3 text-left"
              aria-pressed={agreeTerms}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                  agreeTerms
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent"
                }`}
              >
                {agreeTerms && <Check className="h-4 w-4" strokeWidth={3} />}
              </span>
              <span className="text-base text-card-foreground">
                すべての規約
                <span className="text-primary">*</span>に同意します
              </span>
            </button>
          </div>

          <p className="mt-5 text-sm font-medium text-primary">
            <span>*</span>
            <a href="#" className="hover:underline">
              利用規約
            </a>
            ・
            <a href="#" className="hover:underline">
              プライバシーポリシー
            </a>
            への同意が必要です
          </p>

          <button
            type="button"
            disabled={!canProceed}
            onClick={() => setStep("intro")}
            className="mt-8 w-full rounded-full bg-primary py-4 text-base font-bold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            内容に同意して進む
          </button>
        </div>
      ) : step === "intro" ? (
        /* ===== ステップ1: オンボーディング導入 ===== */
        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-sm">
          {/* 上部：所要時間 */}
          <div className="flex items-center justify-center gap-2 px-8 pt-8 text-sm font-bold text-muted-foreground">
            <Timer className="h-4 w-4" />
            このステップは概ね30秒で完了します
          </div>

          {/* Step1 チップ＋見出し */}
          <div className="px-8 pb-8 pt-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">
                Step1
              </span>
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
              </span>
            </div>

            <h1 className="mt-6 text-3xl font-bold leading-snug text-card-foreground text-balance">
              まず、あなたのことを
              <br />
              教えてください
            </h1>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              次へ
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* 下部：ビジュアルパネル */}
          <div className="relative flex h-72 items-center justify-center overflow-hidden bg-accent">
            <div className="h-60 w-52 overflow-hidden rounded-2xl border-4 border-card shadow-lg">
              <Image
                src="/profiles/woman-3.png"
                alt="登録イメージ"
                width={208}
                height={240}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ===== ステップ2: メールアドレス＋パスワード ===== */
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => setStep("intro")}
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
