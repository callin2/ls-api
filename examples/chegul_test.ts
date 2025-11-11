import {LSStockSDK} from '../src';

(async () => {
    const sdk = await LSStockSDK.getInstance()
    let target_stock_list = ['042700', '000660', '278470']

    let target_stocks = [
        {
            "shcode": "042700"
        },
        {
            "shcode": "000660"
        },
        {
            "shcode": "278470"
        },
    ]

    target_stock_list.forEach(stock => {
        sdk.add_trade_hook_for_order(stock, {handleTradeData: console.log})
    })

    process.on('exit', async () => {
        console.log('process exit detected, cleaning up...');
        for (const stock of target_stocks) {
            await sdk.remove_trade_hook_for_order(stock.shcode);
        }
        await sdk.destroy();
        console.log('cleanup completed.');
    });

})();
