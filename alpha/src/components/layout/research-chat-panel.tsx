'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const suggestedPrompts = [
  "What's moving the markets today?",
  'Compare S&P 500 to Nasdaq',
  'Top gainers this week',
  'Market outlook this quarter'
];

export function ResearchChatPanel() {
  const [input, setInput] = useState('');

  return (
    <div className='flex h-full flex-col border-l'>
      <div className='flex items-center gap-2 border-b p-4'>
        <Icons.trendingUp className='size-5' />
        <div>
          <h3 className='font-semibold'>Research</h3>
          <p className='text-muted-foreground text-xs'>AI-powered insights</p>
        </div>
      </div>

      <div className='flex-1 space-y-4 overflow-y-auto p-4'>
        <p className='text-muted-foreground text-sm'>
          Ask anything about the markets, stocks, or financial data...
        </p>

        <div className='flex flex-wrap gap-2'>
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type='button'
              onClick={() => setInput(prompt)}
              className='bg-muted hover:bg-accent rounded-full px-3 py-1.5 text-xs transition-colors'
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className='border-t p-4'>
        <div className='flex gap-2'>
          <Input
            placeholder='Ask AI...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='flex-1'
          />
          <Button size='icon' disabled={!input.trim()}>
            <Icons.send className='size-4' />
          </Button>
        </div>
        <p className='text-muted-foreground mt-2 text-xs'>
          AI content may include mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
