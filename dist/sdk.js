"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LSStockSDK = exports.sdk = void 0;
exports.init = init;
const ws_1 = __importDefault(require("ws"));
const api_utils_js_1 = require("./api-utils.js");
let sdkInstance = null;
let sdkReadyPromise = null;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const utils_1 = require("./utils");
// @ts-ignore
const ___json_1 = __importDefault(require("./api-spec/\uC5C5\uC885.json"));
// @ts-ignore
const ___json_2 = __importDefault(require("./api-spec/\uC8FC\uC2DD.json"));
// @ts-ignore
const ___json_3 = __importDefault(require("./api-spec/\uAE30\uD0C0.json"));
const types_1 = require("./types");
/**
 * Initialize the SDK and return the instance. Await this before using any SDK API in your server.
 * Usage (in your server entry):
 *   import { init, sdk } from './sdk';
 *   await init();
 *   // Now sdk.api.getMultiQuote etc. are available
 */
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sdkReadyPromise) {
            sdkReadyPromise = LSStockSDK.getInstance().then(instance => {
                sdkInstance = instance;
                return instance;
            });
        }
        return sdkReadyPromise;
    });
}
/**
 * Export the SDK instance (after init). Use only after calling await init().
 */
exports.sdk = new Proxy({}, {
    get(_target, prop) {
        if (!sdkInstance) {
            throw new Error('SDK not initialized. Call and await init() before using sdk.');
        }
        return sdkInstance[prop];
    }
});
function getConfig() {
    return {
        baseUrl: process.env.LS_API_BASE_URL || 'https://openapi.ls-sec.co.kr:8080',
        apiKey: process.env.LS_API_KEY || '',
        apiSecret: process.env.LS_API_SECRET || '',
        wsEndpoint: process.env.LS_WS_ENDPOINT || 'wss://openapi.ls-sec.co.kr:29443/websocket'
    };
}
/**
 * LS Securities API SDK - TypeScript wrapper for REST API and WebSocket functionality
 * This class provides comprehensive access to LS Securities trading APIs
 */
