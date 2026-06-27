'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import type { RelatedStock } from '../types';
import { changeColorClass, formatPct, formatPrice } from '../lib/colors';

export function RelatedStocks({ items }: { items: RelatedStock[] }) {
  return (
    <Carousel opts={{ align: 'start' }} className='w-full'>
      <CarouselContent className='-ml-2'>
        {items.map((s) => (
          <CarouselItem key={s.symbol} className='basis-1/2 pl-2 md:basis-1/3 lg:basis-1/4'>
            <Card className='py-0'>
              <CardContent className='space-y-1 p-4'>
                <div className='text-muted-foreground text-xs'>{s.ticker}</div>
                <div className='truncate text-base font-medium'>{s.name}</div>
                <div className='text-xs text-muted-foreground tabular-nums'>{formatPrice(s.price, s.currency)}</div>
                <div className={`text-base font-medium tabular-nums ${changeColorClass(s.changePct)}`}>
                  {formatPct(s.changePct)}
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className='hidden sm:flex' />
      <CarouselNext className='hidden sm:flex' />
    </Carousel>
  );
}
