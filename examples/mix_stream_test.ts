import { LSStockSDK } from '../src';
import { filter, tap, map } from 'rxjs/operators';
import * as util from "node:util";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
    console.log('Starting stream test...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({ path: resolve(__dirname, '../.env') });

    const sdk = await LSStockSDK.getInstance();


    // Test with Samsung Electronics (005930)
    const sampleStream = sdk.getTradeStream('005930', {
        startTime: '09:00:00',
        intervalMinutes: 1
    });

    console.log('Created Samsung stream, subscribing...');

    // Subscribe to the stream
    const subscription = sampleStream.pipe(
        // Log all data points
        tap(data => {
            console.log('##', util.inspect(data));
            // console.log(`${data.shcode} - ${data.chetime}: ${data.close} (Historical: ${data.isHistorical})`);
        }),

        // Filter for significant price changes
        filter(data => Math.abs(data.diff) > 100),

        // Format for display
        map(data => ({
            stock: data.shcode,
            time: data.chetime,
            price: data.close,
            change: data.diff,
            volume: data.volume,
            isHistorical: data.isHistorical
        }))
    ).subscribe({
        next: (data) => {
            console.log('*** Significant price change:', data);
        },
        error: (err) => {
            console.error('Stream error:', err);
        },
        complete: () => {
            console.log('Stream completed');
        }
    });



})().catch(console.error);
