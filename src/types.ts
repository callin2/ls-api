// Type definitions for the legacy stock query REST API SDK

export interface StockQuery {
    symbol: string;
    startDate?: string;
    endDate?: string;
    interval?: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1w' | '1M';
}

export interface StockPrice {
    symbol: string;
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface StockInfo {
    symbol: string;
    name: string;
    exchange: string;
    currency: string;
    marketCap?: number;
    sector?: string;
    industry?: string;
}

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface SDKConfig {
    baseUrl?: string;
    apiKey: string;
    apiSecret: string;
    wsEndpoint?: string;
}

export interface BaseLog {
    header: {
        tr_cd: string;
        tr_key: string;
    };
    body: Record<string, any>;
}

export type BuyOrSell = '+' | '-';

// Trade-specific log interface
export interface TradeLog extends BaseLog {
    header: {
        tr_cd: 'S3_' | 'K3_';
        tr_key: string;
    };
    body: {
        price: string;
        cvolume?: string;
        volume?: string;
        cgubun?: BuyOrSell;
        chetime?: string; // Time in HHMMSS format
        shcode: string;
        [key: string]: any;
    };
}

// Orderbook-specific log interface
export interface OrderBookLog extends BaseLog {
    header: {
        tr_cd: 'H1_' | 'HA_';
        tr_key: string;
    };
    body: {
        // Timestamp field
        hotime: string;

        // Symbol identification
        shcode: string;

        // Total trading volume
        volume: string;

        // Bid price levels (1-10)
        bidho1: string;
        bidho2: string;
        bidho3: string;
        bidho4: string;
        bidho5: string;
        bidho6: string;
        bidho7: string;
        bidho8: string;
        bidho9: string;
        bidho10: string;

        // Bid quantity at each level (1-10)
        bidrem1: string;
        bidrem2: string;
        bidrem3: string;
        bidrem4: string;
        bidrem5: string;
        bidrem6: string;
        bidrem7: string;
        bidrem8: string;
        bidrem9: string;
        bidrem10: string;

        // Ask price levels (1-10)
        offerho1: string;
        offerho2: string;
        offerho3: string;
        offerho4: string;
        offerho5: string;
        offerho6: string;
        offerho7: string;
        offerho8: string;
        offerho9: string;
        offerho10: string;

        // Ask quantity at each level (1-10)
        offerrem1: string;
        offerrem2: string;
        offerrem3: string;
        offerrem4: string;
        offerrem5: string;
        offerrem6: string;
        offerrem7: string;
        offerrem8: string;
        offerrem9: string;
        offerrem10: string;

        // Total quantities
        totbidrem: string;   // Total bid quantity
        totofferrem: string; // Total ask quantity

        // Additional fields from the sample
        midprice?: string;
        donsigubun: string;
        alloc_gubun: string;
        midsumrem?: string;
        bidmidsumrem?: string;
        offermidsumrem?: string;
        midsumremgubun?: string;

        // Allow for additional fields
        [key: string]: any;
    };
}

// Union type for all log types
export type MarketLog = TradeLog | OrderBookLog;

export function isTradeLog(log: MarketLog): log is TradeLog {
    return log.header?.tr_cd === 'S3_' || log.header?.tr_cd === 'K3_';
}

export function isOrderBookLog(log: MarketLog): log is OrderBookLog {
    return log.header?.tr_cd === 'H1_' || log.header?.tr_cd === 'HA_';
}

export interface CandleData {
    open: number | null;
    high: number;
    low: number;
    close: number | null;
    volume: number;
    sellVolume: number;
    buyVolume: number;
    volumeDelta: number;
    divergence: 'up' | 'down';
    cvd: number;
    footPrint: any[];
    density: number;
    upTrendRatio?: number;
    downTrendRatio?: number;
    footPrintType?: string;
    candleIndex: number;
    name?: string;
    startTime: string; // 캔들의 시작 시간을 나타내는 문자열 추가
}


export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    timestamp: number;
}

