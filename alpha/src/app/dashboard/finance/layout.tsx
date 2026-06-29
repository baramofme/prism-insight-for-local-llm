'use client';

import { useEffect } from 'react';
import { useAppMode } from '@/stores/app-mode';
import { ResearchChatPanel } from '@/components/layout/research-chat-panel';

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useAppMode();

  useEffect(() => {
    if (mode !== 'finance') {
      setMode('finance');
    }
  }, [mode, setMode]);

  return (
    <div className='flex flex-1'>
      <main className='flex-1'>{children}</main>
      {mode === 'finance' && (
        <aside className='w-80 shrink-0'>
          <ResearchChatPanel />
        </aside>
      )}
    </div>
  );
}
