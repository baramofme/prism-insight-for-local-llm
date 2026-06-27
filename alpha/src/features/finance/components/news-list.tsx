import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import type { NewsItem } from '../types';

export function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ItemGroup className='gap-1'>
      {items.map((n) => (
        <Item key={n.id} variant='outline'>
          <ItemContent>
            <ItemTitle className='line-clamp-2'>{n.title}</ItemTitle>
            <ItemDescription className='text-muted-foreground text-xs'>
              {n.source} · {n.time}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