export enum WS_TR_TYPE {
    REGISTER_ACCNT = '1', // 계좌등록
    UNREGISTER_ACCNT = '2', // 계좌해제
    REGISTER_REALTIME = '3', // 실시간 시세 등록
    UNREGISTER_REALTIME = '4', // 실시간 시세 해제
}

/**
 * 실시간 시세 요청 시 사용되는 종목코드(tr_key) 타입
 * - 주식: 6자리 종목코드 (예: "005930")
 * - 파생: 8자리 종목코드 (예: "101P3000")
 * - 계좌등록/해제 요청 시에는 사용되지 않음
 */
export type WS_TR_KEY_TYPE = string;

/**
 * 웹소켓 요청 시 사용되는 TR 코드(tr_cd) 타입
 * - 3자리 문자열 형식 (예: "K3_", "HA_", "H1_", "S3_", "SC1", "AFR" 등)
 */
export enum WS_TR_CD_TYPE {
    ETF_HOKA = 'B7_', // ETF호가잔량

    KOSPI_TO_HOKA = 'DH1', // KOSPI시간외단일가호가잔량
    KOSDAQ_TO_HOKA = 'DHA', // KOSDAQ시간외단일가호가잔량
    KOSDAQ_TO_CHEGYUL = 'DK3', // KOSDAQ시간외단일가체결
    KOSPI_TO_CHEGYUL = 'DS3', // KOSPI시간외단일가체결
    TO_VI = 'DVI', // 시간외단일가VI발동해제

    KOSPI_HOKA = 'H1_', // KOSPI호가잔량
    KOSPI_JEON_HOKA = 'H2_', // KOSPI장전시간외호가잔량
    KOSDAQ_HOKA = 'HA_', // KOSDAQ호가잔량
    KOSDAQ_JEON_HOKA = 'HB_', // KOSDAQ장전시간외호가잔량

    KOSPI_ETF_NAV = 'I5_', // 코스피ETF종목실시간NAV
    INDEX = 'IJ_', // 지수

    KOSPI_TRADE = 'K1_', // KOSPI거래원
    KOSDAQ_CHEGYUL = 'K3_', // KOSDAQ체결
    KOSDAQ_PROGRAM = 'KH_', // KOSDAQ프로그램매매종목별
    KOSDAQ_PROGRAM_TOTAL = 'KM_', // KOSDAQ프로그램매매전체집계
    KOSDAQ_FIRST_HOKA = 'KS_', // KOSDAQ우선호가
    KOSDAQ_TRADE = 'OK_', // KOSDAQ거래원

    KOSPI_PROGRAM = 'PH_', // KOSPI프로그램매매종목별
    KOSPI_PROGRAM_TOTAL = 'PM_', // KOSPI프로그램매매전체집계
    KOSPI_FIRST_HOKA = 'S2_', // KOSPI우선호가
    KOSPI_CHEGYUL = 'S3_', // KOSPI체결
    KOSPI_GISE = 'S4_', // KOSPI기세

    ORDER_RECEIPT = 'SC0', // 주식주문접수
    ORDER_체결 = 'SC1', // 주식주문체결
    ORDER_MODIFY = 'SC2', // 주식주문정정
    ORDER_CANCEL = 'SC3', // 주식주문취소
    ORDER_REJECT = 'SC4', // 주식주문거부

    LIMIT_NEAR_IN = 'SHC', // 상/하한가근접진입
    LIMIT_NEAR_OUT = 'SHD', // 상/하한가근접이탈
    LIMIT_IN = 'SHI', // 상/하한가진입
    LIMIT_OUT = 'SHO', // 상/하한가이탈

    VI = 'VI_', // VI발동해제

    YOSO_INDEX = 'YJ_', // 예상지수
    KOSDAQ_YOSO = 'YK3', // KOSDAQ예상체결
    KOSPI_YOSO = 'YS3', // KOSPI예상체결

    ELW_INDICATOR = 'ESN', // 뉴ELW투자지표민감도

