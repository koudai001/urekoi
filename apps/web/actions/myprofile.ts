'use server'

import { cookies } from 'next/headers'
import { postMyprofile, putMyprofile } from '@/generated/myprofile/myprofile'
import type {
  MyProfileCreateRequest,
  MyProfileRequest,
  ProfileDetail,
} from '@/generated/urekoiAPI.schemas'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

export type UpdateMyProfileResult =
  { success: true; profile: ProfileDetail } | { success: false; error: string }

export type CreateMyProfileResult =
  { success: true; profile: ProfileDetail } | { success: false; error: string }

// 初回プロフィールを作成する
export async function createMyProfile(
  req: MyProfileCreateRequest,
): Promise<CreateMyProfileResult> {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await postMyprofile(req, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  console.log(res)

  switch (res.status) {
    case 201:
      return { success: true, profile: res.data }
    case 400:
      return {
        success: false,
        error: res.data.error ?? '入力内容をご確認ください',
      }
    case 401:
      return { success: false, error: 'ログインし直してください' }
    case 409:
      return { success: false, error: 'プロフィールは作成済みです' }
    case 500:
      return {
        success: false,
        error: '通信エラーが発生しました。もう一度お試しください',
      }
    default: {
      const _exhaustive: never = res
      return _exhaustive
    }
  }
}

// プロフィール属性(タグ含む)を更新する
export async function updateMyProfile(
  req: MyProfileRequest,
): Promise<UpdateMyProfileResult> {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await putMyprofile(req, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  switch (res.status) {
    case 200:
      return { success: true, profile: res.data }
    case 400:
      return {
        success: false,
        error: res.data.error ?? '入力内容をご確認ください',
      }
    case 401:
      return { success: false, error: 'ログインし直してください' }
    case 404:
      return { success: false, error: 'プロフィールが見つかりませんでした' }
    case 500:
      return {
        success: false,
        error: '通信エラーが発生しました。もう一度お試しください',
      }
    default: {
      const _exhaustive: never = res
      return _exhaustive
    }
  }
}
