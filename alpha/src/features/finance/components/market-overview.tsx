'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { getMarketIndices, getMarketMovers, getMarketNews } from '@/features/finance/data/mock';
import type { MarketIndex, MarketMover, NewsItem } from '../types';

const REGION_COLORS: Record<string, string> = {
  KR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  US: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  JP: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  EU: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
};

function RegionBadge({ region }: { region: string }) {
  return (
    <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', REGION_COLORS[region] || 'bg-muted text-muted-foreground')}>
      {region}
    </span>
  );
}

function IndexCard({ index }: { index: MarketIndex }) {
  const isPositive = index.change >= 0;
  const TrendIcon = isPositive ? Icons.trendingUp : Icons.trendingDown;

  return (
    <div className='border border-border rounded-lg p-4 hover:border-accent transition-colors'>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-semibold'>{index.name}</span>
        <RegionBadge region={index.region} />
      </div>
      <div className='text-xl font-bold tabular-nums'>{index.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div className={cn(
        'flex items-center gap-1 text-sm mt-1 tabular-nums',
        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      )}>
        <TrendIcon className='h-3.5 w-3.5' />
        <span>{isPositive ? '+' : ''}{index.change.toFixed(2)} ({isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%)</span>
      </div>
    </div>
  );
}

function MoverRow({ mover }: { mover: MarketMover }) {
  const isPositive = mover.changePercent >= 0;
  const TrendIcon = isPositive ? Icons.trendingUp : Icons.trendingDown;
  const linkSymbol = mover.symbol.split(':')[0];

  return (
    <Link
      href={`/dashboard/finance/${linkSymbol}`}
      className='flex items-center justify-between py-2 border-b border-border last:border-b-0 hover:bg-accent/50 rounded transition-colors px-1 -mx-1'
    >
      <div className='min-w-0'>
        <div className='text-sm font-medium truncate'>{mover.name}</div>
        <div className='text-xs text-muted-foreground tabular-nums'>{mover.price.toLocaleString()}</div>
      </div>
      <div className={cn(
        'flex items-center gap-1 text-sm tabular-nums shrink-0',
        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      )}>
        <TrendIcon className='h-3.5 w-3.5' />
        <span>{isPositive ? '+' : ''}{mover.changePercent.toFixed(2)}%</span>
      </div>
    </Link>
  );
}

function MoversColumn({ title, movers }: { title: string; movers: MarketMover[] }) {
  return (
    <div>
      <h3 className='font-semibold text-sm mb-3'>{title}</h3>
      <div className='space-y-0'>
        {movers.map((m) => (
          <MoverRow key={m.symbol} mover={m} />
        ))}
      </div>
    </div>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <div className='py-3 border-b border-border last:border-b-0 hover:bg-accent/50 rounded transition-colors px-1 -mx-1'>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <h4 className='text-sm font-medium leading-snug truncate'>{item.title}</h4>
          {item.summary && (
            <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>{item.summary}</p>
          )}
        </div>
        <div className='shrink-0 text-right'>
          <span className='block text-xs text-muted-foreground'>{item.source}</span>
          <span className='text-xs text-muted-foreground'>{item.time}</span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='border border-border rounded-lg p-4'>
      <h2 className='font-semibold mb-4'>{title}</h2>
      {children}
    </section>
  );
}

export function MarketOverview() {
  const indices = getMarketIndices();
  const movers = getMarketMovers();
  const news = getMarketNews();

  return (
    <div className='space-y-6'>
      <Section title='Markets'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
          {indices.map((idx) => (
            <IndexCard key={idx.name} index={idx} />
          ))}
        </div>
      </Section>

      <Section title='Market Movers'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <MoversColumn title='Most Active' movers={movers.mostActive} />
          <MoversColumn title='Top Gainers' movers={movers.gainers} />
          <MoversColumn title='Top Losers' movers={movers.losers} />
        </div>
      </Section>

      <Section title='Market News'>
        <div className='space-y-0'>
          {news.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
        </div>
      </Section>
    </div>
  );
}
