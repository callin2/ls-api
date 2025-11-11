import {LSStockSDK} from '../src';
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {


    console.log('Testing getIndStocks API...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({ path: resolve(__dirname, '../.env') });

    let sdk = await LSStockSDK.getInstance();


    for await (const data2 of sdk.api.getDwmChart({
        shcode: '000100',
        gubun: '2',
        qrycnt: 1,
        sdate: '20250409',
        edate: '20250609',
        cts_date: '',
        comp_yn: 'N',
        sujung: 'Y',
    })) {
        console.log(data2);

    }
})();
