import { PendingLikes } from '@/components/likes/pending-likes'

// 受信Like一覧の取得とキャッシュ管理はクライアントへ委譲する
export default function PendingLikesPage() {
  return <PendingLikes />
}
