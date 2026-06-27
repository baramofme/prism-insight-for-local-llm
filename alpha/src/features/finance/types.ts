// Domain types for the Google Finance-style stock detail view.

export type Period = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';
export const PERIODS: Period[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

export type ContentTab = 'overview' | 'financials' | 'earnings';
export const CONTENT_TABS: { value: ContentTab; label: string }[] = [
  { value: 'overview', label: '개요' },
  { value: 'financials', label: '재무' },
  { value: 'earnings', label: '실적' }
];

export interface Quote {
  symbol: string; // "000660:KRX"
  ticker: string; // "000660"
  name: string; // "SK하이닉스"
  exchange: string; // "KRX"
  price: number;
  currency: string; // "KRW"
  changeAbs: number;
  changePct: number;
  asOf: string;
}

export interface MetricItem {
  label: string;
  value: string;
}

export interface RelatedStock {
  symbol: string;
  ticker: string;
  name: string;
  price: number;
  currency: string;
  changePct: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  summary?: string;
  url?: string;
}

export interface CompanyProfile {
  description: string;
  website?: string;
  ceo?: string;
  employees?: string;
  headquarters?: string;
  founded?: string;
}

export type SeriesPoint = { t: string; v: number };

export interface StockDetail {
  quote: Quote;
  metrics: MetricItem[];
  related: RelatedStock[];
  news: NewsItem[];
  profile: CompanyProfile;
  series: Record<Period, SeriesPoint[]>;
}

export interface Sector {
  ticker: string; // "SIXB" ~ "SIXY"
  name: string;   // "Materials", "Communications", etc.
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketIndex {
  name: string;    // "KOSPI", "S&P 500", etc.
  value: number;
  change: number;
  changePercent: number;
  region: 'KR' | 'US' | 'JP' | 'EU';
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  market: 'KRX' | 'NYSE' | 'NASDAQ' | 'TYO';
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  market: 'KRX' | 'NYSE' | 'NASDAQ' | 'TYO';
}
