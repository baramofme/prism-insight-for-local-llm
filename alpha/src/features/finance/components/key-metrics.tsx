import type { MetricItem } from '../types';

export function KeyMetrics({ items }: { items: MetricItem[] }) {
  return (
    <div className='bg-border grid grid-cols-1 gap-px overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-3'>
      {items.map((m) => (
        <div key={m.label} className='bg-background flex items-center justify-between px-4 py-3'>
          <span className='text-muted-foreground text-sm'>{m.label}</span>
          <span className='text-sm font-medium tabular-nums'>{m.value}</span>
        </div>
      ))}
    </div>
  );
}
