import { LSStockSDK } from '../src';
import {from} from "rxjs";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({ path: resolve(__dirname, '../.env') });

    let sdk = await LSStockSDK.getInstance();


    from(sdk.api.getTimeBasedOrderBookVolumeTrend({
        "shcode": "041190",
        "gubun": "00",
        "time": "100000",
        "cnt": "500",
        "exchgubun": "U"
    })).subscribe( final_data => {
        delete final_data._orgBody;
        console.log('final_data', final_data);
    })
    console.log('finished getBalanceV2');
})();
