# gin-trusted-proxies

## やること

- [ ] `router.SetTrustedProxies()` で信頼するプロキシを設定し警告を消す

サンプルコード
func main() {
r := gin.Default()

    // 環境変数 APP_ENV を取得
    appEnv := os.Getenv("APP_ENV")

    if appEnv == "production" || appEnv == "development" {
        // 本番・検証環境：
        // 本来は信頼できるIPを指定（例: []string{"192.168.1.1"}）
        // 面倒な場合は、一旦すべてのプロキシを許可する設定にして警告だけ消すことも可能
        // r.SetTrustedProxies([]string{"0.0.0.0/0"})
    } else {
        // ローカル環境：プロキシをnilにすることで、手元の警告を綺麗に消す
        r.SetTrustedProxies(nil)
    }

    r.Run("0.0.0.0:8080")

}
