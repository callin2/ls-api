import { LSStockSDK } from '../src';
import {from} from "rxjs";
import {scan, tap} from "rxjs/operators";

(async () => {
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
