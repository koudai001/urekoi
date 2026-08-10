import { z } from 'zod'

const EMAIL_PATTERN = /\S+@\S+\.\S+/

// base schemaは型だけ緩く合わせておく(必須・形式チェックはsuperRefineで行う)。
// マルチステップの途中は他のフィールドがまだ未入力(空文字)なので、
// base schemaで厳密なmin/maxやemail形式まで見てしまうと、そこで検証が止まって
// 後続のsuperRefine(利用規約への同意など)が一切実行されなくなるため
export const authSchema = z
  .object({
    isAdult: z.boolean(),
    agreeTerms: z.boolean(),
    email: z.string(),
    password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.isAdult) {
      ctx.addIssue({
        code: 'custom',
        message: '18歳以上・独身であることの確認が必要です',
        path: ['isAdult'],
      })
    }

    if (!data.agreeTerms) {
      ctx.addIssue({
        code: 'custom',
        message: '規約への同意が必要です',
        path: ['agreeTerms'],
      })
    }

    if (!EMAIL_PATTERN.test(data.email)) {
      ctx.addIssue({
        code: 'custom',
        message: 'メールアドレスの形式が正しくありません',
        path: ['email'],
      })
    }

    if (data.password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'パスワードは8文字以上で入力してください',
        path: ['password'],
      })
    }
  })

export type AuthFormValues = z.infer<typeof authSchema>
