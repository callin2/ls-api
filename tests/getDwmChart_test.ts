import {LSStockSDK} from '../src';

import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({ path: resolve(__dirname, '../.env') });

    const config = {
        baseUrl: process.env.LS_API_BASE_URL || 'https://openapi.ls-sec.co.kr:8080',
        apiKey: process.env.LS_API_KEY || '',
        apiSecret: process.env.LS_API_SECRET || '',
        wsEndpoint: process.env.LS_WS_ENDPOINT || 'wss://openapi.ls-sec.co.kr:29443/websocket'
    };

    let sdk = await LSStockSDK.getInstance(config);

    for await (const data2 of sdk.api.getDwmChart({
        shcode: '000100',
        gubun: '2',
        qrycnt: 1,
        sdate: '20250609',
        edate: '20250609',
        cts_date: '',
        comp_yn: 'N',
        sujung: 'Y',
    })) {
        console.log(data2);
    }
})();
