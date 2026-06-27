import type { MetricItem } from '../types';

export function KeyMetrics({ items }: { items: MetricItem[] }) {
  return (
    <div className='grid grid-cols-3 rounded-lg border'>
      {items.map((m) => (
        <div key={m.label} className='bg-background flex flex-col items-start px-3 py-2'>
          <span className='text-muted-foreground text-xs'>{m.label}</span>
          <span className='tabular-nums text-xs'>{m.value}</span>
        </div>
      ))}
    </div>
  );
}
