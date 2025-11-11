"use strict";
// Type definitions for the legacy stock query REST API SDK
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_TR_CD_TYPE = exports.WS_TR_TYPE = void 0;
exports.isTradeLog = isTradeLog;
exports.isOrderBookLog = isOrderBookLog;
function isTradeLog(log) {
    var _a, _b;
    return ((_a = log.header) === null || _a === void 0 ? void 0 : _a.tr_cd) === 'S3_' || ((_b = log.header) === null || _b === void 0 ? void 0 : _b.tr_cd) === 'K3_';
}
function isOrderBookLog(log) {
    var _a, _b;
    return ((_a = log.header) === null || _a === void 0 ? void 0 : _a.tr_cd) === 'H1_' || ((_b = log.header) === null || _b === void 0 ? void 0 : _b.tr_cd) === 'HA_';
}
var WS_TR_TYPE;
(function (WS_TR_TYPE) {
    WS_TR_TYPE["REGISTER_ACCNT"] = "1";
    WS_TR_TYPE["UNREGISTER_ACCNT"] = "2";
    WS_TR_TYPE["REGISTER_REALTIME"] = "3";
    WS_TR_TYPE["UNREGISTER_REALTIME"] = "4";
})(WS_TR_TYPE || (exports.WS_TR_TYPE = WS_TR_TYPE = {}));
/**
 * 웹소켓 요청 시 사용되는 TR 코드(tr_cd) 타입
 * - 3자리 문자열 형식 (예: "K3_", "HA_", "H1_", "S3_", "SC1", "AFR" 등)
 */
