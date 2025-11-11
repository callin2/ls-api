import {LSStockSDK} from '../src';
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    console.log('Testing getAllInd API...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({path: resolve(__dirname, '../.env')});

    try {
        const sdk = await LSStockSDK.getInstance();
        console.log('✅ SDK initialized successfully');

        // Test getAllInd function availability
        if (sdk.api.getFNGSummary) {
            console.log('✅ getFNGSummary function is available');

            // Test getAllInd API call
            try {
                console.log('📡 Calling getFNGSummary API...');

                let resultCount = 0;
                for await (const data of sdk.api.getFNGSummary({
                    gicode: "005930"
                })) {
                    resultCount++;
                    console.log(`📊 Result ${resultCount}:`, data);

                }

                if (resultCount === 0) {
                    console.log('⚠️  No results returned from getAllInd API');
                } else {
                    console.log(`✅ getAllInd API test completed successfully with ${resultCount} result(s)`);
                }

            } catch (apiError) {
                console.error('❌ Error calling getFNGSummary API:', apiError);

                // Log additional error details if available
                if (apiError instanceof Error) {
                    console.error('   Error message:', apiError.message);
                    console.error('   Error stack:', apiError.stack);
                }
            }

        } else {
            console.error('❌ getAllInd function is not available in SDK');
        }

    } catch (sdkError) {
        console.error('❌ Error initializing SDK:', sdkError);
    }

    console.log('🏁 getAllInd test completed');
})();
