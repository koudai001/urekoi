import { check } from "k6";
import { UrekoiAPIClient } from "../generated/urekoiAPI.ts";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

const client = new UrekoiAPIClient({ baseUrl: BASE_URL });

export const options = {
  scenarios: {
    recs_load: {
      // VU数を段階的に変化
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 20 }, // 30秒かけて、20VUまで増やす
        { duration: "1m", target: 20 }, // 20VUを1分間維持
        { duration: "30s", target: 0 }, // 30秒かけて0VUまで減らす
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"], // 全HTTPリクエストの95%が500ms未満
    http_req_failed: ["rate<0.01"], // HTTPリクエストのエラー率1%未満
  },
};

// テスト用ユーザーを1人作成し、access_tokenを全VUで使い回す
export function setup() {
  const email = `k6-recs-${Date.now()}@example.com`;
  const { data } = client.postSignup({ email, password: "password123" });

  if (!data.access_token) {
    throw new Error("signup failed: access_token missing");
  }

  return { accessToken: data.access_token };
}

// VUごとに最大10件までエラー内容をログ出力する
let errorCount = 0;

export default function (data: { accessToken: string }) {
  const { response } = client.getPartnerRecs({
    headers: { Authorization: `Bearer ${data.accessToken}` },
  });

  if (response.status !== 200 && errorCount < 10) {
    console.log(`status=${response.status} body=${response.body}`);
    errorCount++;
  }

  check(response, {
    "status is 200": (r) => r.status === 200,
  });
}
