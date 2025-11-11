import { LSStockSDK } from '../src';
import {from} from "rxjs";
import {scan, tap} from "rxjs/operators";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({path: resolve(__dirname, '../.env')});

    let sdk = await LSStockSDK.getInstance();


    from(sdk.api.getBalanceV2({
        "prcgb": "",
        "chegb": "",
        "dangb": "",
        "charge": "",
        "cts_expcode": ""
    })).pipe(
        tap(data=>{
            console.log(data);
        }),
        scan((acc, data) => {
            return acc + data.dtsunik;
        }, 0)
    ).subscribe( final_data => {
        console.log('final_data', final_data);
    })
    console.log('finished getBalanceV2');
})();
