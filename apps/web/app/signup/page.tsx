'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Smile,
  Timer,
} from 'lucide-react'
import { signup } from '@/actions/auth'
import { AuthLogo } from '@/components/ui/auth-logo'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'

type Step = 'select' | 'consent' | 'intro' | 'gender' | 'email'
type Gender = 'male' | 'female'

export default function SignupPage() {
  const [step, setStep] = useState<Step>('select')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAdult, setIsAdult] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [gender, setGender] = useState<Gender | null>(null)
  const [state, formAction, isPending] = useActionState(signup, null) //stateの初期値をnullに設定
  const canProceed = isAdult && agreeTerms

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <AuthLogo />

      {step === 'select' ? (
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
              onClick={() => setStep('consent')}
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
      ) : step === 'consent' ? (
        /* ===== ステップ2: 注意事項への同意 ===== */
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
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-transparent'
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
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-transparent'
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
            onClick={() => setStep('intro')}
            className="mt-8 w-full rounded-full bg-primary py-4 text-base font-bold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            内容に同意して進む
          </button>
        </div>
      ) : step === 'intro' ? (
        /* ===== ステップ3: オンボーディング導入 ===== */
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
              onClick={() => setStep('gender')}
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
      ) : step === 'gender' ? (
        /* ===== ステップ4: 性別選択 ===== */
        <div className="flex min-h-[520px] w-full max-w-md flex-col rounded-3xl bg-card p-8 shadow-sm">
          {/* 進捗バー */}
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Smile className="h-5 w-5" />
            </span>
            <span className="flex flex-1 items-center gap-1.5 overflow-hidden">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-border"
                />
              ))}
            </span>
          </div>

          {/* 見出し */}
          <h1 className="mt-8 text-2xl font-bold text-card-foreground text-balance">
            あなたの性別を教えてください
          </h1>

          {/* 選択肢 */}
          <div className="mt-8 flex justify-center gap-6">
            {(
              [
                { value: 'male', label: '男性', image: '/profiles/me-1.png' },
                {
                  value: 'female',
                  label: '女性',
                  image: '/profiles/woman-1.png',
                },
              ] as const
            ).map((option) => {
              const selected = gender === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGender(option.value)}
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-3 rounded-full p-4 transition-all ${
                    selected
                      ? 'bg-primary/15 ring-2 ring-primary'
                      : 'bg-secondary hover:bg-secondary/70'
                  }`}
                >
                  <span className="h-24 w-24 overflow-hidden rounded-full border-2 border-card shadow-sm">
                    <Image
                      src={option.image || '/placeholder.svg'}
                      alt={option.label}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="text-lg font-bold text-card-foreground">
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 下部ナビ */}
          <div className="mt-auto flex items-center justify-between pt-8">
            <button
              type="button"
              onClick={() => setStep('intro')}
              aria-label="前へ戻る"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-card-foreground transition-colors hover:bg-secondary/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              disabled={!gender}
              onClick={() => setStep('email')}
              aria-label="次へ進む"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        /* ===== ステップ5: メールアドレス＋パスワード ===== */
        <div className="w-full max-w-md">
          <BackButton onClick={() => setStep('gender')} />

          <form className="flex flex-col gap-7" action={formAction}>
            {/* genderステップで選択済みの性別をhiddenで送信 */}
            <input type="hidden" name="gender" value={gender ?? ''} />

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
              <a
                href="#"
                className="font-bold text-card-foreground hover:underline"
              >
                利用規約
              </a>
              、
              <a
                href="#"
                className="font-bold text-card-foreground hover:underline"
              >
                プライバシーポリシー
              </a>
              、
              <a
                href="#"
                className="font-bold text-card-foreground hover:underline"
              >
                コミュニティガイドライン
              </a>
              に同意したこととみなします。
            </p>

            {/* 結果表示（エラーの場合） */}
            {state?.success === false && (
              <p className="text-sm font-medium text-destructive">
                {state.error}
              </p>
            )}

            {/* 登録ボタン */}
            <Button
              type="submit"
              disabled={isPending}
              className="mt-2 h-auto w-full rounded-full py-4 text-base font-bold hover:opacity-90"
            >
              {isPending ? '登録中...' : '登録する'}
            </Button>
          </form>
        </div>
      )}
    </main>
  )
}
