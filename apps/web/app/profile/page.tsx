import { Sidebar } from "@/components/sidebar"
import { AchievementBanner, ProfilePhotos } from "@/components/profile-photos"
import { SectionTitle, SelectRow, LinkRow } from "@/components/profile-form"

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active="マイページ" />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8">
          <div className="mb-4 flex justify-end">
            <button className="text-sm font-bold text-primary hover:underline">
              プレビュー
            </button>
          </div>

          <AchievementBanner />
          <ProfilePhotos />

          {/* 自己紹介文 */}
          <SectionTitle>自己紹介文</SectionTitle>
          <button className="mt-2 w-full rounded-2xl border border-border bg-card p-4 text-left text-sm leading-relaxed text-foreground transition-colors hover:bg-accent/40">
            <p>はじめまして！</p>
            <p className="mt-3">
              慶應卒業後、プライム企業でプログラマーしてます。
            </p>
            <p className="mt-3">フルリモートで出会いないので始めてみました。</p>
            <p className="mt-3">
              休日はカフェ行ったりジム行ったりバーでゆっくり飲んだりです。ワインが好きです。
            </p>
            <p className="mt-3">
              一緒に過ごした長さが大事だと思ってるので、1人の人と長く付き合えたら嬉しいです。
            </p>
            <p className="mt-3">よろしくお願いします〜！</p>
          </button>

          {/* Pairsプロフ */}
          <SectionTitle>基本プロフィール</SectionTitle>
          <div>
            <SelectRow
              label="身長"
              value="175cm"
              options={["165cm", "170cm", "175cm", "180cm", "185cm"]}
            />
            <SelectRow
              label="体型"
              value="普通"
              options={["スリム", "普通", "がっしり", "ぽっちゃり"]}
            />
            <SelectRow
              label="血液型"
              options={["A型", "B型", "O型", "AB型"]}
            />
            <SelectRow
              label="居住地"
              value="日本"
              options={["日本", "海外"]}
              secondValue="東京"
              secondOptions={["東京", "神奈川", "埼玉", "千葉", "大阪"]}
            />
            <SelectRow
              label="出身地"
              options={["北海道", "東京", "大阪", "福岡", "選択しない"]}
              secondOptions={["東京", "神奈川", "埼玉", "千葉", "選択しない"]}
            />
            <SelectRow
              label="職種"
              value="エンジニア"
              options={["エンジニア", "営業", "企画", "公務員", "医療"]}
            />
            <SelectRow
              label="学歴"
              value="大学卒"
              options={["高校卒", "専門学校卒", "大学卒", "大学院卒"]}
            />
            <SelectRow
              label="年収"
              value="800万円以上〜"
              options={[
                "〜400万円",
                "400〜600万円",
                "600〜800万円",
                "800万円以上〜",
              ]}
            />
            <SelectRow
              label="タバコ"
              value="吸わない"
              options={["吸わない", "吸う", "時々吸う", "電子タバコ"]}
            />
          </div>

          {/* 基本情報 */}
          <SectionTitle>基本情報</SectionTitle>
          <div>
            <LinkRow label="ニックネーム" value="こうだい" />
            <LinkRow label="年齢" value="25歳" />
            <LinkRow label="兄弟姉妹" />
            <LinkRow label="話せる言語" />
          </div>

          {/* 学歴・職種 */}
          <SectionTitle>学歴・職種</SectionTitle>
          <div>
            <LinkRow label="学校名" value="慶應義塾大学" />
            <LinkRow label="職業名" value="ITエンジニア" />
          </div>

          {/* 恋愛・結婚について */}
          <SectionTitle>恋愛・結婚について</SectionTitle>
          <div>
            <SelectRow
              label="結婚歴"
              value="独身（未婚）"
              options={["独身（未婚）", "離婚歴あり"]}
            />
            <SelectRow
              label="子供の有無"
              options={["なし", "あり（同居）", "あり（別居）"]}
            />
            <SelectRow
              label="結婚に対する意思"
              options={["すぐにでもしたい", "いずれしたい", "今は考えていない"]}
            />
            <SelectRow
              label="子供が欲しいか"
              options={["欲しい", "欲しくない", "相手と相談して決めたい"]}
            />
            <SelectRow
              label="家事・育児"
              options={["積極的に参加したい", "できる範囲で参加したい"]}
            />
            <SelectRow
              label="出会うまでの希望"
              options={["まずはメッセージ", "気が合えば早く会いたい"]}
            />
            <SelectRow
              label="デート費用"
              options={["男性が多めに負担", "割り勘", "相手と相談"]}
            />
          </div>

          {/* 性格・趣味・生活 */}
          <SectionTitle>性格・趣味・生活</SectionTitle>
          <div>
            <LinkRow label="性格・タイプ" value="几帳面, 仕事好き" />
            <SelectRow
              label="社交性"
              options={["人見知り", "普通", "社交的"]}
            />
            <SelectRow
              label="同居人"
              value="一人暮らし"
              options={["一人暮らし", "実家暮らし", "ルームシェア"]}
            />
            <LinkRow label="飼っているペット" placeholder="タップして編集" />
            <SelectRow label="休日" value="土日" options={["土日", "平日", "不定期"]} />
            <SelectRow
              label="お酒"
              options={["飲まない", "時々飲む", "よく飲む"]}
            />
            <LinkRow label="好きなこと・趣味" placeholder="タップして編集" />
          </div>

          <div className="h-16" />
        </div>
      </main>
    </div>
  )
}