var WS_TR_CD_TYPE;
(function (WS_TR_CD_TYPE) {
    WS_TR_CD_TYPE["ETF_HOKA"] = "B7_";
    WS_TR_CD_TYPE["KOSPI_TO_HOKA"] = "DH1";
    WS_TR_CD_TYPE["KOSDAQ_TO_HOKA"] = "DHA";
    WS_TR_CD_TYPE["KOSDAQ_TO_CHEGYUL"] = "DK3";
    WS_TR_CD_TYPE["KOSPI_TO_CHEGYUL"] = "DS3";
    WS_TR_CD_TYPE["TO_VI"] = "DVI";
    WS_TR_CD_TYPE["KOSPI_HOKA"] = "H1_";
    WS_TR_CD_TYPE["KOSPI_JEON_HOKA"] = "H2_";
    WS_TR_CD_TYPE["KOSDAQ_HOKA"] = "HA_";
    WS_TR_CD_TYPE["KOSDAQ_JEON_HOKA"] = "HB_";
    WS_TR_CD_TYPE["KOSPI_ETF_NAV"] = "I5_";
    WS_TR_CD_TYPE["INDEX"] = "IJ_";
    WS_TR_CD_TYPE["KOSPI_TRADE"] = "K1_";
    WS_TR_CD_TYPE["KOSDAQ_CHEGYUL"] = "K3_";
    WS_TR_CD_TYPE["KOSDAQ_PROGRAM"] = "KH_";
    WS_TR_CD_TYPE["KOSDAQ_PROGRAM_TOTAL"] = "KM_";
    WS_TR_CD_TYPE["KOSDAQ_FIRST_HOKA"] = "KS_";
    WS_TR_CD_TYPE["KOSDAQ_TRADE"] = "OK_";
    WS_TR_CD_TYPE["KOSPI_PROGRAM"] = "PH_";
    WS_TR_CD_TYPE["KOSPI_PROGRAM_TOTAL"] = "PM_";
    WS_TR_CD_TYPE["KOSPI_FIRST_HOKA"] = "S2_";
    WS_TR_CD_TYPE["KOSPI_CHEGYUL"] = "S3_";
    WS_TR_CD_TYPE["KOSPI_GISE"] = "S4_";
    WS_TR_CD_TYPE["ORDER_RECEIPT"] = "SC0";
    WS_TR_CD_TYPE["ORDER_\uCCB4\uACB0"] = "SC1";
    WS_TR_CD_TYPE["ORDER_MODIFY"] = "SC2";
    WS_TR_CD_TYPE["ORDER_CANCEL"] = "SC3";
    WS_TR_CD_TYPE["ORDER_REJECT"] = "SC4";
    WS_TR_CD_TYPE["LIMIT_NEAR_IN"] = "SHC";
    WS_TR_CD_TYPE["LIMIT_NEAR_OUT"] = "SHD";
    WS_TR_CD_TYPE["LIMIT_IN"] = "SHI";
    WS_TR_CD_TYPE["LIMIT_OUT"] = "SHO";
    WS_TR_CD_TYPE["VI"] = "VI_";
    WS_TR_CD_TYPE["YOSO_INDEX"] = "YJ_";
    WS_TR_CD_TYPE["KOSDAQ_YOSO"] = "YK3";
    WS_TR_CD_TYPE["KOSPI_YOSO"] = "YS3";
    WS_TR_CD_TYPE["ELW_INDICATOR"] = "ESN";
    WS_TR_CD_TYPE["ELW_JEON_HOKA"] = "h2_";
    WS_TR_CD_TYPE["ELW_HOKA"] = "h3_";
    WS_TR_CD_TYPE["ELW_TRADE"] = "k1_";
    WS_TR_CD_TYPE["ELW_FIRST_HOKA"] = "s2_";
    WS_TR_CD_TYPE["ELW_CHEGYUL"] = "s3_";
    WS_TR_CD_TYPE["ELW_GISE"] = "s4_";
    WS_TR_CD_TYPE["ELW_YOSO"] = "Ys3";
    WS_TR_CD_TYPE["NXT_CHEGYUL"] = "NS3";
    WS_TR_CD_TYPE["NXT_HOKA"] = "NH1";
    WS_TR_CD_TYPE["NXT_FIRST_HOKA"] = "NS2";
    WS_TR_CD_TYPE["NXT_YOSO"] = "NYS";
    WS_TR_CD_TYPE["NXT_VI"] = "NVI";
    WS_TR_CD_TYPE["NXT_TRADE"] = "NK1";
    WS_TR_CD_TYPE["NXT_PROGRAM"] = "NPH";
    WS_TR_CD_TYPE["NXT_PROGRAM_TOTAL"] = "NPM";
    WS_TR_CD_TYPE["NXT_TIME_INVESTOR"] = "NBT";
    WS_TR_CD_TYPE["NXT_SECTOR_INVESTOR"] = "NBM";
    WS_TR_CD_TYPE["TOTAL_CHEGYUL"] = "US3";
    WS_TR_CD_TYPE["TOTAL_HOKA"] = "UH1";
    WS_TR_CD_TYPE["TOTAL_FIRST_HOKA"] = "US2";
    WS_TR_CD_TYPE["TOTAL_YOSO"] = "UYS";
    WS_TR_CD_TYPE["TOTAL_PROGRAM"] = "UPH";
    WS_TR_CD_TYPE["TOTAL_TRADE"] = "UK1";
    WS_TR_CD_TYPE["TOTAL_TIME_INVESTOR"] = "UBT";
    WS_TR_CD_TYPE["TOTAL_SECTOR_INVESTOR"] = "UBM";
    WS_TR_CD_TYPE["TOTAL_PROGRAM_TOTAL"] = "UPM";
    WS_TR_CD_TYPE["TOTAL_VI"] = "UVI";
    WS_TR_CD_TYPE["FILTER_REALTIME"] = "AFR";
    WS_TR_CD_TYPE["NEWS_PACKET"] = "NWS";
    WS_TR_CD_TYPE["MARKET_TIMER"] = "JIF";
    WS_TR_CD_TYPE["TIME_INVESTOR"] = "BMT";
    WS_TR_CD_TYPE["USD_REALTIME"] = "CUR";
    WS_TR_CD_TYPE["US_INDEX"] = "MK2";
    // 추가된 해외주식 관련 코드
    WS_TR_CD_TYPE["US_ORDER_RECEIPT"] = "AS0";
    WS_TR_CD_TYPE["US_ORDER_\uCCB4\uACB0"] = "AS1";
    WS_TR_CD_TYPE["US_ORDER_MODIFY"] = "AS2";
    WS_TR_CD_TYPE["US_ORDER_CANCEL"] = "AS3";
    WS_TR_CD_TYPE["US_ORDER_REJECT"] = "AS4";
    WS_TR_CD_TYPE["US_STOCK_HOKA"] = "GSH";
    WS_TR_CD_TYPE["US_STOCK_CHEGYUL"] = "GSC";
})(WS_TR_CD_TYPE || (exports.WS_TR_CD_TYPE = WS_TR_CD_TYPE = {}));
