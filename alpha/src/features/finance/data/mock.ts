import type { Period, SeriesPoint, StockDetail } from '../types';
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
