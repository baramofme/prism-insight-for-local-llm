'use client';

import { Area, AreaChart, YAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import type { SeriesPoint } from '../types';
import { changeHex } from '../lib/colors';

export function PriceChart({ data, up }: { data: SeriesPoint[]; up: boolean }) {
  const color = changeHex(up ? 1 : -1);
  const config = { v: { label: '가격', color } } satisfies ChartConfig;
  const vals = data.map((d) => d.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return (
    <ChartContainer config={config} className='h-[240px] w-full'>
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id='fillPrice' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={color} stopOpacity={0.25} />
            <stop offset='100%' stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={[min * 0.998, max * 1.002]} hide />
        <Area
          dataKey='v'
          type='monotone'
          stroke={color}
          strokeWidth={2}
          fill='url(#fillPrice)'
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
