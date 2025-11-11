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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
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
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiFunctionFactory = void 0;
// Simple memoization utility
function memoize(fn) {
    const cache = new Map();
    return ((...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    });
}
/**
 * Creates a throttled async generator function for making API requests based on a given API specification.
 *
 * This factory function dynamically generates an async generator that handles API requests with throttling,
 * memoization, and recursive pagination support. It is designed to work with APIs that require rate limiting
 * and may return paginated results, such as the LS Securities OpenAPI.
 *
 * Features:
 * - Throttles API calls to avoid exceeding rate limits (calls per second).
 * - Handles recursive pagination by yielding results and making additional requests if continuation tokens are present.
 * - Automatically injects authorization headers and handles request/response formatting.
 * - Supports different input/output block structures depending on the API endpoint.
 * - Returns an async generator function that yields each result item individually.
 *
 * @param {ApiFunctionSpec} apiSpec - The API specification object, including endpoint, method, headers, body, throttle, etc.
 * @returns {Function} An async generator function that accepts an input block and yields API response items, respecting throttle limits.
 *
 * @throws {Error} If the apiSpec parameter is missing.
 *
 * @example
 * const getStockInfo = await apiFunctionFactory({ ...apiSpec });
 * for await (const item of getStockInfo(inputBlock)) {
 *   // process item
 * }
 */
