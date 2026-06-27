'use client';

import { useAppMode } from '@/stores/app-mode';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';

export function VersionSwitcher() {
  const { mode, setMode } = useAppMode();

  const displayName = mode === 'main' ? 'Dashboard' : 'Finance';
  const DisplayIcon = mode === 'main' ? Icons.dashboard : Icons.trendingUp;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <DisplayIcon className='size-4' />
              </div>
              <div className='flex flex-col gap-0.5 leading-none'>
                <span className='font-semibold'>{displayName}</span>
                <span className='text-xs'>{mode === 'main' ? 'Admin' : 'Markets'}</span>
              </div>
              <Icons.chevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side='bottom'
            sideOffset={4}
          >
            <DropdownMenuItem onClick={() => setMode('main')} className='gap-2 p-2'>
              <div className='flex size-6 items-center justify-center rounded-sm border'>
                <Icons.dashboard className='size-4 shrink-0' />
              </div>
              <div className='flex flex-col gap-0.5 leading-none'>
                <span className='font-semibold'>Dashboard</span>
                <span className='text-xs'>Admin panel</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMode('finance')} className='gap-2 p-2'>
              <div className='flex size-6 items-center justify-center rounded-sm border'>
                <Icons.trendingUp className='size-4 shrink-0' />
              </div>
              <div className='flex flex-col gap-0.5 leading-none'>
                <span className='font-semibold'>Finance</span>
                <span className='text-xs'>Market overview</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
