'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { authClient } from '@/lib/auth-client';
import { getAllSectors, getWatchlist } from '@/features/finance/data/mock';

type NavView = 'sectors' | 'watchlist';

export function FinanceSidebar() {
  const [view, setView] = useState<NavView>('sectors');
  const { data: session } = authClient.useSession();
  const sessionUser = session?.user;
  const user = sessionUser
    ? { imageUrl: sessionUser.image ?? undefined, fullName: sessionUser.name, emailAddresses: [{ emailAddress: sessionUser.email }] }
    : null;

  const sectors = getAllSectors();
  const watchlist = getWatchlist();

  return (
    <>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Select value={view} onValueChange={(v: NavView) => setView(v)}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select view' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='sectors'>
                    <div className='flex items-center gap-2'>
                      <Icons.trendingUp className='size-4' />
                      <span>Equity Sectors</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='watchlist'>
                    <div className='flex items-center gap-2'>
                      <Icons.search className='size-4' />
                      <span>Watchlist</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            {view === 'sectors' ? 'Equity Sectors' : 'Watchlist'}
          </SidebarGroupLabel>
          <SidebarMenu>
            {view === 'sectors'
              ? sectors.map((sector) => (
                  <SidebarMenuItem key={sector.ticker}>
                    <SidebarMenuButton asChild>
                      <Link href={`/dashboard/finance/${sector.ticker}`}>
                        <div className='flex w-full items-center justify-between'>
                          <div className='flex flex-col'>
                            <span className='text-sm font-medium'>{sector.name}</span>
                            <span className='text-xs text-muted-foreground'>{sector.ticker}</span>
                          </div>
                          <div className='flex flex-col items-end'>
                            <span className='text-sm'>{sector.price.toLocaleString()}</span>
                            <span className={`text-xs ${sector.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              : watchlist.length > 0
              ? watchlist.map((item) => (
                  <SidebarMenuItem key={item.symbol}>
                    <SidebarMenuButton asChild>
                      <Link href={`/dashboard/finance/${item.symbol}`}>
                        <div className='flex w-full items-center justify-between'>
                          <div className='flex flex-col'>
                            <span className='text-sm font-medium'>{item.name}</span>
                            <span className='text-xs text-muted-foreground'>{item.symbol}</span>
                          </div>
                          <div className='flex flex-col items-end'>
                            <span className='text-sm'>{item.price.toLocaleString()}</span>
                            <span className={`text-xs ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              : (
                <SidebarMenuItem>
                  <div className='text-muted-foreground px-2 py-8 text-center text-sm'>
                    No stocks in your watchlist
                  </div>
                </SidebarMenuItem>
              )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {user && <UserAvatarProfile className='h-8 w-8 rounded-lg' showInfo user={user} />}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
