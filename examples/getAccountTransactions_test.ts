import { LSStockSDK } from '../src';
import {from} from "rxjs";
import {scan, tap} from "rxjs/operators";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {

    // ===================================================================
    // Before LSStockSDK.getInstance() call environment variables should be set up.
    // This is for development environment.
    // Production environment should set up environment variables in other ways.
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    dotenv.config({ path: resolve(__dirname, '../.env') });
    // ===================================================================

    let sdk = await LSStockSDK.getInstance();

    from(sdk.api.getAccountTransactions({
        "RecCnt": 1,
        "QryTp": "0",
        "QrySrtDt": "20250901",
        "QryEndDt": "20250922",
        "SrtNo": 0,
        "PdptnCode": "01",
        "IsuLgclssCode": "01",
        "IsuNo": "KR7161580006"
    })).pipe(
        tap(data=>{
            console.log(data);
        }),

    ).subscribe( final_data => {
        console.log('final_data', final_data);
    })
    console.log('finished getBalanceV2');
})();
