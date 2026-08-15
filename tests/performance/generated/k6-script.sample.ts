import { UrekoiAPIClient } from "./urekoiAPI.ts";

const baseUrl = "<BASE_URL>";
const urekoiAPIClient = new UrekoiAPIClient({ baseUrl });

export default function () {
  let signupRequest,
    loginRequest,
    googleLoginRequest,
    refreshRequest,
    logoutRequest,
    myProfileCreateRequest,
    myProfileRequest,
    profileImagePresignRequest,
    profileImageCreateRequest,
    imageId,
    profileImageOrderRequest,
    userId,
    likeRequest,
    skipRequest,
    matchId,
    messageRequest;

  /**
   * メールアドレス・パスワード登録
   */
  signupRequest = {
    email: "test@example.com",
    password: "password123",
  };

  const postSignupResponseData = urekoiAPIClient.postSignup(signupRequest);

  /**
   * ログイン
   */
  loginRequest = {
    email: "test@example.com",
    password: "password123",
  };

  const postLoginResponseData = urekoiAPIClient.postLogin(loginRequest);

  /**
   * Googleログイン(初回は自動でユーザー作成、2回目以降はログイン)
   */
  googleLoginRequest = {
    id_token: "<id_token(JWT)>",
  };

  const postGoogleLoginResponseData =
    urekoiAPIClient.postGoogleLogin(googleLoginRequest);

  /**
   * アクセストークンの再発行
   */
  refreshRequest = {
    refresh_token: "<refresh token>",
  };

  const postRefreshResponseData = urekoiAPIClient.postRefresh(refreshRequest);

  /**
   * ログアウト(refresh_tokenを失効させる)
   */
  logoutRequest = {
    refresh_token: "<refresh token>",
  };

  const postLogoutResponseData = urekoiAPIClient.postLogout(logoutRequest);

  /**
   * 退会
   */

  const deleteUsersMeResponseData = urekoiAPIClient.deleteUsersMe();

  /**
   * 自分のプロフィール取得
   */

  const getMyprofileResponseData = urekoiAPIClient.getMyprofile();

  /**
   * 初回プロフィール作成
   */
  myProfileCreateRequest = {
    nickname: "たろう",
    prefecture_code: "13",
    gender: "female",
    birthdate: "1990-01-01",
  };

  const postMyprofileResponseData = urekoiAPIClient.postMyprofile(
    myProfileCreateRequest,
  );

  /**
   * プロフィール更新
   */
  myProfileRequest = {
    nickname: "たろう",
    prefecture_code: "13",
    bio: "よろしくお願いします",
    occupation: "エンジニア",
    hometown: "東京",
    blood_type: "A型",
    mbti: "INTJ",
    body_type: "普通",
    education: "大学卒",
    holiday: "土日",
    alcohol: "時々飲む",
    smoking: "吸わない",
    height_cm: "175",
    tag_ids: "1,2,3",
  };

  const putMyprofileResponseData =
    urekoiAPIClient.putMyprofile(myProfileRequest);

  /**
   * プロフィール画像アップロード用の署名付きURLを発行
   */
  profileImagePresignRequest = {
    content_type: "image/jpeg",
    extension: "jpg",
  };

  const postMyprofileImagesPresignResponseData =
    urekoiAPIClient.postMyprofileImagesPresign(profileImagePresignRequest);

  /**
   * presignでアップロード済みのkeyからプロフィール画像を登録
   */
  profileImageCreateRequest = {
    image_key: "profiles/1/xxxx.jpg",
  };

  const postMyprofileImagesResponseData = urekoiAPIClient.postMyprofileImages(
    profileImageCreateRequest,
  );

  /**
   * プロフィール画像を削除
   */
  imageId = 8200755928696384;

  const deleteMyprofileImageResponseData =
    urekoiAPIClient.deleteMyprofileImage(imageId);

  /**
   * プロフィール画像の並び替え
   */
  profileImageOrderRequest = {
    image_ids: "3,1,2",
  };

  const putMyprofileImagesOrderResponseData =
    urekoiAPIClient.putMyprofileImagesOrder(profileImageOrderRequest);

  /**
   * 選択可能なタグ一覧取得
   */

  const getTagsResponseData = urekoiAPIClient.getTags();

  /**
   * スワイプ候補一覧取得
   */

  const getPartnerRecsResponseData = urekoiAPIClient.getPartnerRecs();

  /**
   * 相手詳細取得
   */
  userId = 2306124411073467;

  const getPartnerByUserIdResponseData =
    urekoiAPIClient.getPartnerByUserId(userId);

  /**
   * いいねを送る
   */
  likeRequest = {
    to_user_id: "1",
  };

  const postLikesResponseData = urekoiAPIClient.postLikes(likeRequest);

  /**
   * マッチ済み・スキップ済みを除いた、もらったいいね一覧を取得(ポーリングでの利用を想定)
   */

  const getLikesPendingResponseData = urekoiAPIClient.getLikesPending();

  /**
   * 自分が送ったいいね一覧を取得
   */

  const getLikesSentResponseData = urekoiAPIClient.getLikesSent();

  /**
   * 相手をスキップする
   */
  skipRequest = {
    to_user_id: "1",
  };

  const postSkipsResponseData = urekoiAPIClient.postSkips(skipRequest);

  /**
   * メッセージ未送信のマッチ一覧取得
   */

  const getUnmessagedMatchesResponseData =
    urekoiAPIClient.getUnmessagedMatches();

  /**
   * メッセージ送信済みのマッチ一覧を取得（最新メッセージの新しい順・最新メッセージ付き）
   */

  const getMessagedMatchesResponseData = urekoiAPIClient.getMessagedMatches();

  /**
   * マッチ1件の詳細取得(相手のプロフィール詳細を含む)
   */
  matchId = 937457901922043;

  const getMatchResponseData = urekoiAPIClient.getMatch(matchId);

  /**
   * マッチ相手とのメッセージ履歴を取得(新しい順、before_idカーソルでページネーション)
   */
  matchId = 4432862367528804;

  const getMatchesMatchIdMessagesResponseData =
    urekoiAPIClient.getMatchesMatchIdMessages(matchId);

  /**
   * マッチ相手にメッセージを送る
   */
  messageRequest = {
    body: "よろしくお願いします!",
  };

  const postMatchesMatchIdMessagesResponseData =
    urekoiAPIClient.postMatchesMatchIdMessages(matchId, messageRequest);

  /**
   * WebSocket接続用の使い捨てチケットを発行する(TTL30秒、1回だけ使用可能)
   */

  const postWsTicketResponseData = urekoiAPIClient.postWsTicket();

  /**
     * WebSocket接続のハンドシェイク(アップグレード)エンドポイント。
接続成立後のメッセージのやり取りはAsyncAPI(docs/asyncapi.yaml)を参照。
POST /ws/ticketで発行したticketをクエリパラメータで渡す(例: wss://.../ws?ticket&#x3D;xxxx)。

     */

  const getWsResponseData = urekoiAPIClient.getWs();
}
