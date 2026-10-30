import WebSocket from 'ws';
import {apiFunctionFactory, ApiFunctionSpec} from './api-utils.js';

let sdkInstance: LSStockSDK | null = null;
let sdkReadyPromise: Promise<LSStockSDK> | null = null;
import {Subject, Observable, Subscription, from, concat, concatWith, pipe} from 'rxjs';
import {map, filter, share, tap} from 'rxjs/operators';
import {Emitter, Handler, mitt, tag} from "./utils";

// @ts-ignore
import 업종Data from './api-spec/업종.json' assert {type: 'json'};
// @ts-ignore
import 주식Data from './api-spec/주식.json' assert {type: 'json'};
// @ts-ignore
import 기타Data from './api-spec/기타.json' assert {type: 'json'};
import {resolve} from "node:dns";
import {
    ErrorTokenResponse,
    LSStockAPI,
    SDKConfig,
    StockStreamConfig,
    StreamData,
    TokenResponse,
    WS_TR_CD_TYPE, WS_TR_TYPE
} from "./types";

/**
 * Initialize the SDK and return the instance. Await this before using any SDK API in your server.
 * Usage (in your server entry):
 *   import { init, sdk } from './sdk';
 *   await init();
 *   // Now sdk.api.getMultiQuote etc. are available
 */
export async function init(): Promise<LSStockSDK> {
    if (!sdkReadyPromise) {
        sdkReadyPromise = LSStockSDK.getInstance().then(instance => {
            sdkInstance = instance;
            return instance;
        });
    }
    return sdkReadyPromise;
}

/**
 * Export the SDK instance (after init). Use only after calling await init().
 */
export const sdk = new Proxy({}, {
    get(_target, prop) {
        if (!sdkInstance) {
            throw new Error('SDK not initialized. Call and await init() before using sdk.');
        }
        return (sdkInstance as any)[prop];
    }
}) as LSStockSDK;

function getConfig():SDKConfig{
    return {
        baseUrl: process.env.LS_API_BASE_URL || 'https://openapi.ls-sec.co.kr:8080',
        apiKey: process.env.LS_API_KEY || '',
        apiSecret: process.env.LS_API_SECRET || '',
        wsEndpoint: process.env.LS_WS_ENDPOINT || 'wss://openapi.ls-sec.co.kr:29443/websocket'
    };
}


type EVENT_TYPE = 'news' | 'investor' | 'trade';
type PrefixedString = `${EVENT_TYPE}:${string}`;

type SDK_EVENT = {
    [key:PrefixedString]: object;
}

/**
 * LS Securities API SDK - TypeScript wrapper for REST API and WebSocket functionality
 * This class provides comprehensive access to LS Securities trading APIs
 */
export class LSStockSDK {
    private static instance: LSStockSDK | undefined;
    public readonly api: LSStockAPI = {} as LSStockAPI;
    public readonly ws: LSStockAPI = {} as LSStockAPI;
    private socket: WebSocket | undefined;
    private wsListenerByShcode: { [key: string]: any } = {};
    private newsHandler: Function | undefined;
    private investorHandler: Function | undefined;
    private static config: any;
    private static ApiCode2ApiSpec: Map<string, ApiFunctionSpec> = new Map();

    // Stream management
    private streamSubjects: Map<string, Subject<any>> = new Map();
    private streamObservables: Map<string, Observable<any>> = new Map();
    private emitter: Emitter<SDK_EVENT>;

    public static getApiSpecByCode(api_code: string): ApiFunctionSpec | undefined {
        return LSStockSDK.ApiCode2ApiSpec.get(api_code);
    }
    public static  getAllApiSpecs(): ApiFunctionSpec[] {
        return Array.from(LSStockSDK.ApiCode2ApiSpec.values());
    }

