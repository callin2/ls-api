import {LSStockSDK} from '../src';
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({path: resolve(__dirname, '../.env')});

    const sdk = await LSStockSDK.getInstance()

    sdk.add_hook_for_news(async (data) => {
        console.log(data);
        let printhead = false;


        if (data?.body?.realkey) {
            let news = sdk.api.getNewsBody({
                sNewsno: data.body.realkey
            })

            for await (const item of news) {
                if (!printhead) {
                    console.log('--------------------------------')
                    printhead = true;
                }

                console.log(item.sBody);
            }

        }

        sdk.add_hook_for_investor(async (data) => {
            console.log("==================================================");
            console.log(data);
            console.log("==================================================");
        })


    })


})();
