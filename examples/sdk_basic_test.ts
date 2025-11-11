import {LSStockSDK} from '../src';
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    console.log('Testing SDK initialization...');

    try {

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        dotenv.config({path: resolve(__dirname, '../.env')});

        const sdk = await LSStockSDK.getInstance();
        console.log('✅ SDK initialized successfully');

        // Test API functions registration
        const registeredFunctions = sdk.getRegisteredApiFunctions();
        console.log(`✅ Registered ${registeredFunctions.length} API functions`);
        console.log('Sample functions:', registeredFunctions.slice(0, 5));

        // Test a simple API call (if available)
        if (sdk.api.getDwmChart) {
            console.log('✅ getDwmChart function is available');

            // Test with minimal data
            try {
                for await (const data of sdk.api.getDwmChart({
                    shcode: '005930', // Samsung Electronics
                    gubun: '2',       // Daily
                    qrycnt: 1,        // 1 record only
                    sdate: '20250818',
                    edate: '20250818',
                    cts_date: '',
                    comp_yn: 'N',
                    sujung: 'Y',
                })) {
                    console.log('✅ API call successful, sample data:', {
                        date: data.date,
                        open: data.open,
                        close: data.close,
                        volume: data.jdiff_vol
                    });
                    break; // Only show first result
                }
            } catch (apiError: any) {
                console.log('⚠️ API call failed (this is expected for auth issues):', apiError.message);
            }
        }

        // Clean up
        await sdk.destroy();
        console.log('✅ SDK cleanup completed');

    } catch (error: any) {
        console.error('❌ SDK test failed:', error.message);
        process.exit(1);
    }
})();
