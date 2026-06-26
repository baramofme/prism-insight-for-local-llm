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
  const up = detail.quote.changePct >= 0;

  return (
    <div className='mx-auto w-full max-w-3xl space-y-6'>
      <StockHeader quote={detail.quote} />

      <div className='space-y-2'>
        <PriceChart data={detail.series[period]} up={up} />
        <ToggleGroup
          type='single'
          value={period}
          onValueChange={(v) => v && setPeriod(v as Period)}
          variant='outline'
          size='sm'
          className='flex-wrap justify-start'
        >
          {PERIODS.map((p) => (
            <ToggleGroupItem key={p} value={p} className='px-3'>
              {p}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ContentTab)}>
        <TabsList>
          {CONTENT_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
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
