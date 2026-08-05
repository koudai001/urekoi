import useSWR from 'swr'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'

export const MY_PROFILE_KEY = '/api/myprofile'

function fetcher(url: string) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error('プロフィールの取得に失敗しました')
    return res.json() as Promise<ProfileDetail>
  })
}

// 自分のプロフィールを取得する。画像一覧は自分の操作でしか変わらないためポーリングはせず、
// アップロード/削除の成功時にmutate()でキャッシュをその場で更新する想定
export function useMyProfile() {
  return useSWR<ProfileDetail>(MY_PROFILE_KEY, fetcher)
}
