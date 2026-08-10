import Image from 'next/image'
import { ArrowRight, Timer } from 'lucide-react'

// signupフローのステップ3。オンボーディング導入(プロフィール入力の案内)
export function SignupIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full max-w-md overflow-hidden">
      {/* 上部：所要時間 */}
      <div className="flex items-center justify-center gap-2 px-8 pt-8 text-sm font-bold text-swipe-muted-foreground">
        <Timer className="h-4 w-4" />
        このステップは概ね30秒で完了します
      </div>

      {/* Step1 チップ＋見出し */}
      <div className="px-8 pt-6 pb-8">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-swipe-accent px-4 py-1.5 text-sm font-bold text-white">
            Step1
          </span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-swipe-accent/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-swipe-accent/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-swipe-accent/40" />
          </span>
        </div>

        <p className="mt-6 text-base font-bold text-swipe-accent">
          熟恋へようこそ
        </p>
        <h1 className="mt-2 text-3xl leading-snug font-bold text-balance text-swipe-foreground">
          まず、あなたのことを
          <br />
          教えてください
        </h1>

        <button
          type="button"
          onClick={onNext}
          className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-br from-swipe-accent to-primary px-8 py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
        >
          次へ
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* 下部：ビジュアルパネル */}
      <div className="relative flex h-72 items-center justify-center overflow-hidden bg-swipe-surface">
        <div className="h-60 w-52 overflow-hidden rounded-2xl border-4 border-swipe-border shadow-lg">
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
  )
}
