import {LSStockSDK} from '../src';
// import {queryWithRetry} from "./database"
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    console.log('Testing getAllThemes API...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({path: resolve(__dirname, '../.env')});

    try {
        const sdk = await LSStockSDK.getInstance();
        console.log('✅ SDK initialized successfully');

        // Test getAllThemes function availability
        if (sdk.api.getAllThemes) {
            console.log('✅ getAllThemes function is available');

            // Test getAllThemes API call
            try {
                console.log('📡 Calling getAllThemes API...');

                let resultCount = 0;
                // await queryWithRetry(`delete from stock_theme`);

                for await (const data of sdk.api.getAllThemes({
                    dummy: ""
                })) {
                    resultCount++;
                    console.log(`📊 Result ${resultCount}:`, data);

                    // await queryWithRetry('insert into stock_theme (tm_name, tm_code) values ( $1, $2)', [data.tmname, data.tmcode]);
                }

                if (resultCount === 0) {
                    console.log('⚠️  No results returned from getAllThemes API');
                } else {
                    console.log(`✅ getAllThemes API test completed successfully with ${resultCount} result(s)`);
                }

            } catch (apiError) {
                console.error('❌ Error calling getAllThemes API:', apiError);

                // Log additional error details if available
                if (apiError instanceof Error) {
                    console.error('   Error message:', apiError.message);
                    console.error('   Error stack:', apiError.stack);
                }
            }

        } else {
            console.error('❌ getAllThemes function is not available in SDK');
        }

    } catch (sdkError) {
        console.error('❌ Error initializing SDK:', sdkError);
    }

    console.log('🏁 getAllThemes test completed');
})();
