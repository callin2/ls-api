import { LSStockSDK } from '../src';
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";

(async () => {
  console.log('Testing getAllInd API...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config({ path: resolve(__dirname, '../.env') });

    const config = {
        baseUrl: process.env.LS_API_BASE_URL || 'https://172.30.1.77:13033/api',
        apiKey: process.env.LS_API_KEY || '',
        apiSecret: process.env.LS_API_SECRET || '',
        wsEndpoint: process.env.LS_WS_ENDPOINT || 'wss://openapi.ls-sec.co.kr:29443/websocket'
    };

  try {
    const sdk = await LSStockSDK.getInstance();
    console.log('✅ SDK initialized successfully');

    // Test getAllInd function availability
    if (sdk.api.getAllInd) {
      console.log('✅ getAllInd function is available');

      // Test getAllInd API call
      try {
        console.log('📡 Calling getAllInd API...');

        let resultCount = 0;
        for await (const data of sdk.api.getAllInd({
            gubun1: ""
        })) {
          resultCount++;
          console.log(`📊 Result ${resultCount}:`, data);

            /**

             📊 Result 1: { hname: '종       합', upcode: '001' }
             📊 Result 2: { hname: '대   형  주', upcode: '002' }
             📊 Result 3: { hname: '중   형  주', upcode: '003' }
             📊 Result 4: { hname: '소   형  주', upcode: '004' }
             📊 Result 5: { hname: '음 식 료 업', upcode: '005' }
             📊 Result 6: { hname: '섬 유 의 복', upcode: '006' }
             📊 Result 7: { hname: '종 이 목 재', upcode: '007' }
             📊 Result 8: { hname: '화       학', upcode: '008' }
             📊 Result 9: { hname: '의   약  품', upcode: '009' }
             📊 Result 10: { hname: '비금속 광물', upcode: '010' }
             📊 Result 11: { hname: '철 강 금 속', upcode: '011' }
             📊 Result 12: { hname: '기       계', upcode: '012' }
             📊 Result 13: { hname: '전 기 전 자', upcode: '013' }
             📊 Result 14: { hname: '의 료 정 밀', upcode: '014' }
             📊 Result 15: { hname: '운 수 장 비', upcode: '015' }
             📊 Result 16: { hname: '유   통  업', upcode: '016' }
             📊 Result 17: { hname: '전 기 가 스', upcode: '017' }
             📊 Result 18: { hname: '건   설  업', upcode: '018' }
             📊 Result 19: { hname: '운 수 창 고', upcode: '019' }
             📊 Result 20: { hname: '통   신  업', upcode: '020' }
             📊 Result 21: { hname: '금   융  업', upcode: '021' }
             📊 Result 22: { hname: '증       권', upcode: '024' }
             📊 Result 23: { hname: '보   험  업', upcode: '025' }
             📊 Result 24: { hname: '서 비 스 업', upcode: '026' }
             📊 Result 25: { hname: '제   조  업', upcode: '027' }
             📊 Result 26: { hname: '부   동  산', upcode: '028' }
             📊 Result 27: { hname: 'IT 서비스', upcode: '029' }
             📊 Result 28: { hname: '오 락 문 화', upcode: '030' }
             📊 Result 29: { hname: 'KOSPI200', upcode: '101' }
             📊 Result 30: { hname: 'KP200 건설', upcode: '111' }
             📊 Result 31: { hname: 'KP200 중공업', upcode: '112' }
             📊 Result 32: { hname: 'KP200 철강소재', upcode: '113' }
             📊 Result 33: { hname: 'KP200 에너지화학', upcode: '114' }
             📊 Result 34: { hname: 'KP200 정보기술', upcode: '115' }
             📊 Result 35: { hname: 'KP200 금융', upcode: '116' }
             📊 Result 36: { hname: 'KP200 생활소비재', upcode: '117' }
             📊 Result 37: { hname: 'KP200 경기소비재', upcode: '118' }
             📊 Result 38: { hname: 'KP200 산업재', upcode: '119' }
             📊 Result 39: { hname: 'KP200 건강관리', upcode: '120' }
             📊 Result 40: { hname: 'KP200 커뮤니케이션서', upcode: '121' }
             📊 Result 41: { hname: 'KP200 초대형주제외지', upcode: '122' }
             📊 Result 42: { hname: 'KOSPI100', upcode: '201' }
             📊 Result 43: { hname: 'KOSPI50', upcode: '202' }
             📊 Result 44: { hname: 'F-KOSPI200인버스', upcode: '204' }
             📊 Result 45: { hname: 'VKOSPI', upcode: '205' }
             📊 Result 46: { hname: 'F-KOSPI200', upcode: '206' }
             📊 Result 47: { hname: 'KP200 동일가중', upcode: '207' }
             📊 Result 48: { hname: 'KP100 동일가중', upcode: '208' }
             📊 Result 49: { hname: 'KP 50 동일가중', upcode: '209' }
             📊 Result 50: { hname: 'KRX100동일가중', upcode: '210' }
             📊 Result 51: { hname: 'KP200 고배당지수', upcode: '211' }
             📊 Result 52: { hname: 'KOSPI 고배당 50', upcode: '213' }
             📊 Result 53: { hname: 'KOSPI 배당성장 50', upcode: '214' }
             📊 Result 54: { hname: 'KOSPI 우선주', upcode: '215' }
             📊 Result 55: { hname: 'KP200 중소형주지수', upcode: '216' }
             📊 Result 56: { hname: 'KP200 필수소비재', upcode: '217' }
             📊 Result 57: { hname: 'KP200 예측 고배당 50', upcode: '222' }
             📊 Result 58: { hname: 'KP200 예측 배당성장', upcode: '223' }
             📊 Result 59: { hname: 'KP200 예측 TR', upcode: '224' }
             📊 Result 60: { hname: 'KP200 예측 NTR', upcode: '225' }
             📊 Result 61: { hname: '코스닥 종합', upcode: '301' }
             📊 Result 62: { hname: '기타 서비스', upcode: '303' }
             📊 Result 63: { hname: '제       조', upcode: '306' }
             📊 Result 64: { hname: '건       설', upcode: '307' }
             📊 Result 65: { hname: '유       통', upcode: '308' }
             📊 Result 66: { hname: '운       송', upcode: '310' }
             📊 Result 67: { hname: '금       융', upcode: '311' }
             📊 Result 68: { hname: '통       신', upcode: '312' }
             📊 Result 69: { hname: 'IT 서 비 스', upcode: '313' }
             📊 Result 70: { hname: '음식료 담배', upcode: '315' }
             📊 Result 71: { hname: '섬 유/의 류', upcode: '316' }
             📊 Result 72: { hname: '종 이/목 재', upcode: '317' }
             📊 Result 73: { hname: '출 판 매 체', upcode: '318' }
             📊 Result 74: { hname: '화       학', upcode: '319' }
             📊 Result 75: { hname: '제       약', upcode: '320' }
             📊 Result 76: { hname: '비   금  속', upcode: '321' }
             📊 Result 77: { hname: '금       속', upcode: '322' }
             📊 Result 78: { hname: '기 계 장 비', upcode: '323' }
             📊 Result 79: { hname: '전 기/전 자', upcode: '324' }
             📊 Result 80: { hname: '의 료/정 밀', upcode: '325' }
             📊 Result 81: { hname: '운 송/부 품', upcode: '326' }
             📊 Result 82: { hname: '기 타 제 조', upcode: '327' }
             📊 Result 83: { hname: '오락/문화', upcode: '338' }
             📊 Result 84: { hname: 'KOSDAQ100', upcode: '339' }
             📊 Result 85: { hname: 'KOSDAQ MID 300', upcode: '340' }
             📊 Result 86: { hname: 'KOSDAQ SMALL', upcode: '341' }
             📊 Result 87: { hname: '우 량 기 업', upcode: '342' }
             📊 Result 88: { hname: '벤 처 기 업', upcode: '343' }
             📊 Result 89: { hname: '중 견 기 업', upcode: '344' }
             📊 Result 90: { hname: '기술성장 기업', upcode: '345' }
             📊 Result 91: { hname: 'KOSDAQ 글로벌', upcode: '346' }
             📊 Result 92: { hname: 'KOSDAQ 150', upcode: '405' }
             📊 Result 93: { hname: 'K R X 1 0 0', upcode: '501' }
             📊 Result 94: { hname: 'KRX자 동 차', upcode: '502' }
             📊 Result 95: { hname: 'KRX반 도 체', upcode: '503' }
             📊 Result 96: { hname: 'KRX바 이 오', upcode: '504' }
             📊 Result 97: { hname: 'KRX금    융', upcode: '505' }
             📊 Result 98: { hname: 'KRX에너지화학', upcode: '507' }
             📊 Result 99: { hname: 'KRX철    강', upcode: '508' }
             📊 Result 100: { hname: 'KRX방송통신', upcode: '510' }
             📊 Result 101: { hname: 'KRX건    설', upcode: '511' }
             📊 Result 102: { hname: 'KRX증    권', upcode: '513' }
             📊 Result 103: { hname: 'KRX기계장비', upcode: '514' }
             📊 Result 104: { hname: 'KRX보    험', upcode: '516' }
             📊 Result 105: { hname: 'KRX운    송', upcode: '517' }
             📊 Result 106: { hname: 'KRX ESG Leaders 150', upcode: '523' }
             📊 Result 107: { hname: 'KRX Governance Leade', upcode: '524' }
             📊 Result 108: { hname: 'KRX Eco Leaders 100', upcode: '525' }
             📊 Result 109: { hname: 'KRX 최소변동성지수', upcode: '526' }
             📊 Result 110: { hname: 'KRX 2차전지 TOP 10 T', upcode: '527' }
             📊 Result 111: { hname: 'KRX 2차전지 TOP 10 T', upcode: '528' }
             📊 Result 112: { hname: 'KRX 경기소비재', upcode: '531' }
             📊 Result 113: { hname: 'KRX 생활소비재', upcode: '532' }
             📊 Result 114: { hname: 'KRX K컨텐츠', upcode: '533' }
             📊 Result 115: { hname: 'KRX 정보기술', upcode: '534' }
             📊 Result 116: { hname: 'KRX 유틸리티', upcode: '535' }
             📊 Result 117: { hname: 'KRX 금현물', upcode: '536' }
             📊 Result 118: { hname: 'KRX 금현물 USD', upcode: '537' }
             📊 Result 119: { hname: 'KRX 300', upcode: '538' }
             📊 Result 120: { hname: 'KRX 300 정보기술', upcode: '540' }
             📊 Result 121: { hname: 'KRX 300 금융', upcode: '541' }
             📊 Result 122: { hname: 'KRX 300 자유소비재', upcode: '542' }
             📊 Result 123: { hname: 'KRX 300 산업재', upcode: '543' }
             📊 Result 124: { hname: 'KRX 300 헬스케어', upcode: '544' }
             📊 Result 125: { hname: 'KRX 300 커뮤니케이션', upcode: '545' }
             📊 Result 126: { hname: 'KRX 300 소재', upcode: '546' }
             📊 Result 127: { hname: 'KRX 300 필수소비재', upcode: '547' }
             📊 Result 128: { hname: 'KRX BBIG', upcode: '548' }
             📊 Result 129: { hname: 'KRX 2차전지 TOP 10', upcode: '549' }
             📊 Result 130: { hname: 'KRX 바이오 TOP 10', upcode: '550' }
             📊 Result 131: { hname: 'KRX 인터넷 TOP 10', upcode: '551' }
             📊 Result 132: { hname: 'KRX 게임 TOP 10', upcode: '552' }
             📊 Result 133: { hname: 'KOSPI200 기후변화', upcode: '553' }
             📊 Result 134: { hname: 'KRX 300 기후변화', upcode: '554' }
             📊 Result 135: { hname: 'KRX 기후변화 솔루션', upcode: '555' }
             📊 Result 136: { hname: '코리아 밸류업', upcode: '556' }
             📊 Result 137: { hname: '코리아 밸류업 TR', upcode: '557' }
             📊 Result 138: { hname: 'KRX TMI', upcode: '558' }
             📊 Result 139: { hname: 'KRX 중대형 TMI', upcode: '559' }
             📊 Result 140: { hname: 'KRX 중형 TMI', upcode: '561' }
             📊 Result 141: { hname: 'KRX 소형 TMI', upcode: '562' }
             📊 Result 142: { hname: 'KRX 초소형 TMI', upcode: '563' }
             📊 Result 143: { hname: 'F-USDKRW', upcode: '601' }
             📊 Result 144: { hname: 'F-USDKRW 인버스', upcode: '602' }
             📊 Result 145: { hname: 'KOSPI200레버리지', upcode: '603' }
             📊 Result 146: { hname: 'KP200 커버드콜 5OTM', upcode: '604' }
             📊 Result 147: { hname: 'KP200 프로텍티브풋 5', upcode: '605' }
             📊 Result 148: { hname: '국채선물지수', upcode: '606' }
             📊 Result 149: { hname: '국채선물인버스', upcode: '607' }
             📊 Result 150: { hname: 'F-LKTB', upcode: '608' }
             📊 Result 151: { hname: 'F-LKTB 인버스', upcode: '609' }
             📊 Result 152: { hname: '주식미국채DAE지수', upcode: '615' }
             📊 Result 153: { hname: 'COBIX', upcode: '616' }
             📊 Result 154: { hname: 'MOBIX', upcode: '617' }
             📊 Result 155: { hname: 'F-USDKRW 레버리지', upcode: '618' }
             📊 Result 156: { hname: 'F-USDKRW 인버스 -2x', upcode: '619' }
             📊 Result 157: { hname: 'F-USDKRW 인버스 -3x', upcode: '620' }
             📊 Result 158: { hname: 'K200 USD 선물 바이셀', upcode: '622' }
             📊 Result 159: { hname: 'USD K200 선물 바이셀', upcode: '623' }
             📊 Result 160: { hname: 'K200선물매수 콜매도', upcode: '624' }
             📊 Result 161: { hname: 'K200선물매도 풋매도', upcode: '625' }
             📊 Result 162: { hname: 'K200 가치저변동성지�', upcode: '630' }
             📊 Result 163: { hname: 'F-KP200 인버스 -2x', upcode: '638' }
             📊 Result 164: { hname: 'F-KP200 인버스 -3x', upcode: '639' }
             📊 Result 165: { hname: 'KTOP 30', upcode: '640' }
             📊 Result 166: { hname: 'KTOP 30 레버리지', upcode: '641' }
             📊 Result 167: { hname: '필수소비재채권혼합지', upcode: '642' }
             📊 Result 168: { hname: '배당성장채권혼합지수', upcode: '643' }
             📊 Result 169: { hname: 'KP200 에너지화학 레�', upcode: '644' }
             📊 Result 170: { hname: 'KP200 정보기술 레버�', upcode: '645' }
             📊 Result 171: { hname: 'KP200 금융 레버리지', upcode: '646' }
             📊 Result 172: { hname: 'KP200 경기소비재 레�', upcode: '647' }
             📊 Result 173: { hname: 'F-KP200 레버리지', upcode: '648' }
             📊 Result 174: { hname: 'F-KQ150', upcode: '649' }
             📊 Result 175: { hname: 'F-KQ150 인버스', upcode: '650' }
             📊 Result 176: { hname: 'F-KQ150 인버스 -2x', upcode: '651' }
             📊 Result 177: { hname: 'F-KQ150 인버스 -3x', upcode: '652' }
             📊 Result 178: { hname: 'KQ150 레버리지', upcode: '653' }
             📊 Result 179: { hname: 'KQ150 레버리지 0.5', upcode: '654' }
             📊 Result 180: { hname: 'WISE-KAP 스마트베타Q', upcode: '655' }
             📊 Result 181: { hname: 'MF-KP200', upcode: '656' }
             📊 Result 182: { hname: 'MF-KP200 레버리지', upcode: '657' }
             📊 Result 183: { hname: 'MF-KP200 인버스', upcode: '658' }
             📊 Result 184: { hname: 'MF-KP200 인버스 -2x', upcode: '659' }
             📊 Result 185: { hname: 'F-KQ150 레버리지', upcode: '660' }
             📊 Result 186: { hname: 'KP200 커버드콜 ATM', upcode: '661' }
             📊 Result 187: { hname: 'KP200 현선물레버리지', upcode: '662' }
             📊 Result 188: { hname: '한국대만IT프리미어', upcode: '663' }
             📊 Result 189: { hname: 'F-KRX300', upcode: '664' }
             📊 Result 190: { hname: 'F-KRX300 레버리지', upcode: '665' }
             📊 Result 191: { hname: 'F-KRX300 인버스', upcode: '666' }
             📊 Result 192: { hname: 'F-KRX300 인버스 -2X', upcode: '667' }
             📊 Result 193: { hname: 'KRX300 레버리지', upcode: '668' }
             📊 Result 194: { hname: 'F-KRX300 USD 혼합', upcode: '669' }
             📊 Result 195: { hname: 'SF-KP200 목표변동성', upcode: '670' }
             📊 Result 196: { hname: 'SF-KQ150 USD 혼합', upcode: '671' }
             📊 Result 197: { hname: 'F-K200 에너지/화학', upcode: '751' }
             📊 Result 198: { hname: 'F-K200 정보기술', upcode: '752' }
             📊 Result 199: { hname: 'F-K200 금융', upcode: '753' }
             📊 Result 200: { hname: 'F-K200 경기소비재', upcode: '754' }
             📊 Result 201: { hname: 'F-K200 건설', upcode: '755' }
             📊 Result 202: { hname: 'F-K200 중공업', upcode: '756' }
             📊 Result 203: { hname: 'F-K200 헬스케어', upcode: '757' }
             📊 Result 204: { hname: 'F-K200 생활소비재', upcode: '758' }
             📊 Result 205: { hname: 'F-K200 철강/소재', upcode: '759' }
             📊 Result 206: { hname: 'F-K200 산업재', upcode: '760' }
             📊 Result 207: { hname: 'F-K200 에너지/화학 �', upcode: '761' }
             📊 Result 208: { hname: 'F-K200 정보기술 레버', upcode: '762' }
             📊 Result 209: { hname: 'F-K200 금융 레버리지', upcode: '763' }
             📊 Result 210: { hname: 'F-K200 경기소비재 레', upcode: '764' }
             📊 Result 211: { hname: 'F-K200 건설 레버리지', upcode: '765' }
             📊 Result 212: { hname: 'F-K200 중공업 레버리', upcode: '766' }
             📊 Result 213: { hname: 'F-K200 헬스케어 레버', upcode: '767' }
             📊 Result 214: { hname: 'F-K200 생활소비재 레', upcode: '768' }
             📊 Result 215: { hname: 'F-K200 철강/소재 레�', upcode: '769' }
             📊 Result 216: { hname: 'F-K200 산업재 레버리', upcode: '770' }
             📊 Result 217: { hname: 'F-K200 에너지/화학 �', upcode: '771' }
             📊 Result 218: { hname: 'F-K200 정보기술 인버', upcode: '772' }
             📊 Result 219: { hname: 'F-K200 금융 인버스', upcode: '773' }
             📊 Result 220: { hname: 'F-K200 경기소비재 인', upcode: '774' }
             📊 Result 221: { hname: 'F-K200 건설 인버스', upcode: '775' }
             📊 Result 222: { hname: 'F-K200 중공업 인버스', upcode: '776' }
             📊 Result 223: { hname: 'F-K200 헬스케어 인버', upcode: '777' }
             📊 Result 224: { hname: 'F-K200 생활소비재 인', upcode: '778' }
             📊 Result 225: { hname: 'F-K200 철강/소재 인�', upcode: '779' }
             📊 Result 226: { hname: 'F-K200 산업재 인버스', upcode: '780' }
             📊 Result 227: { hname: 'F-K200 에너지/화학 �', upcode: '781' }
             📊 Result 228: { hname: 'F-K200 정보기술 인버', upcode: '782' }
             📊 Result 229: { hname: 'F-K200 금융 인버스-2', upcode: '783' }
             📊 Result 230: { hname: 'F-K200 경기소비재 인', upcode: '784' }
             📊 Result 231: { hname: 'F-K200 건설 인버스-2', upcode: '785' }
             📊 Result 232: { hname: 'F-K200 중공업 인버스', upcode: '786' }
             📊 Result 233: { hname: 'F-K200 헬스케어 인버', upcode: '787' }
             📊 Result 234: { hname: 'F-K200 생활소비재 인', upcode: '788' }
             📊 Result 235: { hname: 'F-K200 철강/소재 인�', upcode: '789' }
             📊 Result 236: { hname: 'F-K200 산업재 인버스', upcode: '790' }
             📊 Result 237: { hname: 'KOSPI 총수익', upcode: '791' }
             📊 Result 238: { hname: 'KOSDAQ 총수익', upcode: '792' }
             📊 Result 239: { hname: 'KOSDAQ150 총수익', upcode: '793' }
             📊 Result 240: { hname: 'KRX 300 총수익', upcode: '794' }
             📊 Result 241: { hname: 'KOSPI 고배당50 총수�', upcode: '796' }
             📊 Result 242: { hname: 'KSP배당성장50총수익', upcode: '797' }
             📊 Result 243: { hname: 'KOSPI200 ESG', upcode: '798' }
             📊 Result 244: { hname: 'F-KTB 3-10스티프닝', upcode: '810' }
             📊 Result 245: { hname: 'F-KTB 3-10플래트닝', upcode: '811' }
             📊 Result 246: { hname: 'F-KTB 3-10스티프닝2X', upcode: '812' }
             📊 Result 247: { hname: 'F-KTB 3-10플래트닝2X', upcode: '813' }
             📊 Result 248: { hname: 'KP200-KQ150 비중5:5', upcode: '814' }
             📊 Result 249: { hname: 'KP200-KQ150 비중7:3', upcode: '815' }
             📊 Result 250: { hname: 'KP200-KQ150 비중3:7', upcode: '816' }
             📊 Result 251: { hname: 'KP200 L KQ150 S', upcode: '817' }
             📊 Result 252: { hname: 'KQ150 L KP200 S', upcode: '818' }
             📊 Result 253: { hname: 'KP200 L KQ150 0.5 S', upcode: '819' }
             📊 Result 254: { hname: 'KQ150 L KP200 0.5 S', upcode: '820' }
             ✅ getAllInd API test completed successfully with 254 result(s)
             🏁 getAllInd test completed




             */

        }

        if (resultCount === 0) {
          console.log('⚠️  No results returned from getAllInd API');
        } else {
          console.log(`✅ getAllInd API test completed successfully with ${resultCount} result(s)`);
        }

      } catch (apiError) {
        console.error('❌ Error calling getAllInd API:', apiError);

        // Log additional error details if available
        if (apiError instanceof Error) {
          console.error('   Error message:', apiError.message);
          console.error('   Error stack:', apiError.stack);
        }
      }

    } else {
      console.error('❌ getAllInd function is not available in SDK');
    }

  } catch (sdkError) {
    console.error('❌ Error initializing SDK:', sdkError);
  }

  console.log('🏁 getAllInd test completed');
})();
