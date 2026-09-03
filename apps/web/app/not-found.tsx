import { redirect } from 'next/navigation'

// 未定義URLへのアクセスは検索画面へ戻す
export default function NotFound() {
  redirect('/search')
}
