// 1. ユーザーがメアドを入力した時に呼ぶ関数
func IssueVerificationCode(email string) error {
// ① 安全な6桁の数字（code）をランダム生成する
// ② メアドとcode、有効期限、試行回数(0)をDB（またはRedis）に保存する
// ③ メール送信関数(3)を呼び出して、ユーザーに通知する
}

// 2. ユーザーが6桁コードを入力した時に呼ぶ関数
func VerifyCodeAndLogin(email string, inputCode string) (string, error) {
// ① DBから該当メアドのコード情報を取得する
// ② 「有効期限切れ」「入力ミス5回以上」ならエラーを返す
// ③ 入力されたコードとDBのコードが一致するか検証する
// -> 間違っていたら試行回数を+1してエラーを返す
// ④ 一致したら、認証成功としてJWT（セッショントークン）を生成して返す
}

// 3. システムがメールを外部に送るための補助関数
func SendEmail(toEmail string, code string) error {
// SMTP（開発環境）やAWS SES（本番環境）を使ってメールを送る
}