function _apiFunctionFactory(apiSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiSpec) {
            throw new Error(`apiSpec parameter missing.`);
        }
        const { api_code } = apiSpec;
        // Helper to stringify apiSpec safely
        function apiSpecInfo() {
            try {
                return JSON.stringify(apiSpec);
            }
            catch (e) {
                return String(apiSpec);
            }
        }
        // Create a global queue-based throttle per api_code
        const throttleQueues = global._lsApiThrottleQueues || (global._lsApiThrottleQueues = {});
        if (!throttleQueues[api_code]) {
            throttleQueues[api_code] = {
                queue: [],
                running: false,
            };
        }
        const queueObj = throttleQueues[api_code];
        // Add a buffer to the interval to avoid accidental overlap (e.g., 20ms)
        const minInterval = 1000 / (apiSpec.throttle || 1) + 20;
        const throttleGenerator = (callsPerSecond, generatorFn) => {
            return function (...args) {
                return __asyncGenerator(this, arguments, function* () {
                    var _a, e_1, _b, _c;
                    // Wrap the generator in a promise and push to the queue
                    let resolveGen = () => {
                    };
                    const genPromise = new Promise((resolve) => {
                        resolveGen = resolve;
                    });
                    queueObj.queue.push({ args: Array.isArray(args) ? args : [args], resolveGen });
                    // Start the queue processor if not running
                    if (!queueObj.running) {
                        queueObj.running = true;
                        (() => __awaiter(this, void 0, void 0, function* () {
                            while (queueObj.queue.length > 0) {
                                const item = queueObj.queue.shift();
                                // @ts-ignore
                                const gen = generatorFn(...item.args);
                                item.resolveGen(gen);
                                // Only wait for the API request to be created, not for generator to finish
                                yield new Promise(res => setTimeout(res, minInterval));
                            }
                            queueObj.running = false;
                        }))();
                    }
                    // Wait for our turn and yield from the generator
                    const realGen = yield __await(genPromise);
                    try {
                        for (var _d = true, realGen_1 = __asyncValues(realGen), realGen_1_1; realGen_1_1 = yield __await(realGen_1.next()), _a = realGen_1_1.done, !_a; _d = true) {
                            _c = realGen_1_1.value;
                            _d = false;
                            const val = _c;
                            yield yield __await(val);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = realGen_1.return)) yield __await(_b.call(realGen_1));
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                });
            };
        };
        // Define the generator function that will be throttled
        // @ts-ignore
        function _api_generator(inputBlock_1) {
            return __asyncGenerator(this, arguments, function* _api_generator_1(inputBlock, recursionCount = 0) {
                // Limit recursion to prevent infinite loops
                if (recursionCount >= 999) {
                    return yield __await(void 0);
                }
                // moved into retry loop below
                let retryCount = 0;
                let result = null;
                let response = null;
                while (true) {
                    // Prepare headers and body for each retry
                    const headers = JSON.parse(JSON.stringify(apiSpec.headers));
                    // @ts-ignore
                    headers['authorization'] = 'Bearer ' + global['ebest_token'].access_token;
                    const body = JSON.parse(JSON.stringify(apiSpec.body));
                    if (recursionCount > 0) {
                        headers['tr_cont'] = 'Y';
                        headers['tr_cont_key'] = '0';
                    }
                    // Check LS_API_CONFIG availability
                    const LS_API_CONFIG = {
                        baseUrl: process.env.LS_API_BASE_URL || 'https://openapi.ls-sec.co.kr:8080',
                        apiKey: process.env.LS_API_KEY || '',
                        apiSecret: process.env.LS_API_SECRET || '',
                        wsEndpoint: process.env.LS_WS_ENDPOINT || 'wss://openapi.ls-sec.co.kr:29443/websocket'
                    };
                    if (apiSpec.url == "/stock/order") {
                        body[api_code + 'InBlock1'] = inputBlock;
                    }
                    else {
                        body[api_code + 'InBlock'] = inputBlock;
                    }
                    try {
                        response = yield __await(fetch(LS_API_CONFIG.baseUrl + apiSpec.url, {
                            method: apiSpec.method,
                            headers: headers,
                            body: JSON.stringify(body),
                        }));
                        try {
                            result = yield __await(response.json());
                        }
                        catch (err) {
                            result = null;
                        }
                    }
                    catch (err) {
                        throw new Error(` error in _apiFunctionFactory. apiSpec: ${apiSpecInfo()}\nError: ${err}`);
                    }
                    // Retry on rate limit error (IGW00201)
                    if (result && result.rsp_cd === 'IGW00201') {
                        retryCount++;
                        const retryDelay = 1500 + Math.floor(Math.random() * 500); // 1.5~2s
                        if (retryCount > 5) {
                            console.error('sdk error result:', result, '\napiSpec:', apiSpecInfo());
                            throw new Error(`API response error (rate limit, retried 5x) in _apiFunctionFactory. apiSpec: ${apiSpecInfo()}\nResult: ${JSON.stringify(result)}`);
                        }
                        yield __await(new Promise(res => setTimeout(res, retryDelay)));
                        continue;
                    }
                    // Retry on token expired error (IGW00121)
                    if (result && result.rsp_cd === 'IGW00121') {
                        global['ebest_token'] = null;
                        continue;
                    }
                    if (response && response.status !== 200) {
                        console.error('sdk error result:', result, '\napiSpec:', apiSpecInfo());
                        throw new Error(`API response error (status ${response.status}) in _apiFunctionFactory. apiSpec: ${apiSpecInfo()}\nResult: ${JSON.stringify(result)}`);
                    }
                    if (result == null) {
                        throw new Error(`Failed to parse JSON response in _apiFunctionFactory. apiSpec: ${apiSpecInfo()}`);
                    }
                    break;
                }
                if (apiSpec.url == "/stock/order") {
                    yield yield __await(result[api_code + 'OutBlock2']);
                    return yield __await(void 0);
                }
                if (!result[api_code + 'OutBlock1']) {
                    if (Array.isArray(result[api_code + 'OutBlock'])) {
                        for (const item of result[api_code + 'OutBlock']) {
                            yield yield __await(item);
                        }
                    }
                    else if (result[api_code + 'OutBlock']) {
                        yield yield __await(result[api_code + 'OutBlock']);
                    }
                    else {
                        console.error('result!:', JSON.stringify(result));
                    }
                    return yield __await(void 0);
                }
                try {
                    // Yield each item in the result array
                    if (!Array.isArray(result[api_code + 'OutBlock1'])) {
                        yield yield __await(result[api_code + 'OutBlock1']);
                        return yield __await(void 0);
                    }
                    for (const item of result[api_code + 'OutBlock1']) {
                        // item._orgBody = result
                        yield yield __await(item);
                    }
                }
                catch (error) {
                    console.error(result, api_code);
                    throw error;
                }
                if (result[api_code + 'OutBlock'] &&
                    (result[api_code + 'OutBlock']['cts_date'] ||
                        result[api_code + 'OutBlock']['cts_time'] ||
                        result[api_code + 'OutBlock']['tr_cont_key'])) {
                    if (result[api_code + 'OutBlock']['cts_date']
                    // && result[api_code + 'OutBlock']['cts_time'].length > 4
                    ) {
                        inputBlock['cts_date'] = result[api_code + 'OutBlock']['cts_date'];
                    }
                    if (result[api_code + 'OutBlock']['cts_time'] &&
                        result[api_code + 'OutBlock']['cts_time'].length > 4) {
                        inputBlock['cts_time'] = result[api_code + 'OutBlock']['cts_time'];
                    }
                    else if (result[api_code + 'OutBlock']['tr_cont_key']) {
                        inputBlock['tr_cont_key'] =
                            result[api_code + 'OutBlock']['tr_cont_key'];
                    }
                    // Sleep 1 second before next request
                    yield __await(new Promise((resolve) => setTimeout(resolve, 1000)));
                    // Recursively yield more results
                    yield __await(yield* __asyncDelegator(__asyncValues(_api_generator(inputBlock, recursionCount + 1))));
                }
            });
        }
        // Return the throttled generator
        return throttleGenerator(apiSpec.throttle || 1, _api_generator);
    });
}
exports.apiFunctionFactory = memoize(_apiFunctionFactory);
