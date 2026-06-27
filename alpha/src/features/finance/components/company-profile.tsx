'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { CompanyProfile } from '../types';

export function CompanyProfileCard({ profile }: { profile: CompanyProfile }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className='space-y-2'>
      <p className={open ? '' : 'line-clamp-3'}>{profile.description}</p>
      <CollapsibleContent className='grid grid-cols-1 gap-2 text-xs sm:grid-cols-2'>
        {profile.ceo && (<div><span className='text-muted-foreground'>CEO </span>{profile.ceo}</div>)}
        {profile.employees && (<div><span className='text-muted-foreground'>직원 </span>{profile.employees}</div>)}
        {profile.headquarters && (<div><span className='text-muted-foreground'>본사 </span>{profile.headquarters}</div>)}
        {profile.founded && (<div><span className='text-muted-foreground'>설립 </span>{profile.founded}</div>)}
        {profile.website && (<div><span className='text-muted-foreground'>웹 </span>{profile.website}</div>)}
      </CollapsibleContent>
      <CollapsibleTrigger asChild>
        <Button variant='ghost' size='sm' className='gap-1'>
          {open ? '접기' : '더보기'}
          <ChevronDown className={`size-4 transition ${open ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
    </Collapsible>
  );
}