    ELW_JEON_HOKA = 'h2_', // ELW장전시간외호가잔량
    ELW_HOKA = 'h3_', // ELW호가잔량
    ELW_TRADE = 'k1_', // ELW거래원
    ELW_FIRST_HOKA = 's2_', // ELW우선호가
    ELW_CHEGYUL = 's3_', // ELW체결
    ELW_GISE = 's4_', // ELW기세
    ELW_YOSO = 'Ys3', // ELW예상체결

    NXT_CHEGYUL = 'NS3', // (NXT)체결
    NXT_HOKA = 'NH1', // (NXT)호가잔량
    NXT_FIRST_HOKA = 'NS2', // (NXT)우선호가
    NXT_YOSO = 'NYS', // (NXT)예상체결
    NXT_VI = 'NVI', // (NXT)VI 발동 해제
    NXT_TRADE = 'NK1', // (NXT)거래원
    NXT_PROGRAM = 'NPH', // (NXT)프로그램매매종목별
    NXT_PROGRAM_TOTAL = 'NPM', // (NXT)프로그램매매전체집계
    NXT_TIME_INVESTOR = 'NBT', // (NXT)시간대별투자자매매추이
    NXT_SECTOR_INVESTOR = 'NBM', // (NXT)업종별투자자별매매현황

    TOTAL_CHEGYUL = 'US3', // (통합)체결
    TOTAL_HOKA = 'UH1', // (통합)호가잔량
    TOTAL_FIRST_HOKA = 'US2', // (통합)우선호가
    TOTAL_YOSO = 'UYS', // (통합)예상체결
    TOTAL_PROGRAM = 'UPH', // (통합)프로그램매매종목별
    TOTAL_TRADE = 'UK1', // (통합)거래원
    TOTAL_TIME_INVESTOR = 'UBT', // (통합)시간대별투자자매매추이
    TOTAL_SECTOR_INVESTOR = 'UBM', // (통합) 업종별투자자별매매현황
    TOTAL_PROGRAM_TOTAL = 'UPM', // (통합)프로그램매매전체집계
    TOTAL_VI = 'UVI', // (통합)VI발동해제

    FILTER_REALTIME = 'AFR', // API사용자조건검색실시간
    NEWS_PACKET = 'NWS',  // 실시간뉴스제목패킷
    MARKET_TIMER = 'JIF',  // 장운영정보

    TIME_INVESTOR = 'BMT',  // 시간대별투자자매매추이
    USD_REALTIME = 'CUR',  // 현물정보USD실시간
    US_INDEX = 'MK2',       // US지수

    // 추가된 해외주식 관련 코드
    US_ORDER_RECEIPT = 'AS0',  // 해외주식주문접수(미국)
    US_ORDER_체결 = 'AS1',     // 해외주식주문체결(미국)
    US_ORDER_MODIFY = 'AS2',   // 해외주식주문정정(미국)
    US_ORDER_CANCEL = 'AS3',   // 해외주식주문취소(미국)
    US_ORDER_REJECT = 'AS4',   // 해외주식주문거부(미국)
    US_STOCK_HOKA = 'GSH',     // 해외주식 호가
    US_STOCK_CHEGYUL = 'GSC',  // 해외주식 체결
}

export interface ErrorTokenResponse {
    error_description: string;
    error_code: string;
    timestamp: number;
}

// Base API Response Interface
export interface BaseApiResponse {
    [key: string]: any;
}

// Stock Order API Types
export interface ModifySpotOrderParams {
    RecCnt: number;
    OrgOrdNo: number;
    IsuNo: string;
    OrdQty: number;
    OrdprcPtnCode: string;
    OrdCndiTpCode: string;
    OrdPrc: number;
    CommdaCode: string;
    StrtgCode: string;
    GrpId: string;
    OrdSeqNo: number;
    PtflNo: number;
    BskNo: number;
    TrchNo: number;
    ItemNo: number;

}

export interface CancelSpotOrderParams {
    RecCnt: number;
    OrgOrdNo: number;
    IsuNo: string;
    OrdQty: number;
    CommdaCode: string;
    GrpId: string;
    StrtgCode: string;
    OrdSeqNo: number;
    PtflNo: number;
    BskNo: number;
    TrchNo: number;
    ItemNo: number;

}

