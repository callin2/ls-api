# ls-api

ls-api is a TypeScript SDK designed to make LS Securities' public APIs easy to use. It was built with real-time trading automation in mind and follows a consistent convention: all REST/data API functions return async generators. This design makes it straightforward to combine historical data (REST) and real-time streams (WebSocket) into automated trading pipelines.

Key points
- Package name: `ls-api`
- TypeScript support and type definitions included
- All API functions return async generators (consume with `for await...of`) — this is important
- Real-time streams are provided as RxJS Observables suitable for pipeline composition
- Environment variables (especially API key/secret and WS endpoint) must be set before using the SDK

Important: How API functions behave
- Most of the SDK's REST/data APIs (`sdk.api.*`) return async generators. Use them with the `for await...of` pattern to consume results sequentially.
- Example:

```ts
// Consume API results sequentially using for-await
for await (const item of sdk.api.getDwmChart({ shcode: '005930', gubun: '2', qrycnt: 10, sdate: '20250818', edate: '20250818' })) {
  console.log(item);
}
```

- For APIs that must repeatedly request multiple pages of results (i.e., APIs that return async generators), the SDK internally applies automatic throttling to ensure compliance with the API provider's per-second request limits (rate limits).

Environment variables (required)
- LS_API_KEY: API key
- LS_API_SECRET: API secret
- LS_API_BASE_URL: (optional) REST base URL default: https://openapi.ls-sec.co.kr:8080
- LS_WS_ENDPOINT: (optional) WebSocket endpoint default: wss://openapi.ls-sec.co.kr:29443/websocket
- WS_DB_DEBUG: (optional) set to `true` to enable WebSocket debug output

Recommended: place a `.env` file at the project root and load it with `dotenv`. Example `.env`:

```
LS_API_KEY=your_api_key_here
LS_API_SECRET=your_api_secret_here
LS_API_BASE_URL=https://openapi.ls-sec.co.kr:8080
LS_WS_ENDPOINT=wss://openapi.ls-sec.co.kr:29443/websocket
```

Installation

pnpm (recommended):

```bash
pnpm add ls-api
```

npm:

```bash
npm install ls-api
```

If you're running the local source for development, install dependencies and run the examples (see below).

Development & build

Prerequisites: Node.js (LTS recommended), pnpm or npm

```bash
# Install deps
pnpm install

# Typecheck / build (use the project's build script if present)
pnpm run build
# or
npx tsc -p tsconfig.json
```

Quick start — Using a generator (core)

```ts
import { LSStockSDK } from 'ls-api';

(async () => {
  const sdk = await LSStockSDK.getInstance();

  // All API functions return async generators
  if (sdk.api.getDwmChart) {
    for await (const candle of sdk.api.getDwmChart({
      "shcode": "005930",
      "gubun": "2",
      "qrycnt": 200,
      "sdate": "",
      "edate": "",
      "cts_date": "",
      "comp_yn": "N",
      "sujung": "Y"
    })) {
      console.log(candle);
    }
  }

  await sdk.destroy();
})();
```

Quick start — Combining history + real-time (getTradeStream)

`getTradeStream(shcode, config)` internally combines historical data (async generator) and real-time WebSocket data and returns an RxJS Observable. You can pipe and subscribe to that Observable to build automated trading logic.

```ts
import { LSStockSDK } from 'ls-api';
import { filter, map } from 'rxjs/operators';

(async () => {
  const sdk = await LSStockSDK.getInstance();

  const stream = sdk.getTradeStream('005930', { startTime: '09:00:00', intervalMinutes: 1 });

  const subscription = stream.pipe(
    filter(data => Math.abs(data.diff) > 100),
    map(data => ({ price: data.close, time: data.chetime }))
  ).subscribe({
    next: x => console.log('Actionable:', x),
    error: err => console.error(err)
  });

  // later: await sdk.releaseTradeStream('005930'); await sdk.destroy();
})();
```

Examples folder
- The `examples/` directory contains many usage and test scripts, for example:
  - `sdk_basic_test.ts` — SDK initialization and generator usage
  - `getTradeStream_test.ts`, `mix_stream_test.ts`, `trading_stream_example.ts` — real-time stream examples

External API documentation and TR input format
- The official API documentation can be found here:
  - https://openapi.ls-sec.co.kr/apiservice?group_id=73142d9f-1983-48d2-8543-89b75535d34c&api_id=54a99b02-dbba-4057-8756-9ac759c9a2ed
- Each TR (transaction/query) in that documentation provides input parameters as TRCode + InBlock. Use the InBlock structure from the API docs as the request body when calling SDK APIs. Compare the `getDwmChart()` example above with the official API doc to verify parameter names.
- Example InBlock request form (use the exact structure from the API docs):

```json
{
  "t8410InBlock": {
    "shcode": "078020",
    "gubun": "2",
    "qrycnt": 200,
    "sdate": "",
    "edate": "",
    "cts_date": "",
    "comp_yn": "N",
    "sujung": "Y"
  }
}
```

api-spec expansion (add APIs without additional coding)
- The repository's `src/api-spec/` folder contains JSON API specs that the SDK currently supports.
- If the official docs include TRs that `ls-api` does not yet provide, you can add a JSON spec file for that TR in `src/api-spec/` in the same format. The SDK loads `api-spec` at runtime and will automatically register the API function without additional coding.
- Important limitation:
  - If you do not update `src/types.ts` with types for the new TR, the API will work but IDE autocompletion, type checking and other conveniences may be limited.
  - For best developer experience, add appropriate types to `src/types.ts` so TypeScript autocompletion and type safety are available.

Steps to add an API spec
1. Check the TR spec in the official documentation
2. Create a JSON file in `src/api-spec/` with the same format
3. (Optional) Add type definitions to `src/types.ts` for autocompletion
4. Restart or reload the SDK; the API will appear under `sdk.api`

Running examples
- Place a `.env` file at the project root (or examples-relative path) so `dotenv` can load it.

- Important: Examples (especially ESM/TypeScript examples) must be executed with `tsx`. Recommended commands:

```bash
# Using npx (recommended)
npx tsx examples/sdk_basic_test.ts

# Using pnpm in environments without global tsx
pnpm dlx tsx examples/mix_stream_test.ts
```

Publishing to npm
1. Set `name` in `package.json` to `ls-api`.
2. Confirm `version`, `description`, `repository`, `author`, `license`, `files` (or `.npmignore`).
3. Include the build output (e.g. `dist/`) in the package files.
4. Login and publish as public package:

```bash
npm login
npm publish --access public
```

Security & operational notes
- Never commit API keys/secrets to a public repository. Ensure `.env` is ignored by git.
- Real-time automated trading logic carries market risk — thoroughly backtest and simulate before running in production.
- Check and handle network errors, reconnection strategies, and token expiration (tokens are cached in the SDK for reuse).

Need more?
- I can add per-endpoint examples, TypeDoc generation, or a CI/CD pipeline (GitHub Actions) for automated releases. I can also inspect `src` to document how throttling works and document any configuration knobs if you want that included.
