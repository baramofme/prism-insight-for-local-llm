'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SidebarTrigger } from '../ui/sidebar';
import { Breadcrumbs } from '../breadcrumbs';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import { Icons } from '../icons';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '../ui/avatar';

type Market = 'kr' | 'us';

export default function Header() {
  const [market, setMarket] = useState<Market>('kr');

  return (
    <header className='bg-background/60 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 backdrop-blur-md'>
      <div className='flex items-center gap-1 pl-1 pr-2'>
        <SidebarTrigger className='-ml-1' />
        <Link href='/dashboard/overview' className='flex items-center gap-1.5 px-2'>
          <Icons.logo className='h-4 w-4' />
          <span className='text-sm font-bold tracking-tight'>PRISM</span>
        </Link>
      </div>

      <div className='min-w-0 flex-1 flex items-center gap-3'>
        <div className='hidden md:flex min-w-0 flex-shrink-0'>
          <Breadcrumbs />
        </div>
        <div className='flex-1 max-w-xs sm:max-w-sm md:max-w-md'>
          <div className='relative'>
            <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search stocks...'
              className='w-full rounded-full bg-muted px-9 py-1.5 text-sm outline-none transition-colors focus:bg-muted/80 placeholder:text-muted-foreground'
            />
          </div>
        </div>
      </div>

      <div className='flex items-center gap-1.5 pr-3 shrink-0'>
        <div className='hidden sm:flex items-center rounded-full border bg-background p-0.5'>
          <button
            onClick={() => setMarket('kr')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              market === 'kr'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            KR
          </button>
          <button
            onClick={() => setMarket('us')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              market === 'us'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            US
          </button>
        </div>

        <ThemeModeToggle />
        <NotificationCenter />

        <Avatar className='h-8 w-8 cursor-pointer'>
          <AvatarImage src='' alt='Profile' />
          <AvatarFallback className='text-xs'>
            <Icons.user className='h-4 w-4' />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
