・プロフィールプレビューv機能の開発
・swrからtanstackqueryへ移行する

・profileviewerコンポーネントを作成

・これをマッチ時のパネル、スワイプカードのクリックイベント時、自分のプロフィールプレビュー画面にも出るようにもする

設計としては、まず「表示用プロフィール」と「編集用プロフィール」を分けるのがきれいです。具体的には、nickname / age / prefecture / bio / images / tags だけを持つ共通の read model を作って、自己プロフィールプレビューと相手プロフィール表示は同じ ProfileViewer 系コンポーネントに流します。編集画面は別で draft state を持ち、プレビューだけその draft を read model に変換して渡す形にすると、未保存状態もそのまま見せられます。
