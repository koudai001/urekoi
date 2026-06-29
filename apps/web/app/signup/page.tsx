"use client"

import { useActionState, useState } from "react"
import { Mail, MessageCircle, ArrowLeft } from "lucide-react"
import { signup } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

type Step = "select" | "email"

export default function SignupPage() {
  const [step, setStep] = useState<Step>("select")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [state, formAction, isPending] = useActionState(signup, null) //stateの初期値をnullに設定

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
            <Button
              type="button"
              className="h-auto w-full gap-3 rounded-full bg-line py-4 text-base font-bold text-white hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5 fill-white" />
              LINEで新規登録
            </Button>

            {/* メールアドレス */}
            <Button
              type="button"
              onClick={() => setStep("email")}
              className="h-auto w-full gap-3 rounded-full py-4 text-base font-bold hover:opacity-90"
            >
              <Mail className="h-5 w-5" />
              メールアドレスで新規登録
            </Button>
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
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setStep("select")
              setEmail("")
              setPassword("")
            }}
            className="mb-6 h-auto gap-1.5 p-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-card-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>

          <form className="flex flex-col gap-7" action={formAction}>
            {/* メール */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-base font-bold text-card-foreground"
              >
                メールアドレス
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sample@sample.com"
                className="h-auto w-full rounded-none border-0 border-b border-border bg-transparent p-0 pb-2 text-lg focus-visible:border-primary focus-visible:ring-0"
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
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
              />
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

            {/* 結果表示 */}
            {state?.success === false && (
              <p className="text-sm font-medium text-destructive">
                {state.error}
              </p>
            )}
            {state?.success === true && (
              <p className="text-sm font-medium text-primary">
                登録が完了しました。
              </p>
            )}

            {/* 登録ボタン */}
            <Button
              type="submit"
              disabled={isPending}
              className="mt-2 h-auto w-full rounded-full py-4 text-base font-bold hover:opacity-90"
            >
              {isPending ? "登録中..." : "登録する"}
            </Button>
          </form>
        </div>
      )}
    </main>
  )
}
