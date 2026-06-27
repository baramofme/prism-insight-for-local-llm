import type { NewsItem, Period, Sector, SeriesPoint, StockDetail, MarketIndex, MarketMover, WatchlistItem } from '../types';
import { PERIODS } from '../types';

// Deterministic pseudo-random so SSR and client render identically.
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function makeSeries(base: number, points: number, vol: number, seed: number): SeriesPoint[] {
  const rnd = seeded(seed);
  const out: SeriesPoint[] = [];
  let v = base * (0.9 + rnd() * 0.05);
  for (let i = 0; i < points; i++) {
    v = Math.max(base * 0.5, v + (rnd() - 0.48) * base * vol);
    out.push({ t: String(i), v: Math.round(v) });
  }
  out[out.length - 1] = { t: String(points - 1), v: base };
  return out;
}

const SERIES_SHAPE: Record<Period, [number, number]> = {
  '1D': [78, 0.004],
  '5D': [60, 0.01],
  '1M': [22, 0.02],
  '6M': [120, 0.025],
  YTD: [120, 0.03],
  '1Y': [250, 0.035],
  '5Y': [260, 0.06],
  MAX: [300, 0.08]
};

// SK하이닉스 000660:KRX — values aligned with the GOOGLE_FINANCE_*.md spec docs.
export function getStockDetail(symbol: string): StockDetail {
  const price = 2917000;
  const changePct = 5.29;
  const changeAbs = Math.round((price * changePct) / (100 + changePct));

  const series = Object.fromEntries(
    PERIODS.map((p, i) => [p, makeSeries(price, SERIES_SHAPE[p][0], SERIES_SHAPE[p][1], 1000 + i)])
  ) as Record<Period, SeriesPoint[]>;

  return {
    quote: {
      symbol: symbol || '000660:KRX',
      ticker: (symbol || '000660:KRX').split(':')[0],
      name: 'SK하이닉스',
      exchange: 'KRX',
      price,
      currency: 'KRW',
      changeAbs,
      changePct,
      asOf: '6월 26일, 오전 10시 30분 KRW'
    },
    metrics: [
      { label: '시가', value: '₩2,728,000' },
      { label: '고가', value: '₩2,945,000' },
      { label: '저가', value: '₩2,728,000' },
      { label: '시가총액', value: '2,063.99조' },
      { label: '평균 거래량', value: '562.73만' },
      { label: '거래량', value: '219.86만' },
      { label: '배당수익률', value: '0.10%' },
      { label: '주가수익률(PER)', value: '27.45' },
      { label: '52주 최고가', value: '₩2,945,000' },
      { label: '52주 최저가', value: '₩245,000' },
      { label: 'EPS', value: '₩105,627' },
      { label: '유통 주식수', value: '7.13억' },
      { label: '직원 수', value: '3만' },
      { label: '배당락일', value: '2026. 5. 28.' },
      { label: '분기 배당금', value: '₩750' }
    ],
    related: [
      { symbol: '005930:KRX', ticker: '005930', name: '삼성전자', price: 357000, currency: 'KRW', changePct: 0.85 },
      { symbol: '015760:KRX', ticker: '015760', name: '한국전력', price: 38150, currency: 'KRW', changePct: -0.66 },
      { symbol: '042700:KRX', ticker: '042700', name: '한미반도체', price: 299000, currency: 'KRW', changePct: 1.36 },
      { symbol: '285A:TYO', ticker: '285A', name: '키오시아', price: 111350, currency: 'JPY', changePct: 2.53 }
    ],
    news: [
      { id: 'n1', title: 'SK하이닉스, HBM4 양산 본격화… AI 메모리 슈퍼사이클 수혜', source: '한국경제', time: '2시간 전' },
      { id: 'n2', title: '외국인 순매수 행진… 반도체 대형주 강세', source: '매일경제', time: '4시간 전' },
      { id: 'n3', title: '메모리 가격 반등 지속, 3분기 실적 기대감 확대', source: '서울경제', time: '6시간 전' },
      { id: 'n4', title: '증권가 "SK하이닉스 목표주가 상향" 잇따라', source: '연합뉴스', time: '8시간 전' }
    ],
    profile: {
      description:
        'SK하이닉스는 대한민국의 반도체 기업으로 DRAM, NAND 플래시 등 메모리 반도체를 주력으로 생산한다. AI 가속기용 고대역폭 메모리(HBM) 시장의 핵심 공급사로, 글로벌 메모리 반도체 시장에서 선도적 지위를 차지하고 있다.',
      website: 'skhynix.com',
      ceo: '곽노정',
      employees: '약 3만 명',
      headquarters: '대한민국 이천',
      founded: '1983년'
    },
    series
  };
}

// ── Market Overview Mock Data ──

