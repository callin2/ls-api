import {LSStockSDK} from '../src';
// import {queryWithRetry} from "./database"
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    console.log('Testing getStockThemes API...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({path: resolve(__dirname, '../.env')});

    try {
        const sdk = await LSStockSDK.getInstance();
        console.log('✅ SDK initialized successfully');

        // Test getStockThemes API call
        try {
            console.log('📡 Calling           for await (const data of sdk.api.getAllThemes({\n API...');

            for await (const t of sdk.api.getAllThemes({
                dummy: ""
            })) {
                console.log(`📊 Result :`, t);
                let resultCount = 0;
                for await (const data of sdk.api.getThemeQuotes(
                    t
                )) {
                    resultCount++;
                    console.log(`📊 Result ${resultCount}:`, data);

                    // await queryWithRetry('insert into theme_stock_link (shcode, tm_code) values ( $1, $2)', [data.shcode, t.tmcode]);

                }

            }

        } catch (apiError) {
            console.error('❌ Error calling getStockThemes API:', apiError);

            // Log additional error details if available
            if (apiError instanceof Error) {
                console.error('   Error message:', apiError.message);
                console.error('   Error stack:', apiError.stack);
            }
        }


    } catch (sdkError) {
        console.error('❌ Error initializing SDK:', sdkError);
    }

    console.log('🏁 getStockThemes test completed');
})();
