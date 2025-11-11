# ls-api

ls-api는 LS Securities(LS 증권사)의 공개 API를 편리하게 사용하도록 만든 TypeScript 기반 SDK입니다. 이 패키지는 실시간 거래 자동화를 염두에 두고 설계되었으며, 특히 "모든 REST/데이터 API는 async generator를 반환"하도록 통일되어 있습니다. 
실시간 스트림(웹소켓)과 과거 데이터(히스토리)를 결합해 자동매매 파이프라인을 쉽게 구성할 수 있습니다.

핵심 요약
- 패키지명: `ls-api`
- 타입스크립트 지원 및 타입 정의 포함
- 모든 API 함수는 async generator(예: for await...of로 소비)로 동작함 — 이 점이 매우 중요합니다
- 실시간 스트림은 RxJS Observable로 제공되어 파이프라인 구성에 적합함
- 환경변수(특히 API 키/시크릿 및 WS 엔드포인트) 사전 설정이 필수

중요: API 함수 사용 방식
- 이 SDK의 대부분 REST/데이터 API(`sdk.api.*`)는 async generator를 반환합니다. 이는 대량의 데이터(예: 분봉, 체결 이력 등)를 스트리밍처럼 순차 소비하기에 적합합니다.
- 예:

```ts
// for-await 패턴으로 API 결과를 순차적으로 처리
for await (const item of sdk.api.getDwmChart({ shcode: '005930', gubun: '2', qrycnt: 10, sdate: '20250818', edate: '20250818' })) {
  console.log(item);
}
```

- 여러 페이지의 결과를 반복적으로 요청해야 하는 API(즉, async generator를 반환하는 API)의 경우, 이는 API 제공 회사의 초당 요청 건수 제한(rate limit)을 준수하기 위해 SDK가 내부적으로 자동으로 요청을 스로틀(throttle)하도록 처리합니다.

환경 변수 (반드시 설정)
- LS_API_KEY: API 키
- LS_API_SECRET: API 시크릿
- LS_API_BASE_URL: (선택) REST 엔드포인트 기본값: https://openapi.ls-sec.co.kr:8080
- LS_WS_ENDPOINT: (선택) WebSocket 엔드포인트 기본값: wss://openapi.ls-sec.co.kr:29443/websocket
- WS_DB_DEBUG: (선택) 웹소켓 관련 디버그 출력을 위해 `true`로 설정

권장 방법: 프로젝트 루트에 `.env` 파일을 만들고 dotenv로 로드하세요. 예:

```
LS_API_KEY=your_api_key_here
LS_API_SECRET=your_api_secret_here
LS_API_BASE_URL=https://openapi.ls-sec.co.kr:8080
LS_WS_ENDPOINT=wss://openapi.ls-sec.co.kr:29443/websocket
```

설치

pnpm (권장):

```bash
pnpm add ls-api
```

npm:

```bash
npm install ls-api
```

개발 환경에서 로컬 소스를 직접 실행하려면 의존성 설치 후 예제 실행을 권장합니다.

개발 및 빌드

사전 요구사항: Node.js (LTS 권장), pnpm 또는 npm

```bash
# 의존성 설치
pnpm install

# 타입체크 / 빌드 (프로젝트에 설정된 build 스크립트를 사용)
pnpm run build
# 또는
npx tsc -p tsconfig.json
```

빠른 시작 예제 — Generator 사용 (핵심)

```ts
import { LSStockSDK } from 'ls-api';

(async () => {
  const sdk = await LSStockSDK.getInstance();

  // 모든 API는 async generator를 반환
  if (sdk.api.getDwmChart) {
    for await (const candle of sdk.api.getDwmChart({
        "shcode" : "005930",
        "gubun" : "2",
        "qrycnt" : 200,
        "sdate" : "",
        "edate" : "",
        "cts_date" : "",
        "comp_yn" : "N",
        "sujung" : "Y"
    })) {
      console.log(candle);
    }
  }

  await sdk.destroy();
})();
```

빠른 시작 예제 — 실시간+히스토리 결합 (getTradeStream)

- `getTradeStream(shcode, config)`는 내부적으로 히스토리(Async Generator)와 실시간(웹소켓)을 결합하여 RxJS Observable을 반환합니다. 이 Observable은 `.pipe(...)`로 파이프라인을 구성해 자동매매 로직에 바로 사용할 수 있습니다.

```ts
import { LSStockSDK } from 'ls-api';
import { filter, map } from 'rxjs/operators';

(async () => {
  const sdk = await LSStockSDK.getInstance();

  const stream = sdk.getTradeStream('005930', { startTime: '09:00:00', intervalMinutes: 1 });

  const sub = stream.pipe(
    filter(data => Math.abs(data.diff) > 100),
    map(data => ({ price: data.close, time: data.chetime }))
  ).subscribe({
    next: x => console.log('Actionable:', x),
    error: err => console.error(err),
  });

  // ...나중에 정리
  // await sdk.releaseTradeStream('005930');
  // await sdk.destroy();
})();
```