class LSStockSDK {
    static getApiSpecByCode(api_code) {
        return LSStockSDK.ApiCode2ApiSpec.get(api_code);
    }
    static getAllApiSpecs() {
        return Array.from(LSStockSDK.ApiCode2ApiSpec.values());
    }
    static getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize global token storage if not set
            if (typeof global['ebest_token'] === 'undefined') {
                global['ebest_token'] = null;
            }
            // Check if token exists in memory and is still valid
            if (global['ebest_token'] &&
                global['ebest_token'].timestamp &&
                Date.now() - global['ebest_token'].timestamp < 86400 * 1000) {
                return global['ebest_token'];
            }
            const LS_API_CONFIG = getConfig();
            // console.log(LS_API_CONFIG)
            // Get new token
            const PATH = '/oauth2/token';
            const headers = { 'content-type': 'application/x-www-form-urlencoded' };
            const body = new URLSearchParams({
                appkey: LS_API_CONFIG.apiKey,
                appsecretkey: LS_API_CONFIG.apiSecret,
                grant_type: 'client_credentials',
                scope: 'oob',
            });
            const response = yield fetch(LS_API_CONFIG.baseUrl + PATH, {
                method: 'POST',
                headers: headers,
                body: body,
            });
            const result = yield response.json();
            // Add timestamp to token data
            const tokenData = Object.assign(Object.assign({}, result), { timestamp: Date.now() });
            // Check if the response contains an error
            if (tokenData.error_code) {
                console.error('LSStockSDK: Token request failed', tokenData);
                return tokenData;
            }
            // Store token in memory only if successful
            global['ebest_token'] = tokenData;
            // console.log('LSStockSDK: Token received', tokenData);
            return tokenData;
        });
    }
    constructor() {
        this.api = {};
        this.ws = {};
        this.wsListenerByShcode = {};
        // Stream management
        this.streamSubjects = new Map();
        this.streamObservables = new Map();
        this.emitter = (0, utils_1.mitt)();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield LSStockSDK.getToken();
            yield this.restapi_init();
            yield this.websocket_init();
        });
    }
    static getInstance(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.instance != null) {
                return this.instance;
            }
            else {
                if (config) {
                    this.config = config;
                }
                else {
                    this.config = getConfig();
                }
                this.instance = new LSStockSDK();
                yield this.instance.init();
                return this.instance;
            }
        });
    }
    /**
     * Dynamically add API function and expose via `api` object
     */
    addApiFunction(apiSpec) {
        return __awaiter(this, void 0, void 0, function* () {
            this.api[apiSpec.func_name] = yield (0, api_utils_js_1.apiFunctionFactory)(apiSpec);
        });
    }
    /**
     * 등록된 API 함수 목록을 반환합니다
     */
    getRegisteredApiFunctions() {
        return Object.keys(this.api);
    }
    restapi_init() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const api_info of [___json_2.default, ___json_1.default, ___json_3.default]) {
                for (const subCategory of api_info.sub_categories) {
                    let api_list = subCategory.api_list;
                    for (const apiSpec of api_list) {
                        LSStockSDK.ApiCode2ApiSpec.set(apiSpec.api_code, apiSpec);
                        yield this.addApiFunction(apiSpec);
                    }
                }
            }
        });
    }
    /**
     * Add WebSocket message to database insertion queue
     */
    queueWsMessage(data) {
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
    getTradeStream(shcode, config = {}) {
        // Check if stream already exists
        if (this.streamObservables.has(shcode)) {
            return this.streamObservables.get(shcode);
        }
        // Create real-time subject for this stock
        const realtimeSubject = new rxjs_1.Subject();
        this.streamSubjects.set(shcode, realtimeSubject);
        // Create unified stream
        const unifiedStream = this.createUnifiedStream(shcode, realtimeSubject, config);
        // Cache the observable
        this.streamObservables.set(shcode, unifiedStream);
        // // Setup WebSocket handler for this stock
        // this.setupWebSocketHandler(shcode, realtimeSubject);
        this.add_trade_hook_for_order(shcode, {
            handleTradeData: (data) => {
                realtimeSubject.next(data);
            }
        });
        return unifiedStream;
    }
    releaseTradeStream(shcode) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.removeTradeStream(shcode);
        });
    }
    createUnifiedStream(shcode, realtimeSubject, config) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
        // TODO: change to use api call
        // const candles  = ChartService.getIntradayChartData(shcode, '1m', todayStr, 1);
        // 1. Create historical data observable using from() on async generator
        const historicalObservable = (0, rxjs_1.from)(this.getHistoricalDataGenerator(shcode, config)).pipe((0, operators_1.filter)(data => data.chetime >= '090000'), // From 9:00 AM
        (0, operators_1.map)(data => (data)), 
        // tap(data =>  delete data._orgBody),
        (0, utils_1.tag)({ isHistorical: true }));
        // 2. Create real-time data observable
        const realtimeObservable = realtimeSubject.pipe((0, operators_1.filter)(data => this.isRelevantTradingData(data)), (0, utils_1.tag)({ isHistorical: false }));
        // @ts-ignore
        return historicalObservable.pipe((0, rxjs_1.concatWith)(realtimeObservable), 
        // @ts-ignore
        (0, utils_1.tag)({ shcode }), (0, operators_1.share)());
    }
    getHistoricalDataGenerator(shcode, config) {
        return __asyncGenerator(this, arguments, function* getHistoricalDataGenerator_1() {
            var _a, e_1, _b, _c;
            const historicalCount = this.calculateHistoricalCount(config.startTime || '09:00:00');
            // Use the existing SDK API that returns async generator
            const historicalGenerator = this.api.getStockPriceByMin({
                shcode: shcode,
                gubun: (config.intervalMinutes || 1).toString(),
                time: "",
                cnt: historicalCount
            });
            // Convert generator to array
            let historicalData = [];
            try {
                for (var _d = true, historicalGenerator_1 = __asyncValues(historicalGenerator), historicalGenerator_1_1; historicalGenerator_1_1 = yield __await(historicalGenerator_1.next()), _a = historicalGenerator_1_1.done, !_a; _d = true) {
                    _c = historicalGenerator_1_1.value;
                    _d = false;
                    const candleItem = _c;
                    historicalData.push(candleItem);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = historicalGenerator_1.return)) yield __await(_b.call(historicalGenerator_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Reverse array to get chronological order
            historicalData.reverse();
            // Yield each formatted data point
            for (const candleItem of historicalData) {
                yield yield __await(candleItem);
            }
        });
    }
    calculateHistoricalCount(startTime) {
        const now = new Date();
        const today = new Date(now.toDateString() + ' ' + startTime);
        const minutesFromStart = Math.floor((now.getTime() - today.getTime()) / (1000 * 60)) + 1;
        // Limit to market hours (max 390 minutes = 6.5 hours)
        return Math.min(Math.max(minutesFromStart, 0), 390);
    }
    formatStreamData(candleItem, isHistorical, shcode) {
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
    isRelevantTradingData(data) {
        var _a;
        // Only process price update and order-related data
        return ((_a = data.header) === null || _a === void 0 ? void 0 : _a.tr_cd) && (data.header.tr_cd.startsWith('S3_') || // KOSPI 체결
            data.header.tr_cd.startsWith('K3_') || // KOSDAQ 체결
            data.header.tr_cd.startsWith('SC') // 주문 관련
        );
    }
    /**
     * Remove trade stream for a specific stock
     */
    removeTradeStream(shcode) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1) WS 핸들러 해제(동기적으로 매핑 제거 후 서버에 UNREGISTER 전송)
            try {
                yield this.remove_trade_hook_for_order(shcode);
            }
            catch (e) {
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
        });
    }
    handleWsMessage(rawdata) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const data = JSON.parse(rawdata);
        // console.log('Received WebSocket message:', data);
        // Queue database insertion to prevent blocking
        this.queueWsMessage(data);
        if ([
            types_1.WS_TR_CD_TYPE.ORDER_CANCEL,
            types_1.WS_TR_CD_TYPE.ORDER_RECEIPT,
            types_1.WS_TR_CD_TYPE.ORDER_체결,
            types_1.WS_TR_CD_TYPE.ORDER_MODIFY,
            types_1.WS_TR_CD_TYPE.ORDER_REJECT,
            types_1.WS_TR_CD_TYPE.KOSDAQ_CHEGYUL,
            types_1.WS_TR_CD_TYPE.KOSPI_CHEGYUL,
            types_1.WS_TR_CD_TYPE.NXT_CHEGYUL,
        ].includes(data.header.tr_cd) && data.body) {
            if (data.header.tr_cd.startsWith('SC')) {
                console.log("###", data);
                let ssscode = ((_a = data.body.shtcode) === null || _a === void 0 ? void 0 : _a.substring(1)) || ((_b = data.body.shtnIsuno) === null || _b === void 0 ? void 0 : _b.substring(1));
                console.log("###", ssscode);
                (_c = this.wsListenerByShcode['trade:' + ssscode]) === null || _c === void 0 ? void 0 : _c.handleTradeData(data);
            }
            else if (data.header.tr_cd.startsWith('NS')) {
                console.log("###", data);
                let ssscode = ((_d = data.body.shtcode) === null || _d === void 0 ? void 0 : _d.substring(1)) || ((_e = data.body.shtnIsuno) === null || _e === void 0 ? void 0 : _e.substring(1));
                console.log("###", ssscode);
                (_f = this.wsListenerByShcode['trade:' + ssscode]) === null || _f === void 0 ? void 0 : _f.handleTradeData(data);
            }
            else {
                (_g = this.wsListenerByShcode['trade:' + data.body.shcode]) === null || _g === void 0 ? void 0 : _g.handleTradeData(data);
            }
        }
        else if ([types_1.WS_TR_CD_TYPE.NEWS_PACKET].includes(data.header.tr_cd)) {
            (_h = this.newsHandler) === null || _h === void 0 ? void 0 : _h.call(this, data);
        }
        else if ([types_1.WS_TR_CD_TYPE.TIME_INVESTOR].includes(data.header.tr_cd)) {
            (_j = this.investorHandler) === null || _j === void 0 ? void 0 : _j.call(this, data);
        }
    }
    sendRawWsRequest(shcode, tr_codes) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const tr_cd_n_type of tr_codes) {
                let [tr_cd, tr_type] = tr_cd_n_type;
                // console.log('[tr_cd, tr_type]', tr_cd, tr_type)
                const request = {
                    header: {
                        token: global['ebest_token'].access_token,
                        tr_type: tr_type,
                    },
                    body: { tr_cd, tr_key: shcode },
                };
                let reqjson = JSON.stringify(request);
                // console.log('sendRawWsRequest::', reqjson);
                this.socket.send(reqjson);
                yield new Promise((resolve) => setTimeout(resolve, 10));
            }
        });
    }
    websocket_init() {
        return __awaiter(this, void 0, void 0, function* () {
            const LS_API_CONFIG = getConfig();
            this.socket = new ws_1.default(LSStockSDK.config.wsEndpoint);
            yield new Promise((resolve, reject) => {
                this.socket.on('open', (mesg) => __awaiter(this, void 0, void 0, function* () {
                    // console.log('WebSocket connection opened', mesg);
                    yield this.sendRawWsRequest("", [
                        [types_1.WS_TR_CD_TYPE.ORDER_체결, types_1.WS_TR_TYPE.REGISTER_ACCNT],
                        [types_1.WS_TR_CD_TYPE.ORDER_CANCEL, types_1.WS_TR_TYPE.REGISTER_ACCNT],
                        [types_1.WS_TR_CD_TYPE.ORDER_RECEIPT, types_1.WS_TR_TYPE.REGISTER_ACCNT],
                    ]);
                    // Register for news updates
                    let request = {
                        header: {
                            token: global['ebest_token'].access_token,
                            tr_type: "3",
                        },
                        body: { tr_cd: "NWS", tr_key: "NWS001" },
                    };
                    let reqjson = JSON.stringify(request);
                    this.socket.send(reqjson);
                    resolve('connection open');
                }));
            });
            this.socket.on('message', this.handleWsMessage.bind(this));
            this.socket.on('close', (reason) => {
                console.log('WebSocket closed...', reason);
            });
            this.socket.on('error', (evt) => {
                console.log('WebSocket error...', evt);
            });
        });
    }
    /**
     * Add trade data handler for a specific stock code
     */
    add_trade_hook_for_order(shcode, handlerObj) {
        // 기존 핸들러가 있는 경우 제거
        this.remove_trade_hook_for_order(shcode);
        this.wsListenerByShcode['trade:' + shcode] = handlerObj;
        this.sendRawWsRequest(shcode, [
            [types_1.WS_TR_CD_TYPE.KOSPI_CHEGYUL, types_1.WS_TR_TYPE.REGISTER_REALTIME],
            [types_1.WS_TR_CD_TYPE.KOSDAQ_CHEGYUL, types_1.WS_TR_TYPE.REGISTER_REALTIME],
        ]);
    }
    /**
     * Add news handler
     */
    add_hook_for_news(handler) {
        // this.newsHandler = handler;
        // @ts-ignore
        this.emitter.on('news', handler);
    }
    /**
     * Add investor data handler
     */
    add_hook_for_investor(handler) {
        // this.investorHandler = handler;
        // @ts-ignore
        this.emitter.on('investor', handler);
    }
    /**
     * Remove trade data handler for a specific stock code
     */
    remove_trade_hook_for_order(shcode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.wsListenerByShcode['trade:' + shcode])
                return;
            let oldHandlerObj = this.wsListenerByShcode['trade:' + shcode];
            // @ts-ignore
            this.emitter.off('trade:' + shcode, oldHandlerObj);
            this.wsListenerByShcode['trade:' + shcode] = undefined;
            console.log('=== Unregistering trade hook for ===', shcode);
            yield this.sendRawWsRequest(shcode, [
                [types_1.WS_TR_CD_TYPE.KOSPI_CHEGYUL, types_1.WS_TR_TYPE.UNREGISTER_REALTIME],
                [types_1.WS_TR_CD_TYPE.KOSDAQ_CHEGYUL, types_1.WS_TR_TYPE.UNREGISTER_REALTIME],
            ]);
        });
    }
    /**
     * Clean up resources (close WebSocket, clear handlers)
     */
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            // Clean up all streams
            this.streamSubjects.forEach(subject => subject.complete());
            this.streamSubjects.clear();
            this.streamObservables.clear();
            // Close WebSocket
            if (this.socket && this.socket.readyState === ws_1.default.OPEN) {
                this.socket.close();
                this.socket = undefined;
            }
            // Clear handlers and listeners
            this.wsListenerByShcode = {};
            this.newsHandler = undefined;
            this.investorHandler = undefined;
        });
    }
}
exports.LSStockSDK = LSStockSDK;
LSStockSDK.ApiCode2ApiSpec = new Map();