export interface OrderStockParams {
    IsuNo: string;
    OrdQty: number;
    OrdPrc: number;
    BnsTpCode: string;
    OrdprcPtnCode: string;
    MgntrnCode: string;
    LoanDt: string;
    OrdCndiTpCode: string;
    MbrNo: string;

}

// Stock Theme API Types
export interface GetStockThemesParams {
    shcode: string;

}

export interface GetThemeRankParams {
    tmname: string;
    tmcode: string;
}

// Stock Data API Types
export interface GetStockPriceParams {
    shcode: string;

}

export interface GetMultiQuoteParams {
    nrec: number;
    shcode: string;
}

// Industry API Types
export interface GetIndTrendParams {
    upcode: string;
    gubun1: string;
    gubun2: string;
    cts_date: string;
    cnt: number;
    rate_gbn: string;
}

export interface GetAllIndParams {
    gubun1: string;
}

export interface GetExpIdxParams {
    upcode: string;
    gubun: string;
}

export interface GetIndPriceParams {
    upcode: string;
}

export interface GetIndStocksParams {
    upcode: string;
    gubun: string;
    shcode: string;
}

// Chart API Types
export interface GetDwmChartParams {
    shcode: string;
    gubun: string;
    qrycnt: number;
    sdate: string;
    edate: string;
    cts_date: string;
    comp_yn: string;
    sujung: string;
}

export interface GetStockTickChartParams {
    shcode: string;
    cntmin: number;
    cnt: number;
    rate: string;
}

export interface GetStockMinChartParams {
    shcode: string;
    ncnt: number;
    qrycnt: number;
    nday: number;
    stime: string;
    etime: string;
    cts_time: string;
    comp_yn: string;
}

// High-Item API Types
export interface GetTopExpectedVolumeParams {
    gubun: string;
    jgubun: string;
    jongchk: string;
    idx: number;
    yesprice: number;
    yeeprice: number;
    yevolume: number;
}

export interface GetStockVolumeSpikeParams {
    gubun: string;
    type1: string;
    type2: string;
    jc_num: number;
    sprice: number;
    eprice: number;
    volume: number;
    idx: number;
    jc_num2: number;
}

export interface GetStockTopValueParams {
    gubun: string;
    jnilgubun: string;
    jc_num: number;
    sprice: number;
    eprice: number;
    volume: number;
    idx: number;
}

// Order Management API Types
export interface GetOrdersParams {
    t0425InBlock: {
        expcode: string;
        chegb: string;
        medosu: string;
        sortgb: string;
        cts_ordno: string;
    };
}

export interface GetBalanceV2Params {
    accno: string;
    passwd: string;
    prcgb: string;
    chegb: string;
    dangb: string;
    charge: string;
    cts_expcode: string;
}

// Session-based balance request (accno and passwd from session token)
export interface GetBalanceV2SessionParams {
    prcgb: string;
    chegb: string;
    dangb: string;
    charge: string;
    cts_expcode: string;
}

export interface GetOrderBookParams {
    shcode: string;
}

// Utility API Types
export interface GetServerTimeParams {
    id: string;
}

// Stream configuration interface
export interface StockStreamConfig {
    startTime?: string;          // Default: '09:00:00'
    candlePeriod?: string;       // Default: '1m'
    intervalMinutes?: number;    // Default: 1
}

// Stream data interface
export interface StreamData {
    chetime: string;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    sign: string;
    diff: number;
    volume: number;
    cvolume: number;
    revolume: number;
    mdvolume: number;
    msvolume: number;
    mdchecnt: number;
    mschecnt: number;
    rechecnt: number;
    isHistorical: boolean;
    shcode: string;
    timestamp: Date;
}

// Generic API Function Type
export type ApiFunction<TParams, TResponse = BaseApiResponse> = (params?: TParams) => AsyncGenerator<TResponse, void, unknown>;

// Fallback for functions without specific types yet
export type DynamicApiFunction = (params?: any) => AsyncGenerator<any, void, unknown>;

