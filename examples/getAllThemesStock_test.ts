import { LSStockSDK } from '../src';
import {queryWithRetry} from "./database"
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
  console.log('Testing getThemeRank API...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({path: resolve(__dirname, '../.env')});

  try {
    const sdk = await LSStockSDK.getInstance();
    console.log('✅ SDK initialized successfully');

    // Test getThemeRank function availability
    if (sdk.api.getThemeRank) {
      console.log('✅ getThemeRank function is available');

      // Test getThemeRank API call
      try {
        console.log('📡 Calling getThemeRank API...');

        let resultCount = 0;
        for await (const data of sdk.api.getThemeRank(
            { tmname: '국내 상장 중국기업'}
        )) {
          resultCount++;
          console.log(`📊 Result ${resultCount}:`, data);

            // await queryWithRetry('insert into stock_theme (tm_name, tm_code) values ( $1, $2)', [data.tmname, data.tmcode]);


        }

        if (resultCount === 0) {
          console.log('⚠️  No results returned from getThemeRank API');
        } else {
          console.log(`✅ getThemeRank API test completed successfully with ${resultCount} result(s)`);
        }

      } catch (apiError) {
        console.error('❌ Error calling getThemeRank API:', apiError);

        // Log additional error details if available
        if (apiError instanceof Error) {
          console.error('   Error message:', apiError.message);
          console.error('   Error stack:', apiError.stack);
        }
      }

    } else {
      console.error('❌ getThemeRank function is not available in SDK');
    }

  } catch (sdkError) {
    console.error('❌ Error initializing SDK:', sdkError);
  }

  console.log('🏁 getThemeRank test completed');
})();
