"use strict";
// LS Securities API SDK main export
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LSStockTradingSystem = exports.TradeAgent5 = exports.Account = exports.BaseTradeAgent = exports.apiFunctionFactory = exports.LSStockSDK = void 0;
const sdk_1 = require("./sdk");
var sdk_2 = require("./sdk");
Object.defineProperty(exports, "LSStockSDK", { enumerable: true, get: function () { return sdk_2.LSStockSDK; } });
// Export types
__exportStar(require("./types"), exports);
// Export trading functionality
__exportStar(require("./utils"), exports);
// Export utilities
var api_utils_1 = require("./api-utils");
Object.defineProperty(exports, "apiFunctionFactory", { enumerable: true, get: function () { return api_utils_1.apiFunctionFactory; } });
class BaseTradeAgent {
    handleNewsData(data) {
        // do nothing.
    }
}
exports.BaseTradeAgent = BaseTradeAgent;
class Account {
    constructor() {
        this.cash = { buyable: 0, hold: 0 };
        this.stockAmt = { sellable: 0, hold: 0 };
        this.waiting_orders = [];
    }
    static create(shcode, budget) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = new Account();
            instance.sdk = yield sdk_1.LSStockSDK.getInstance();
            return instance;
        });
    }
    /**
     * 주식주문 API 의 처리중에 발생하는 websocket message 를 처리하여 현 계정의 자산을 현행화 한다.
     */
    handleWsMessage(msg) {
        console.log('Account:', msg);
    }
    buyStockNow(_shcode, qty) {
        return __awaiter(this, void 0, void 0, function* () {
            if (qty === 0)
                return;
            try {
                const shcode = 'A' + _shcode; //모의투자는 A 접두어를 붙임
                const info = yield this.sdk.api.orderStock({
                    "IsuNo": shcode,
                    "OrdQty": qty,
                    "OrdPrc": 0, // 시장가주문은 가격이 0
                    "BnsTpCode": "2", // buy
                    "OrdprcPtnCode": "03", // 시장가
                    "MgntrnCode": "000", // 보통
                    "LoanDt": "", // 대출일
                    "OrdCndiTpCode": "0", // 조건구분 : 없음
                    "MbrNo": ""
                });
                console.log("### " + info);
                // todo: 체결되기 이전에라도 잔고금액에서는 일단 차감해야함.
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    sellStockNow(_shcode, qty) {
        return __awaiter(this, void 0, void 0, function* () {
            if (qty === 0)
                return;
            try {
                const shcode = 'A' + _shcode;
                const info = yield this.sdk.api.orderStock({
                    "IsuNo": shcode,
                    "OrdQty": qty,
                    "OrdPrc": 0,
                    "BnsTpCode": "1", // sell
                    "OrdprcPtnCode": "03", // 시장가
                    "MgntrnCode": "000",
                    "LoanDt": "",
                    "OrdCndiTpCode": "0",
                    "MbrNo": ""
                });
                console.log("### " + info);
                // todo: 체결되기 이전에라도 보유주식수에서 일단 차감해야함.
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    cancelOrder(ordNo, _shcode, qty) {
        return __awaiter(this, void 0, void 0, function* () {
            const shcode = 'A' + _shcode;
            const info = yield this.sdk.api.cancelSpotOrder({
                "RecCnt": 1,
                "OrgOrdNo": ordNo,
                "IsuNo": shcode,
                "OrdQty": qty,
                "CommdaCode": "",
                "GrpId": "",
                "StrtgCode": "",
                "OrdSeqNo": 0,
                "PtflNo": 0,
                "BskNo": 0,
                "TrchNo": 0,
                "ItemNo": 0
            });
            console.log("### " + info);
        });
    }
    sellStock(_shcode, qty, price) {
        return __awaiter(this, void 0, void 0, function* () {
            if (qty === 0)
                return;
            try {
                const shcode = 'A' + _shcode;
                const info = yield this.sdk.api.orderStock({
                    "IsuNo": shcode,
                    "OrdQty": qty,
                    "OrdPrc": price,
                    "BnsTpCode": "1",
                    "OrdprcPtnCode": "00",
                    "MgntrnCode": "000",
                    "LoanDt": "",
                    "OrdCndiTpCode": "0",
                    "MbrNo": ""
                });
                console.log("### " + info);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    buyStock(_shcode, qty, price) {
        return __awaiter(this, void 0, void 0, function* () {
            if (qty === 0)
                return;
            try {
                const shcode = 'A' + _shcode;
                const info = yield this.sdk.api.orderStock({
                    "IsuNo": shcode,
                    "OrdQty": qty,
                    "OrdPrc": price,
                    "BnsTpCode": "2",
                    "OrdprcPtnCode": "00",
                    "MgntrnCode": "000",
                    "LoanDt": "",
                    "OrdCndiTpCode": "0",
                    "MbrNo": ""
                });
                console.log("### " + info);
                // todo: 체결되기 이전에라도 잔고금액에서는 일단 차감해야함.
            }
            catch (error) {
                console.error(error);
            }
        });
    }
}
exports.Account = Account;
class TradeAgent5 extends BaseTradeAgent {
    constructor(shcode, budget) {
        super();
        this.budget = 0;
        this.isActive = false;
        this.config = {
            candlePeriod: '3m',
        };
        // Store operator state objects
        this.operatorStates = {};
        this.shcode = shcode;
        this.budget = budget;
        this.init();
        console.log(`TradeAgent5 started for ${shcode}`);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.sdk = yield sdk_1.LSStockSDK.getInstance();
            this.account = yield Account.create(this.shcode, this.budget);
            this.sdk.add_trade_hook_for_order(this.shcode, this.handleTradeData.bind(this));
            this.isActive = true;
        });
    }
    stopTrade() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sdk) {
                this.sdk.remove_trade_hook_for_order(this.shcode);
            }
            this.isActive = false;
            console.log('TradeAgent5 stopped:', this.shcode);
        });
    }
    handleTradeData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.isActive)
                return;
            // Process the trade data
            console.log('Processing trade data:', data);
            // Handle account updates
            (_a = this.account) === null || _a === void 0 ? void 0 : _a.handleWsMessage(data);
        });
    }
}
exports.TradeAgent5 = TradeAgent5;
class LSStockTradingSystem {
    constructor() {
        this.activeTradeAgents = {};
    }
    static getInstance(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._instance != null) {
                return this._instance;
            }
            else {
                this._instance = new LSStockTradingSystem();
                return this._instance;
            }
        });
    }
    startTrade(shcode, budget, tradeType) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("start trade : ", shcode, budget, tradeType);
            if (this.activeTradeAgents[shcode])
                return; // 이미 있으면 skip
            let Clazz = this.getTradeAgentClassByType(tradeType);
            const tradeAgent = new Clazz(shcode, budget);
            this.activeTradeAgents[shcode] = tradeAgent;
        });
    }
    getTradeAgentClassByType(tradeType) {
        // TODO: implements
        switch (tradeType) {
            case '종가매매':
                return TradeAgent5;
            // 다른 타입을 추가하려면 case를 확장
            default:
                return TradeAgent5;
        }
    }
    getCurrentTradingStatus() {
        // todo : implements
    }
}
exports.LSStockTradingSystem = LSStockTradingSystem;
/**
 * Singleton instance getter
 */
LSStockTradingSystem._instance = null;
