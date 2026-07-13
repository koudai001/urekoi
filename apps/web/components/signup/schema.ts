import { z } from 'zod'

// 女性は30歳以上・男性は35歳以下(熟恋のコンセプト上の年齢制限。BE側でも同じルールを予定)
const MIN_AGE_FEMALE = 30
const MAX_AGE_MALE = 35
const MIN_AGE = 18
const MAX_AGE = 100 // 現実的にあり得ない生年月日(1111年など)を弾くための上限
const EMAIL_PATTERN = /\S+@\S+\.\S+/

// 生年月日から年齢を計算する関数
function calculateAge(
  year: number,
  month: number,
  day: number,
  now = new Date(),
): number {
  let age = now.getFullYear() - year
  const hasHadBirthdayThisYear =
    now.getMonth() + 1 > month ||
    (now.getMonth() + 1 === month && now.getDate() >= day)
  if (!hasHadBirthdayThisYear) age--
  return age
}

// 実在する日付かどうかを判定する関数
function isRealDate(year: number, month: number, day: number): boolean {
  // monthは0から始まるため、1を引く
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

// base schemaは型だけ緩く合わせておく(必須・形式チェックはsuperRefineで行う)。
// マルチステップの途中は他のフィールドがまだ未入力(空文字/undefined)なので、
// base schemaで厳密なmin/maxやemail形式まで見てしまうと、そこで検証が止まって
// 後続のsuperRefine(実在日付・年齢などのクロスフィールドチェック)が一切実行されなくなるため
export const signupSchema = z
  .object({
    isAdult: z.boolean(),
    agreeTerms: z.boolean(),
    gender: z.enum(['male', 'female']).optional(),
    birthYear: z.string(),
    birthMonth: z.string(),
    birthDay: z.string(),
    prefectureCode: z.number().optional(),
    nickname: z.string(),
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

    if (!data.gender) {
      ctx.addIssue({
        code: 'custom',
        message: '性別を選択してください',
        path: ['gender'],
      })
    }

    if (
      data.birthYear.length < 4 ||
      data.birthMonth.length < 1 ||
      data.birthDay.length < 1
    ) {
      ctx.addIssue({
        code: 'custom',
        message: '生年月日を入力してください',
        path: ['birthDay'],
      })
    } else {
      const year = Number(data.birthYear)
      const month = Number(data.birthMonth)
      const day = Number(data.birthDay)

      if (!isRealDate(year, month, day)) {
        ctx.addIssue({
          code: 'custom',
          message: '実在する日付を入力してください',
          path: ['birthDay'],
        })
      } else {
        const age = calculateAge(year, month, day)
        if (age < MIN_AGE) {
          ctx.addIssue({
            code: 'custom',
            message: '18歳未満の方はご登録いただけません',
            path: ['birthDay'],
          })
        } else if (age > MAX_AGE) {
          ctx.addIssue({
            code: 'custom',
            message: '生年月日をご確認ください',
            path: ['birthDay'],
          })
        } else if (data.gender === 'female' && age < MIN_AGE_FEMALE) {
          ctx.addIssue({
            code: 'custom',
            message: '女性は30歳以上でご登録いただけます',
            path: ['birthDay'],
          })
        } else if (data.gender === 'male' && age > MAX_AGE_MALE) {
          ctx.addIssue({
            code: 'custom',
            message: '男性は35歳以下でご登録いただけます',
            path: ['birthDay'],
          })
        }
      }
    }

    if (!data.prefectureCode || data.prefectureCode < 1) {
      ctx.addIssue({
        code: 'custom',
        message: '都道府県を選択してください',
        path: ['prefectureCode'],
      })
    }

    const trimmedNickname = data.nickname.trim()
    if (trimmedNickname.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: '表示名を入力してください',
        path: ['nickname'],
      })
    } else if (trimmedNickname.length > 20) {
      ctx.addIssue({
        code: 'custom',
        message: '表示名は20文字以内で入力してください',
        path: ['nickname'],
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

export type SignupFormValues = z.infer<typeof signupSchema>
