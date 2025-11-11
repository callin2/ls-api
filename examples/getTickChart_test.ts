import {LSStockSDK} from '../src';
import * as util from "node:util";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({ path: resolve(__dirname, '../.env') });

    let sdk = await LSStockSDK.getInstance();

    for await (const data2 of sdk.api.getStockTimeIntervalTrade({
        "shcode": '000100',
        "cvolume": 500,
        "starttime": "",
        "endtime": "",
        "cts_time": ""
    })) {
        delete data2._orgBody;
        console.log(util.inspect(data2));
    }
})();
