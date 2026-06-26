import { Newspaper } from 'lucide-react';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import type { NewsItem } from '../types';

export function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ItemGroup className='gap-1'>
      {items.map((n) => (
        <Item key={n.id} variant='outline'>
          <ItemMedia variant='icon'>
            <Newspaper />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className='line-clamp-2'>{n.title}</ItemTitle>
            <ItemDescription>
              {n.source} · {n.time}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
