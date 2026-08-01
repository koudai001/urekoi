'use server'

import { cookies } from 'next/headers'
import {
  postMyprofileImagesPresign,
  postMyprofileImages,
  deleteMyprofileImage,
} from '@/generated/myprofile/myprofile'
import type { ProfileImageResponse } from '@/generated/urekoiAPI.schemas'
import { COOKIE_ACCESS_TOKEN } from '@/lib/cookie'

export type PresignProfileImageResult =
  | { success: true; uploadUrl: string; imageKey: string }
  | { success: false; error: string }

// アップロード用の署名付きURLとkeyを発行する
export async function presignProfileImage(
  contentType: string,
  extension: string,
): Promise<PresignProfileImageResult> {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await postMyprofileImagesPresign(
    { content_type: contentType, extension },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  switch (res.status) {
    case 200:
      return {
        success: true,
        uploadUrl: res.data.upload_url ?? '',
        imageKey: res.data.image_key ?? '',
      }
    case 400:
      return { success: false, error: '対応していない画像形式です' }
    case 401:
      return { success: false, error: 'ログインし直してください' }
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

export type CreateProfileImageResult =
  | { success: true; image: ProfileImageResponse }
  | { success: false; error: string }

// presignでアップロード済みのkeyからプロフィール画像を登録する
export async function createProfileImage(
  imageKey: string,
): Promise<CreateProfileImageResult> {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await postMyprofileImages(
    { image_key: imageKey },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  switch (res.status) {
    case 201:
      return { success: true, image: res.data }
    case 400:
      return { success: false, error: '画像の登録に失敗しました' }
    case 401:
      return { success: false, error: 'ログインし直してください' }
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

export type DeleteProfileImageResult =
  { success: true } | { success: false; error: string }

// プロフィール画像を削除する
export async function deleteProfileImage(
  imageId: number,
): Promise<DeleteProfileImageResult> {
  const accessToken = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value ?? ''

  const res = await deleteMyprofileImage(imageId, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  switch (res.status) {
    case 204:
      return { success: true }
    case 401:
      return { success: false, error: 'ログインし直してください' }
    case 404:
      return { success: false, error: '画像が見つかりませんでした' }
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
