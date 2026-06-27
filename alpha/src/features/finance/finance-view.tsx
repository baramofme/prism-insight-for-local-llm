'use client';

import { parseAsStringEnum, useQueryState } from 'nuqs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockHeader } from './components/stock-header';
import { PriceChart } from './components/price-chart';
import { KeyMetrics } from './components/key-metrics';
import { RelatedStocks } from './components/related-stocks';
import { NewsList } from './components/news-list';
import { CompanyProfileCard } from './components/company-profile';
import { useLiveQuote } from './hooks/use-live-quote';
import { CONTENT_TABS, PERIODS, type ContentTab, type Period, type StockDetail } from './types';

export function FinanceView({ detail }: { detail: StockDetail }) {
  const [period, setPeriod] = useQueryState(
    'period',
    parseAsStringEnum<Period>([...PERIODS]).withDefault('1D')
  );
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum<ContentTab>(CONTENT_TABS.map((t) => t.value)).withDefault('overview')
  );
  const live = useLiveQuote(detail.quote.symbol, {
    price: detail.quote.price,
    changeAbs: detail.quote.changeAbs,
    changePct: detail.quote.changePct,
    asOf: detail.quote.asOf
  });
  const quote = { ...detail.quote, ...live.data };
  const up = quote.changePct >= 0;

  return (
    <div className='mx-auto w-full max-w-3xl space-y-6'>
      <StockHeader quote={quote} />

      <div className='space-y-2'>
        <PriceChart data={detail.series[period]} up={up} />
        <ToggleGroup
          type='single'
          value={period}
          onValueChange={(v) => v && setPeriod(v as Period)}
          variant='default'
          size='sm'
          className='rounded-none p-0 gap-1.5 h-6 flex-wrap justify-start'
        >
          {PERIODS.map((p) => (
            <ToggleGroupItem
              key={p}
              value={p}
              className='rounded-none bg-transparent h-6 px-1 min-w-0 text-xs text-[#56595E] font-normal hover:bg-transparent hover:text-[#56595E] data-[state=on]:bg-transparent data-[state=on]:text-[#0A0A0A] data-[state=on]:font-medium'
            >
              {p}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ContentTab)}>
        <TabsList className='bg-transparent rounded-none p-0 h-auto gap-6 border-b border-border w-full'>
          {CONTENT_TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className='rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-1.5 h-auto text-sm font-medium text-[#444746] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#1F1F1F] data-[state=active]:border-b-[#1F1F1F] hover:bg-transparent'
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value='overview' className='space-y-8 pt-4'>
          <section className='space-y-3'>
            <h2 className='text-base font-semibold'>핵심 지표</h2>
            <KeyMetrics items={detail.metrics} />
          </section>
          <section className='space-y-3'>
            <h2 className='text-base font-semibold'>관련 주식</h2>
            <RelatedStocks items={detail.related} />
          </section>
          <section className='space-y-3'>
            <h2 className='text-base font-semibold'>뉴스</h2>
            <NewsList items={detail.news} />
          </section>
          <section className='space-y-3'>
            <h2 className='text-base font-semibold'>프로필</h2>
            <CompanyProfileCard profile={detail.profile} />
          </section>
        </TabsContent>
        <TabsContent value='financials' className='pt-4'>
          <div className='text-muted-foreground'>재무 데이터는 추후 연동 예정입니다.</div>
        </TabsContent>
        <TabsContent value='earnings' className='pt-4'>
          <div className='text-muted-foreground'>실적 데이터는 추후 연동 예정입니다.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