export const MOCK_SECTORS: Sector[] = [
  { ticker: 'SIXB', name: 'Materials', price: 1234.56, change: 5.55, changePercent: 0.45 },
  { ticker: 'SIXC', name: 'Communications', price: 2345.67, change: -7.51, changePercent: -0.32 },
  { ticker: 'SIXE', name: 'Energy', price: 1876.54, change: -23.08, changePercent: -1.23 },
  { ticker: 'SIXI', name: 'Industrials', price: 3210.98, change: 27.94, changePercent: 0.87 },
  { ticker: 'SIXM', name: 'Financials', price: 2109.87, change: 32.91, changePercent: 1.56 },
  { ticker: 'SIXR', name: 'Staples', price: 1543.21, change: 1.85, changePercent: 0.12 },
  { ticker: 'SIXRE', name: 'Real Estate', price: 987.65, change: -7.70, changePercent: -0.78 },
  { ticker: 'SIXT', name: 'Technology', price: 3656.35, change: -60.33, changePercent: -1.65 },
  { ticker: 'SIXU', name: 'Utilities', price: 1432.10, change: 4.87, changePercent: 0.34 },
  { ticker: 'SIXV', name: 'Health Care', price: 2567.89, change: 14.38, changePercent: 0.56 },
  { ticker: 'SIXY', name: 'Discretionary', price: 1890.12, change: 4.35, changePercent: 0.23 }
];

export const MOCK_INDICES: MarketIndex[] = [
  { name: 'KOSPI', value: 2765.43, change: 12.34, changePercent: 0.45, region: 'KR' },
  { name: 'KOSDAQ', value: 876.54, change: -3.21, changePercent: -0.37, region: 'KR' },
  { name: 'S&P 500', value: 5432.10, change: 23.45, changePercent: 0.43, region: 'US' },
  { name: 'NASDAQ', value: 17654.32, change: 156.78, changePercent: 0.89, region: 'US' },
  { name: 'Nikkei 225', value: 38765.43, change: 234.56, changePercent: 0.61, region: 'JP' }
];

export const MOCK_NEWS: NewsItem[] = [
  { id: 'm1', title: 'Fed, 기준금리 동결… 연내 2회 인하 전망 유지', source: '연합뉴스', time: '1시간 전', summary: '연방준비제도가 기준금리를 동결하고 연내 2회 인하 전망을 유지했다.' },
  { id: 'm2', title: '뉴욕증시, 기술주 강세… 나스닥 사상 최고치 경신', source: '한국경제', time: '2시간 전' },
  { id: 'm3', title: '반도체 수출 7개월 연속 증가… 6월 역대 최대 실적', source: '매일경제', time: '3시간 전' },
  { id: 'm4', title: '中 경기부양책 발표 앞두고… 원자재주 강세', source: '서울경제', time: '4시간 전' },
  { id: 'm5', title: '외국인 코스피 순매수 3조원 돌파… 연중 최대', source: '조선비즈', time: '5시간 전' }
];

export const MOCK_MARKET_MOVERS = {
  mostActive: [
    { symbol: '005930:KRX', name: '삼성전자', price: 75400, changePercent: 1.34, market: 'KRX' as const },
    { symbol: '000660:KRX', name: 'SK하이닉스', price: 291700, changePercent: 5.29, market: 'KRX' as const },
    { symbol: 'AAPL', name: 'Apple', price: 245.67, changePercent: 0.89, market: 'NASDAQ' as const }
  ],
  gainers: [
    { symbol: '005935:KRX', name: '삼성전자우', price: 62300, changePercent: 3.45, market: 'KRX' as const },
    { symbol: '035420:KRX', name: 'NAVER', price: 198500, changePercent: 2.78, market: 'KRX' as const },
    { symbol: 'NVDA', name: 'NVIDIA', price: 895.34, changePercent: 1.56, market: 'NASDAQ' as const }
  ],
  losers: [
    { symbol: '051910:KRX', name: 'LG화학', price: 320000, changePercent: -2.34, market: 'KRX' as const },
    { symbol: '207940:KRX', name: '삼성바이오로직스', price: 890000, changePercent: -1.78, market: 'KRX' as const },
    { symbol: 'TSLA', name: 'Tesla', price: 345.67, changePercent: -3.21, market: 'NASDAQ' as const }
  ]
};

export const MOCK_WATCHLIST: WatchlistItem[] = [
  { symbol: '000660:KRX', name: 'SK하이닉스', price: 291700, changePercent: 5.29, market: 'KRX' },
  { symbol: '005930:KRX', name: '삼성전자', price: 75400, changePercent: 1.34, market: 'KRX' },
  { symbol: 'AAPL', name: 'Apple', price: 245.67, changePercent: 0.89, market: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA', price: 895.34, changePercent: 1.56, market: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla', price: 345.67, changePercent: -3.21, market: 'NASDAQ' }
];

export function getAllSectors(): Sector[] { return MOCK_SECTORS; }
export function getMarketIndices(): MarketIndex[] { return MOCK_INDICES; }
export function getMarketNews(): NewsItem[] { return MOCK_NEWS; }
export function getMarketMovers() { return MOCK_MARKET_MOVERS; }
export function getWatchlist(): WatchlistItem[] { return MOCK_WATCHLIST; }
