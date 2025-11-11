import {LSStockSDK} from '../src';
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

async function sleep(number: number) {
    return new Promise(resolve => setTimeout(resolve, number));
}

(async () => {
    console.log('Testing getIndStocks API...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({path: resolve(__dirname, '../.env')});

    try {
        const sdk = await LSStockSDK.getInstance();
        if (sdk.api.getStockTopValue) {

            for await (const data of sdk.api.getStockTopValue({
                "gubun": "0",
                "jnilgubun": "0",
                "jc_num": 0x01004280,
                "sprice": 5000,
                "eprice": 1000000,
                "exchgubun": "K"
            })) {
                console.log(data);
            }
        }

    } catch (sdkError) {
        console.error('❌ Error initializing SDK:', sdkError);
    }

    // console.log('🏁 getIndStocks test completed');
})();