export interface LSStockAPI {
    // Stock Order APIs (주문)
    modifySpotOrder: ApiFunction<ModifySpotOrderParams>;
    cancelSpotOrder: ApiFunction<CancelSpotOrderParams>;
    orderStock: ApiFunction<OrderStockParams>;

    // Stock Theme APIs (테마)
    getStockThemes: ApiFunction<GetStockThemesParams>;
    getThemeRank: ApiFunction<GetThemeRankParams>;
    getAllThemes: DynamicApiFunction;
    getThemeQuotes: DynamicApiFunction;

    // Order Management APIs (주문관리)
    getOrders: ApiFunction<GetOrdersParams>;
    getBalanceV2: ApiFunction<GetBalanceV2Params>;
    getOrderBook: ApiFunction<GetOrderBookParams>;

    // Stock Data APIs (시세정보)
    getStockPrice: ApiFunction<GetStockPriceParams>;
    getStockPriceByMin: DynamicApiFunction;
    getStockTimeIntervalTrade: DynamicApiFunction;
    getStockPriceTrend: DynamicApiFunction;
    getStockPriceRatio: DynamicApiFunction;
    getMaster: DynamicApiFunction;
    getMultiQuote: ApiFunction<GetMultiQuoteParams>;

    // Chart APIs (차트)
    getDwmChart: ApiFunction<GetDwmChartParams>;
    getStockTickChart: ApiFunction<GetStockTickChartParams>;
    getStockMinChart: ApiFunction<GetStockMinChartParams>;
    getIntegratedStockMinChart: DynamicApiFunction;

    // Top/Rankings APIs (순위)
    getTopExpectedVolume: ApiFunction<GetTopExpectedVolumeParams>;
    getAccountTransactions: DynamicApiFunction;
    getStockVolumeSpike: ApiFunction<GetStockVolumeSpikeParams>;
    getStockTopValue: ApiFunction<GetStockTopValueParams>;
    getStockTopVolume: DynamicApiFunction;
    getStockTopChange: DynamicApiFunction;
    getTopExpectedChangeRate: DynamicApiFunction;
    getTopChange: DynamicApiFunction;
    getVolumeSpike: DynamicApiFunction;
    getTopValue: DynamicApiFunction;
    getTopVolume: DynamicApiFunction;

    // Analysis APIs (분석)
    getHighLow: DynamicApiFunction;
    getInvestorTrend: DynamicApiFunction;
    getTradeIntensityTrend: DynamicApiFunction;
    getHourlyExpectedExecutionPrice: DynamicApiFunction;
    getIntradayPrevDayTick: DynamicApiFunction;
    getLimitPriceApproach: DynamicApiFunction;
    getTimeBasedOrderBookVolumeTrend: DynamicApiFunction;

    // Filter/Search APIs (조건검색)
    getSignal: DynamicApiFunction;
    getQClickQuick: DynamicApiFunction;
    getQClickQuickList: DynamicApiFunction;
    getSavedFilters: DynamicApiFunction;
    getSavedFilterResults: DynamicApiFunction;
    getRealtimeSavedFilterResults: DynamicApiFunction;

    // Stock List APIs (종목정보)
    getStockList: DynamicApiFunction;
    getNewsBody: DynamicApiFunction;
    getFNGSummary: DynamicApiFunction;

    // Industry APIs (업종)
    getIndTrend: ApiFunction<GetIndTrendParams>;
    getAllInd: ApiFunction<GetAllIndParams>;
    getExpIdx: ApiFunction<GetExpIdxParams>;
    getIndPrice: ApiFunction<GetIndPriceParams>;
    getIndStocks: ApiFunction<GetIndStocksParams>;
    getIndChartSum: DynamicApiFunction;
    getIndChartTick: DynamicApiFunction;
    getIndChartMin: DynamicApiFunction;
    getIndChartDWM: DynamicApiFunction;

    // Utility APIs (기타)
    getServerTime: ApiFunction<GetServerTimeParams>;

    // Dynamic indexer for any additional functions
    [key: string]: DynamicApiFunction;
}
