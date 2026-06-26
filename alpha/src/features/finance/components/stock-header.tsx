import { ArrowDown, ArrowUp } from 'lucide-react';
import type { Quote } from '../types';
import { changeColorClass, formatPct, formatPrice } from '../lib/colors';

export function StockHeader({ quote }: { quote: Quote }) {
  const up = quote.changePct >= 0;
  return (
    <div className='space-y-1'>
      <div className='text-muted-foreground text-sm'>
        {quote.ticker} · {quote.exchange}
      </div>
      <h1 className='text-xl font-medium'>{quote.name}</h1>
      <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
        <span className='text-2xl font-medium tabular-nums'>{formatPrice(quote.price, quote.currency)}</span>
        <span className={`flex items-center gap-1 text-sm font-medium tabular-nums ${changeColorClass(quote.changePct)}`}>
          {up ? <ArrowUp className='size-4' /> : <ArrowDown className='size-4' />}
          {formatPct(quote.changePct)} ({formatPrice(Math.abs(quote.changeAbs), quote.currency)})
        </span>
      </div>
      <div className='text-muted-foreground text-xs'>{quote.asOf}</div>
    </div>
  );
}