Examples 폴더
- `examples/`에 다수의 사용/테스트 스크립트가 있습니다. 예를 들어:
  - `sdk_basic_test.ts` — SDK 초기화와 API 함수(Generator) 사용 예시
  - `getTradeStream_test.ts`, `mix_stream_test.ts`, `trading_stream_example.ts` — 실시간 스트림 사용 예시

외부 API 문서 및 TR 입력 방식
- 공식 API 문서는 다음 URL에서 확인하세요:
  - https://openapi.ls-sec.co.kr/apiservice?group_id=73142d9f-1983-48d2-8543-89b75535d34c&api_id=54a99b02-dbba-4057-8756-9ac759c9a2ed
- 이 문서에서 각 TR(거래/조회)별 입력 파라미터는 TRCode + InBlock 형태로 제공됩니다. SDK 사용 시에는 문서에 적힌 InBlock 구조를 그대로 요청 바디에 넣으면 됩니다. 위 getDwmChart() 예제의 파라미터를 API 문서와 비교해 보세요 
- 예시 (TR 입력 형식 그대로 사용):

```ts
for await (const candle of sdk.api.getDwmChart({
  "shcode" : "005930",
  "gubun" : "2",
  "qrycnt" : 200,
  "sdate" : "",
  "edate" : "",
  "cts_date" : "",
  "comp_yn" : "N",
  "sujung" : "Y"
})) {
  console.log(candle);
}
```

```json

{
  "t8410InBlock" : {
    "shcode" : "078020",
    "gubun" : "2",
    "qrycnt" : 200,
    "sdate" : "",
    "edate" : "",
    "cts_date" : "",
    "comp_yn" : "N",
    "sujung" : "Y"
  }
}

```

api-spec 확장(별도 코딩 없이 API 추가)
- 저장소의 `src/api-spec/` 폴더에는 현재 제공되는 API 스펙(JSON)이 들어 있습니다.
- 만약 공식 문서에 있는 TR 중 `ls-api`가 아직 제공하지 않는 항목이 있다면, 해당 TR의 스펙을 문서 형식에 맞춰 `src/api-spec/`에 JSON 파일로 추가하면 추가 개발 없이 SDK에 자동 등록됩니다. (SDK는 런타임에 `api-spec` 폴더를 읽어 동적으로 API 함수를 생성합니다.)
- 단, 중요한 한계:
  - `types.ts`에 새로운 TR에 대한 타입 정의를 추가하지 않으면 해당 API는 동작하지만 IDE의 자동완성, 타입 체크, 편의성이 제한됩니다.
  - 안전하게 개발하려면 새로 추가한 API에 맞춰 `src/types.ts`를 업데이트해 주세요. 그러면 TypeScript 환경에서 자동완성 및 타입 안정성을 얻을 수 있습니다.

예: 추가 절차 요약
1. 공식 문서에서 TR 스펙을 확인
2. 동일한 형식으로 JSON 파일 생성 후 `src/api-spec/`에 넣기
3. (선택) `src/types.ts`에 타입을 추가하여 자동완성 지원
4. SDK를 재시작하거나 재로드하면 해당 API가 `sdk.api`에 노출됩니다

예제 실행 방법
- `.env` 파일을 프로젝트 루트(또는 examples 폴더 기준 상대경로)로 두고 dotenv가 로드되도록 예제를 실행하세요.

- 중요: 예제(특히 ESM/TypeScript 예제)는 반드시 `tsx`로 실행해야 합니다. 아래 명령을 권장합니다.

```bash
# npx로 실행 (권장)
npx tsx examples/sdk_basic_test.ts

# 또는 pnpm 환경에서는 dlx를 사용
pnpm dlx tsx examples/mix_stream_test.ts
```


보안 및 운영 주의사항
- API 키/시크릿은 절대 공개 저장소에 커밋하지 마세요. `.gitignore`에 `.env`가 포함되어 있는지 확인하세요.
- 실시간 자동매매 로직은 시장 리스크가 있으니 충분한 백테스트·시뮬레이션 후 운영 환경에 배포하세요.
- 네트워크 오류·재연결, 토큰 만료(토큰은 SDK 내에서 캐시되어 재사용됨) 처리 로직을 확인하세요.

추가 도움
- README에 개별 API(엔드포인트) 사용 예시, TypeDoc 문서 링크, CI/CD(예: GitHub Actions)를 이용한 자동 배포 설정 등 더 자세한 항목을 추가해드릴 수 있습니다. 원하시면 package.json 내용을 확인해 배포 스크립트와 예제 실행 스크립트도 추가해 드리겠습니다.
