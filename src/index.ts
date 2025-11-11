// LS Securities API SDK main export

import { LSStockSDK } from './sdk';

export { LSStockSDK } from './sdk';

// Export types
export * from './types';

// Export trading functionality
export * from './utils';

// Export utilities
export { apiFunctionFactory } from './api-utils';
export type { ApiFunctionSpec } from './api-utils';

export interface IRealtimeTradeDataConsumer {
    handleTradeData(data: object): void;
    handleNewsData?(data: object): void;
}

export abstract class BaseTradeAgent implements IRealtimeTradeDataConsumer {
    abstract handleTradeData(data: object): void;
    handleNewsData(data: object) {
        // do nothing.
    }
}

export class Account {
    private sdk: LSStockSDK | undefined;

    private cash = {buyable:0, hold:0}
    private stockAmt = {sellable:0, hold:0}
    private waiting_orders: any[] = []

    private constructor() {}

    static async create(shcode: string, budget: number) {
        const instance = new Account();
        instance.sdk = await LSStockSDK.getInstance();
        return instance;
    }

    /**
     * 주식주문 API 의 처리중에 발생하는 websocket message 를 처리하여 현 계정의 자산을 현행화 한다.
     */
    handleWsMessage(msg: any) {
        console.log('Account:', msg);
    }

    async buyStockNow(_shcode: string, qty: number) {
        if (qty === 0) return;
        try {
            const shcode = 'A' + _shcode;    //모의투자는 A 접두어를 붙임
            const info = await this.sdk!.api.orderStock({
                "IsuNo": shcode,
                "OrdQty": qty,
                "OrdPrc": 0,  // 시장가주문은 가격이 0
                "BnsTpCode": "2", // buy
                "OrdprcPtnCode": "03",  // 시장가
                "MgntrnCode": "000",  // 보통
                "LoanDt": "", // 대출일
                "OrdCndiTpCode": "0", // 조건구분 : 없음
                "MbrNo": ""
            });
            console.log("### " + info);
            // todo: 체결되기 이전에라도 잔고금액에서는 일단 차감해야함.
        } catch (error) {
            console.error(error);
        }
    }

    async sellStockNow(_shcode: string, qty: number) {
        if (qty === 0) return;
        try {
            const shcode = 'A' + _shcode;
            const info = await this.sdk!.api.orderStock({
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
        } catch (error) {
            console.error(error);
        }
    }

    async cancelOrder(ordNo: number, _shcode: string, qty: number) {
        const shcode = 'A' + _shcode;

        const info = await this.sdk!.api.cancelSpotOrder({
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
    }

    async sellStock(_shcode: string, qty: number, price: number) {
        if (qty === 0) return;
        try {
            const shcode = 'A' + _shcode;
            const info = await this.sdk!.api.orderStock({
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
        } catch (error) {
            console.error(error);
        }
    }

    async buyStock(_shcode: string, qty: number, price: number) {
        if (qty === 0) return;
        try {
            const shcode = 'A' + _shcode;
            const info = await this.sdk!.api.orderStock({
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
        } catch (error) {
            console.error(error);
        }
    }
}


export interface CandleConfig {
    interval: string;
}

export interface IndicatorConfig {
    candle: string;
    period: number;
}

export interface Config {
    [key: string]: CandleConfig | IndicatorConfig;
}

interface AgentConfig {
    candlePeriod: string;
    // other config options can be added here
}


export class TradeAgent5 extends BaseTradeAgent {
    private shcode: string;
    private account: Account | undefined;
    private budget: number = 0;
    private sdk: LSStockSDK | undefined;
    private isActive: boolean = false;

    private config: AgentConfig = {
        candlePeriod: '3m',
    };

    // Store operator state objects
    private operatorStates: {
        footPrintSignal?: any;
        // other operator states
    } = {};

    constructor(shcode: string, budget: number) {
        super();
        this.shcode = shcode;
        this.budget = budget;
        this.init();

        console.log(`TradeAgent5 started for ${shcode}`);
    }

    private async init() {
        this.sdk = await LSStockSDK.getInstance();
        this.account = await Account.create(this.shcode, this.budget);

        this.sdk.add_trade_hook_for_order(this.shcode, this.handleTradeData.bind(this));
        this.isActive = true;
    }

    async stopTrade(): Promise<void> {
        if (this.sdk) {
            this.sdk.remove_trade_hook_for_order(this.shcode);
        }
        this.isActive = false;
        console.log('TradeAgent5 stopped:', this.shcode);
    }

    async handleTradeData(data: any): Promise<void> {
        if (!this.isActive) return;

        // Process the trade data
        console.log('Processing trade data:', data);

        // Handle account updates
        this.account?.handleWsMessage(data);
    }
}

// types for constructor that returns a BaseTradeAgent instance
export interface TradeAgentClass<T extends BaseTradeAgent = BaseTradeAgent> {
    new (shcode: string, budget: number): T;
}

export class LSStockTradingSystem {
    private activeTradeAgents: {[key:string] : IRealtimeTradeDataConsumer } = {};

    /**
     * Singleton instance getter
     */
    private static _instance: LSStockTradingSystem | null = null;

    private constructor() {
    }

    public static async getInstance(config?: any): Promise<LSStockTradingSystem> {
        if (this._instance != null) {
            return this._instance;
        } else {
            this._instance = new LSStockTradingSystem();
            return this._instance;
        }
    }

    async startTrade(shcode: string, budget: number, tradeType: string) {
        console.log("start trade : " , shcode, budget, tradeType);
        if (this.activeTradeAgents[shcode]) return; // 이미 있으면 skip

        let Clazz : TradeAgentClass = this.getTradeAgentClassByType(tradeType);
        const tradeAgent = new Clazz(shcode, budget);
        this.activeTradeAgents[shcode] = tradeAgent;
    }

    private getTradeAgentClassByType(tradeType: string): TradeAgentClass {
        // TODO: implements
        switch (tradeType) {
            case '종가매매':
                return TradeAgent5;
            // 다른 타입을 추가하려면 case를 확장
            default:
                return TradeAgent5;
        }
    }

    public getCurrentTradingStatus() {
        // todo : implements
    }
}



