import {LSStockSDK} from '../src';
// import {queryWithRetry} from "./database"
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    console.log('Testing getMultiQuote API...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({path: resolve(__dirname, '../.env')});

    try {
        const sdk = await LSStockSDK.getInstance();
        console.log('✅ SDK initialized successfully');

        // const allStocks = await queryWithRetry('select * from stock_info');
        const allStocks =  [
            { shcode: '000020' },
            { shcode: '000100' },
            { shcode: '005950' },
        ]
        let cnt =0 ;

        let shcodes = '';

        while(true) {
            let stock = allStocks[cnt];
            if ( ! stock ) break;
            shcodes += stock.shcode;
            cnt++;

            if (cnt % 50 === 0) {
                console.log( shcodes.length , shcodes.length / 6,  cnt);

                try {
                    for await (const data of sdk.api.getMultiQuote({
                        nrec : 50,
                        shcode: shcodes
                    })) {
                        console.log(`📊 Result  :`, data);

                    }
                }catch ( e) {
                    console.error(e);
                }finally {
                    shcodes = '';
                }
            }
        }

        for await (const data of sdk.api.getMultiQuote({
            nrec : shcodes.length / 6 ,
            shcode: shcodes
        })) {
            console.log(`📊 Result  :`, data);

            // await queryWithRetry('insert into stock_theme (tm_name, tm_code) values ( $1, $2)', [data.tmname, data.tmcode]);


        }

    } catch (sdkError) {
        console.error('❌ Error initializing SDK:', sdkError);
    }

    console.log('🏁 getMultiQuote test completed');
})();
