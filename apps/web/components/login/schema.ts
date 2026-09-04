import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('メールアドレスの形式が正しくありません'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
