'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { X, Plus, Loader2 } from 'lucide-react'
import {
  presignProfileImage,
  createProfileImage,
  deleteProfileImage,
} from '@/actions/profile-images'
import {
  useMyProfile,
  MY_PROFILE_KEY,
} from '@/components/myprofile/use-my-profile'
import { mutate as globalMutate } from 'swr'
import type { ProfileImageResponse } from '@/generated/urekoiAPI.schemas'

// アップロードを許可する画像形式(BEのvalidatorと合わせる)
const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// 署名対象のヘッダーのため、BE側のCache-Controlと同じ値にする
const PROFILE_IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable'

// プロフィール写真の登録上限枚数
const PHOTO_SLOT_COUNT = 9

export function ProfilePhotos() {
  const { data } = useMyProfile()
  const images = data?.images ?? []

  // アップロード中はファイル選択自体を封じるためのフラグ
  const [uploading, setUploading] = useState(false)
  // 削除中の画像ID。押し直し防止と、押した写真だけスピナー表示するために使う
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 「追加」タイルクリック→隠しinputのファイル選択ダイアログを開く
  const handleAddClick = () => {
    fileInputRef.current?.click()
  }

  // ファイル選択後: presign→S3系ストレージへ直接PUT→登録、の3ステップをまとめて実行する
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // 同じファイルを連続で選び直しても onChange が発火するようにリセットしておく
    e.target.value = ''
    if (!file) return

    const extension = ALLOWED_CONTENT_TYPES[file.type]
    if (!extension) {
      toast.error('対応していない画像形式です(jpg / png / webpのみ)')
      return
    }

    setUploading(true)
    try {
      // アップロード用の署名付きURLとkeyを発行してもらう
      const presigned = await presignProfileImage(file.type, extension)
      if (!presigned.success) {
        toast.error(presigned.error)
        return
      }

      // ブラウザから直接S3互換ストレージへPUTする
      const uploadRes = await fetch(presigned.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Cache-Control': PROFILE_IMAGE_CACHE_CONTROL,
        },
        body: file,
      })
      if (!uploadRes.ok) {
        // デバッグ用: S3互換ストレージ側のエラー内容を確認するための一時ログ
        console.error(
          'PUT failed',
          uploadRes.status,
          uploadRes.statusText,
          await uploadRes.text(),
        )
        toast.error('画像のアップロードに失敗しました')
        return
      }

      // アップロード済みのkeyでProfileImageレコードを作成する
      const created = await createProfileImage(presigned.imageKey)
      if (!created.success) {
        toast.error(created.error)
        return
      }

      // 一覧の末尾に追加し、再フェッチせずその場でSWRキャッシュへ反映する
      addImageToCache(created.image)
      toast.success('写真を追加しました')
    } finally {
      setUploading(false)
    }
  }

  // 写真削除。成功したらSWRキャッシュから該当画像を取り除く
  const handleDelete = async (imageId: number) => {
    setDeletingId(imageId)
    try {
      const result = await deleteProfileImage(imageId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      removeImageFromCache(imageId)
      toast.success('写真を削除しました')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="flex h-full flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* 9枠固定の3列×3行グリッド。PhotoAreaの高さいっぱいに埋める(固定aspect比は付けない) */}
      <div className="mt-4 grid flex-1 grid-cols-3 grid-rows-3 gap-2">
        {Array.from({ length: PHOTO_SLOT_COUNT }, (_, index) => {
          const image = images[index]

          if (image) {
            return (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-card bg-swipe-surface"
              >
                <Image
                  src={image.url || '/placeholder.svg'}
                  alt="プロフィール写真"
                  fill
                  priority={index === 0}
                  className="object-cover"
                />
                <DeleteBadge
                  onClick={() => handleDelete(image.id ?? 0)}
                  deleting={deletingId === image.id}
                />
              </div>
            )
          }

          // 次に埋められる枠(=登録済み枚数と同じindex)だけタップして追加できる
          const isNextSlot = index === images.length
          return (
            <AddSlot
              key={`slot-${index}`}
              active={isNextSlot}
              uploading={uploading && isNextSlot}
              onClick={isNextSlot ? handleAddClick : undefined}
            />
          )
        })}
      </div>
    </section>
  )
}

// 空き枠。次に埋められる枠だけ押せる状態にし、それ以外は順番待ちとして無効表示する
function AddSlot({
  active,
  uploading,
  onClick,
}: {
  active: boolean
  uploading: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={!active || uploading}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 rounded-card bg-swipe-surface text-swipe-muted-foreground transition-colors disabled:cursor-not-allowed enabled:hover:text-swipe-accent"
    >
      {uploading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        active && (
          <>
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">追加</span>
          </>
        )
      )}
    </button>
  )
}

// 写真右上の削除ボタン。削除中はスピナーに差し替える
function DeleteBadge({
  deleting,
  onClick,
}: {
  deleting: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label="写真を削除"
      disabled={deleting}
      onClick={onClick}
      className="absolute bottom-2 right-2 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-swipe-foreground text-swipe-background shadow transition-colors disabled:opacity-60"
    >
      {deleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
    </button>
  )
}

// 新規追加した画像をSWRキャッシュの末尾に追加する(再フェッチしない)
function addImageToCache(image: ProfileImageResponse) {
  globalMutate(
    MY_PROFILE_KEY,
    (current: { images?: ProfileImageResponse[] } | undefined) =>
      current && { ...current, images: [...(current.images ?? []), image] },
    { revalidate: false },
  )
}

// 削除した画像をSWRキャッシュから取り除く(再フェッチしない)
function removeImageFromCache(imageId: number) {
  globalMutate(
    MY_PROFILE_KEY,
    (current: { images?: ProfileImageResponse[] } | undefined) =>
      current && {
        ...current,
        images: (current.images ?? []).filter((i) => i.id !== imageId),
      },
    { revalidate: false },
  )
}