    public static async getToken(): Promise<TokenResponse | ErrorTokenResponse> {
        // Initialize global token storage if not set
        if (typeof (global as any)['ebest_token'] === 'undefined') {
            (global as any)['ebest_token'] = null;
        }

        // Check if token exists in memory and is still valid
        if (
            (global as any)['ebest_token'] &&
            (global as any)['ebest_token'].timestamp &&
            Date.now() - (global as any)['ebest_token'].timestamp < 86400 * 1000
        ) {
            return (global as any)['ebest_token'];
        }

        const LS_API_CONFIG = getConfig();
        // console.log(LS_API_CONFIG)

        // Get new token
        const PATH = '/oauth2/token';
        const headers = {'content-type': 'application/x-www-form-urlencoded'};
        const body = new URLSearchParams({
            appkey: LS_API_CONFIG.apiKey,
            appsecretkey: LS_API_CONFIG.apiSecret,
            grant_type: 'client_credentials',
            scope: 'oob',
        });



        const response = await fetch(LS_API_CONFIG.baseUrl + PATH, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        const result = await response.json();

        // Add timestamp to token data
        const tokenData = {
            ...result,
            timestamp: Date.now(),
        };

        // Check if the response contains an error
        if (tokenData.error_code) {
            console.error('LSStockSDK: Token request failed', tokenData);
            return tokenData as ErrorTokenResponse;
        }

        // Store token in memory only if successful
        (global as any)['ebest_token'] = tokenData;

        // console.log('LSStockSDK: Token received', tokenData);

        return tokenData;
    }

    private constructor() {
        this.emitter = mitt<SDK_EVENT>();
    }

    private async init() {
        await LSStockSDK.getToken();
        await this.restapi_init();
        await this.websocket_init();
    }

    public static async getInstance(config?: SDKConfig): Promise<LSStockSDK> {
        if (this.instance != null) {
            return this.instance;
        } else {
            if (config) {
                this.config = config;
            }else {
                this.config = getConfig();
            }
            this.instance = new LSStockSDK();
            await this.instance.init();
            return this.instance;
        }
    }

    /**
     * Dynamically add API function and expose via `api` object
     */
    private async addApiFunction(apiSpec: ApiFunctionSpec): Promise<void> {
        this.api[apiSpec.func_name] = await apiFunctionFactory(apiSpec);
        // add alias by api_code as well
        this.api[apiSpec.api_code] = await apiFunctionFactory(apiSpec);
    }

    /**
     * 등록된 API 함수 목록을 반환합니다
     */
    public getRegisteredApiFunctions(): string[] {
        return Object.keys(this.api);
    }

    private async restapi_init() {
        for (const api_info of [주식Data, 업종Data, 기타Data]) {
            for (const subCategory of api_info.sub_categories) {
                let api_list : ApiFunctionSpec[] = subCategory.api_list as ApiFunctionSpec[];
                for (const apiSpec of api_list) {
                    LSStockSDK.ApiCode2ApiSpec.set(apiSpec.api_code, apiSpec);
                    await this.addApiFunction(apiSpec as ApiFunctionSpec);
                }
            }
        }
    }





    /**
     * Add WebSocket message to database insertion queue
     */
    private queueWsMessage(data: any) {
        // TODO: logging
    }



    /**
     * 9시부터 장이 시작인경우 10시 부터 해당 종목을 관심있게 보고 매매하려는 경우
     * 9시부터 (현재)10시까지의 분봉 데이타(Historical)와 현재 시점 이후의 실시간 거래 데이타가 필요함.
     * 해당 데이타를 실시간으로 스트리밍하기 위한 메소드
     * @param shcode
     * @param config
     * @returns
     */
    public getTradeStream(shcode: string, config: StockStreamConfig = {}): Observable<StreamData> {
        // Check if stream already exists
        if (this.streamObservables.has(shcode)) {
            return this.streamObservables.get(shcode)!;
        }

        // Create real-time subject for this stock
        const realtimeSubject = new Subject<any>();
        this.streamSubjects.set(shcode, realtimeSubject);

        // Create unified stream
        const unifiedStream = this.createUnifiedStream(shcode, realtimeSubject, config);

        // Cache the observable
        this.streamObservables.set(shcode, unifiedStream);

        // // Setup WebSocket handler for this stock
        // this.setupWebSocketHandler(shcode, realtimeSubject);

        this.add_trade_hook_for_order(shcode, {
            handleTradeData: (data: any) => {
                realtimeSubject.next(data);
            }
        });

        return unifiedStream;
    }

    public async releaseTradeStream(shcode: string) {
        await this.removeTradeStream(shcode);
    }

    private createUnifiedStream(
        shcode: string,
        realtimeSubject: Subject<any>,
        config: StockStreamConfig
    ): Observable<StreamData> {

        const today = new Date();
        const todayStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

        // TODO: change to use api call
        // const candles  = ChartService.getIntradayChartData(shcode, '1m', todayStr, 1);

        // 1. Create historical data observable using from() on async generator
        const historicalObservable = from(this.getHistoricalDataGenerator(shcode, config)).pipe(
            filter(data => data.chetime >= '090000'), // From 9:00 AM
            map(data => (data) ),
            // tap(data =>  delete data._orgBody),
            tag({isHistorical: true}),
        );

        // 2. Create real-time data observable
        const realtimeObservable = realtimeSubject.pipe(
            filter(data => this.isRelevantTradingData(data)),
            tag({isHistorical: false})
        );

        // @ts-ignore
        return historicalObservable.pipe(
            concatWith(realtimeObservable),
            // @ts-ignore
            tag({shcode}),
            share()
        )
    }

    private async* getHistoricalDataGenerator(shcode: string, config: StockStreamConfig) {
        const historicalCount = this.calculateHistoricalCount(config.startTime || '09:00:00');

        // Use the existing SDK API that returns async generator
        const historicalGenerator = this.api.getStockPriceByMin({
            shcode: shcode,
            gubun: (config.intervalMinutes || 1).toString(),
            time: "",
            cnt: historicalCount
        });

        // Convert generator to array
        let historicalData: any[] = [];
        for await (const candleItem of historicalGenerator) {

            historicalData.push(candleItem);
        }

        // Reverse array to get chronological order
        historicalData.reverse();


        // Yield each formatted data point
        for (const candleItem of historicalData) {
            yield candleItem;
        }
    }

    private calculateHistoricalCount(startTime: string): number {
        const now = new Date();
        const today = new Date(now.toDateString() + ' ' + startTime);
        const minutesFromStart = Math.floor((now.getTime() - today.getTime()) / (1000 * 60)) + 1;

        // Limit to market hours (max 390 minutes = 6.5 hours)
        return Math.min(Math.max(minutesFromStart, 0), 390);
    }

    private formatStreamData(candleItem: any, isHistorical: boolean, shcode: string): StreamData {
        return {
            chetime: candleItem.chetime || "",
            date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
            open: parseFloat(candleItem.open) || 0,
            high: parseFloat(candleItem.high) || 0,
            low: parseFloat(candleItem.low) || 0,
            close: parseFloat(candleItem.close) || 0,
            sign: candleItem.sign || "0",
            diff: parseFloat(candleItem.diff) || 0,
            volume: parseInt(candleItem.volume) || 0,
            cvolume: parseInt(candleItem.cvolume) || 0,
            revolume: parseInt(candleItem.revolume) || 0,
            mdvolume: parseInt(candleItem.mdvolume) || 0,
            msvolume: parseInt(candleItem.msvolume) || 0,
            mdchecnt: parseInt(candleItem.mdchecnt) || 0,
            mschecnt: parseInt(candleItem.mschecnt) || 0,
            rechecnt: parseInt(candleItem.rechecnt) || 0,
            isHistorical,
            shcode,
            timestamp: new Date()
        };
    }



    private isRelevantTradingData(data: any): boolean {
        // Only process price update and order-related data
        return data.header?.tr_cd && (
            data.header.tr_cd.startsWith('S3_') ||  // KOSPI 체결
            data.header.tr_cd.startsWith('K3_') ||  // KOSDAQ 체결
            data.header.tr_cd.startsWith('SC')      // 주문 관련
        );
    }

    /**
     * Remove trade stream for a specific stock
     */
    private async removeTradeStream(shcode: string): Promise<void> {
        // 1) WS 핸들러 해제(동기적으로 매핑 제거 후 서버에 UNREGISTER 전송)
        try {
            await this.remove_trade_hook_for_order(shcode);
        } catch (e) {
            if (process.env.WS_DB_DEBUG === 'true') {
                console.warn('remove_trade_hook_for_order failed:', e);
            }
        }

        // 2) Subject complete 및 Map 정리
        const subject = this.streamSubjects.get(shcode);
        if (subject) {
            subject.complete();
            this.streamSubjects.delete(shcode);
        }

        // 3) 캐시된 Observable 제거
        this.streamObservables.delete(shcode);
    }


    private handleWsMessage(rawdata: string) {
        const data = JSON.parse(rawdata);
        // console.log('Received WebSocket message:', data);

        // Queue database insertion to prevent blocking
        this.queueWsMessage(data);

        if ([
            WS_TR_CD_TYPE.ORDER_CANCEL,
            WS_TR_CD_TYPE.ORDER_RECEIPT,
            WS_TR_CD_TYPE.ORDER_체결,
            WS_TR_CD_TYPE.ORDER_MODIFY,
            WS_TR_CD_TYPE.ORDER_REJECT,
            WS_TR_CD_TYPE.KOSDAQ_CHEGYUL,
            WS_TR_CD_TYPE.KOSPI_CHEGYUL,
            WS_TR_CD_TYPE.NXT_CHEGYUL,
        ].includes(data.header.tr_cd) && data.body) {

            if (data.header.tr_cd.startsWith('SC')) {
                console.log("###", data)
                let ssscode = data.body.shtcode?.substring(1) || data.body.shtnIsuno?.substring(1)
                console.log("###", ssscode)
                this.wsListenerByShcode['trade:'+ssscode]?.handleTradeData(data);
            } else if(data.header.tr_cd.startsWith('NS')){
                console.log("###", data)
                let ssscode = data.body.shtcode?.substring(1) || data.body.shtnIsuno?.substring(1)
                console.log("###", ssscode)
                this.wsListenerByShcode['trade:' + ssscode]?.handleTradeData(data);
            } else {
                this.wsListenerByShcode['trade:' + data.body.shcode]?.handleTradeData(data);
            }

        } else if ([WS_TR_CD_TYPE.NEWS_PACKET].includes(data.header.tr_cd)) {
            this.newsHandler?.(data);
        } else if ([WS_TR_CD_TYPE.TIME_INVESTOR].includes(data.header.tr_cd)) {
            this.investorHandler?.(data);
        }
    }

    private async sendRawWsRequest(
        shcode: string,
        tr_codes: [WS_TR_CD_TYPE, WS_TR_TYPE][],
    ) {
        for (const tr_cd_n_type of tr_codes) {
            let [tr_cd, tr_type] = tr_cd_n_type;
            // console.log('[tr_cd, tr_type]', tr_cd, tr_type)
            const request = {
                header: {
                    token: (global as any)['ebest_token'].access_token,
                    tr_type: tr_type,
                },
                body: {tr_cd, tr_key: shcode},
            };
            let reqjson = JSON.stringify(request)
            // console.log('sendRawWsRequest::', reqjson);
            this.socket!.send(reqjson);
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
    }

    private async websocket_init() {
        const LS_API_CONFIG = getConfig();
        this.socket = new WebSocket(LSStockSDK.config!.wsEndpoint);

        await new Promise((resolve, reject) => {
            this!.socket!.on('open', async (mesg: any) => {
                // console.log('WebSocket connection opened', mesg);

                await this.sendRawWsRequest("", [
                    [WS_TR_CD_TYPE.ORDER_체결, WS_TR_TYPE.REGISTER_ACCNT],
                    [WS_TR_CD_TYPE.ORDER_CANCEL, WS_TR_TYPE.REGISTER_ACCNT],
                    [WS_TR_CD_TYPE.ORDER_RECEIPT, WS_TR_TYPE.REGISTER_ACCNT],
                ]);

                // Register for news updates
                let request = {
                    header: {
                        token: (global as any)['ebest_token'].access_token,
                        tr_type: "3",
                    },
                    body: {tr_cd: "NWS", tr_key: "NWS001"},
                };
                let reqjson = JSON.stringify(request)
                this.socket!.send(reqjson);

                resolve('connection open');
            });
        });

        this.socket.on('message', this.handleWsMessage.bind(this));
        this.socket.on('close', (reason) => {
            console.log('WebSocket closed...', reason);
        });
        this.socket.on('error', (evt) => {
            console.log('WebSocket error...', evt);
        });
    }

    /**
     * Add trade data handler for a specific stock code
     */
    public add_trade_hook_for_order(shcode: string, handlerObj: object) {
        // 기존 핸들러가 있는 경우 제거
        this.remove_trade_hook_for_order(shcode);
        this.wsListenerByShcode['trade:'+ shcode] = handlerObj;

        this.sendRawWsRequest(shcode, [
            [WS_TR_CD_TYPE.KOSPI_CHEGYUL, WS_TR_TYPE.REGISTER_REALTIME],
            [WS_TR_CD_TYPE.KOSDAQ_CHEGYUL, WS_TR_TYPE.REGISTER_REALTIME],
        ]);
    }

    /**
     * Add news handler
     */
    public add_hook_for_news(handler: Handler<object>) {
        // this.newsHandler = handler;

        // @ts-ignore
        this.emitter.on('news', handler);
    }

    /**
     * Add investor data handler
     */
    public add_hook_for_investor(handler: Handler<object>) {
        // this.investorHandler = handler;
        // @ts-ignore
        this.emitter.on('investor', handler);
    }

    /**
     * Remove trade data handler for a specific stock code
     */
    public async remove_trade_hook_for_order(shcode: string) {
        if (!this.wsListenerByShcode['trade:'+ shcode]) return;
        let oldHandlerObj = this.wsListenerByShcode['trade:'+ shcode]

        // @ts-ignore
        this.emitter.off('trade:' + shcode, oldHandlerObj);
        this.wsListenerByShcode['trade:'+shcode] = undefined;

        console.log('=== Unregistering trade hook for ===', shcode);

        await this.sendRawWsRequest(shcode, [
            [WS_TR_CD_TYPE.KOSPI_CHEGYUL, WS_TR_TYPE.UNREGISTER_REALTIME],
            [WS_TR_CD_TYPE.KOSDAQ_CHEGYUL, WS_TR_TYPE.UNREGISTER_REALTIME],
        ]);
    }

    /**
     * Clean up resources (close WebSocket, clear handlers)
     */
    public async destroy() {
        // Clean up all streams
        this.streamSubjects.forEach(subject => subject.complete());
        this.streamSubjects.clear();
        this.streamObservables.clear();

        // Close WebSocket
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
            this.socket = undefined;
        }
        // Clear handlers and listeners
        this.wsListenerByShcode = {};
        this.newsHandler = undefined;
        this.investorHandler = undefined;
    }
}
