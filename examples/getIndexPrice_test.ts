import { LSStockSDK } from '../src';
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
  console.log('Testing getIndPrice API...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({ path: resolve(__dirname, '../.env') });

    const config = {
        baseUrl: process.env.LS_API_BASE_URL || 'https://openapi.ls-sec.co.kr:8080',
        apiKey: process.env.LS_API_KEY || '',
        apiSecret: process.env.LS_API_SECRET || '',
        wsEndpoint: process.env.LS_WS_ENDPOINT || 'wss://openapi.ls-sec.co.kr:29443/websocket'
    };

  try {
    const sdk = await LSStockSDK.getInstance();
    console.log('✅ SDK initialized successfully');

    // Test getIndPrice function availability
    if (sdk.api.getIndPrice) {
      console.log('✅ getIndPrice function is available');

      // Test getIndPrice API call
      try {
        console.log('📡 Calling getIndPrice API...');

        let resultCount = 0;
        for await (const data of sdk.api.getIndPrice({
            "upcode" : "001"
        })) {
          resultCount++;
          console.log(`📊 Result ${resultCount}:`, data);

        }

        if (resultCount === 0) {
          console.log('⚠️  No results returned from getIndPrice API');
        } else {
          console.log(`✅ getIndPrice API test completed successfully with ${resultCount} result(s)`);
        }

      } catch (apiError) {
        console.error('❌ Error calling getIndPrice API:', apiError);

        // Log additional error details if available
        if (apiError instanceof Error) {
          console.error('   Error message:', apiError.message);
          console.error('   Error stack:', apiError.stack);
        }
      }

    } else {
      console.error('❌ getIndPrice function is not available in SDK');
    }

  } catch (sdkError) {
    console.error('❌ Error initializing SDK:', sdkError);
  }

  console.log('🏁 getIndPrice test completed');
})();
