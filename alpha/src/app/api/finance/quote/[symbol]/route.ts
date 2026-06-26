import { NextResponse } from 'next/server';
import { getStockDetail } from '@/features/finance/data/mock';

// Mock live quote: jitters the base price to simulate a real-time tick.
// (Client polls this via React Query — see useLiveQuote.)
export async function GET(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const base = getStockDetail(decodeURIComponent(symbol)).quote;
  const prevClose = Math.round(base.price / (1 + base.changePct / 100));
  const jitter = (Math.random() - 0.5) * 0.008; // ±0.4%
  const price = Math.round(base.price * (1 + jitter));
  const changeAbs = price - prevClose;
  const changePct = (changeAbs / prevClose) * 100;
  return NextResponse.json({ price, changeAbs, changePct, asOf: '실시간' });
}
