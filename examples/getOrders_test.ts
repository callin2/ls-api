import { LSStockSDK } from '../src';
import {from} from "rxjs";
import {scan, tap} from "rxjs/operators";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({ path: resolve(__dirname, '../.env') });

    let sdk = await LSStockSDK.getInstance();

    from(sdk.api.getOrders({
        "expcode": "161580",
        "chegb": "0",
        "medosu": "0",
        "sortgb": "2",
        "cts_ordno": " "
    })).subscribe( final_data => {
        console.log('final_data', final_data);
    })
    console.log('finished getBalanceV2');
})();
