import { LSStockSDK } from '../src';
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
  console.log('Testing getThemeStocks API...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({path: resolve(__dirname, '../.env')});

  const sdk = await LSStockSDK.getInstance();

  try {
    console.log('✅ SDK initialized successfully');

    // Test getAllThemes function availability
    if (sdk.api.getThemeQuotes) {
      console.log('✅ getThemeStocks function is available');

      // Test getThemeStocks API call
      try {
        console.log('📡 Calling getThemeStocks API...');

        let resultCount = 0;
        for await (const data of sdk.api.getThemeQuotes({
            tmcode: "0013"
        })) {
          resultCount++;
          console.log(`📊 Result ${resultCount}:`, data);
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
