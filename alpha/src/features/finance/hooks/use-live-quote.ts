'use client';

import { useQuery } from '@tanstack/react-query';
import type { Quote } from '../types';

export type LiveQuote = Pick<Quote, 'price' | 'changeAbs' | 'changePct' | 'asOf'>;

// Polls the mock quote endpoint every 5s. Seeded with the server-rendered
// quote so the first paint has data and there is no loading flash.
export function useLiveQuote(symbol: string, initial: LiveQuote) {
  return useQuery<LiveQuote>({
    queryKey: ['finance', 'quote', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/finance/quote/${encodeURIComponent(symbol)}`);
      if (!res.ok) throw new Error('quote fetch failed');
      return res.json();
    },
    initialData: initial,
    refetchInterval: 5000
  });
}
