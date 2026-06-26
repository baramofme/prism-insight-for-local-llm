'use client';

import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

/**
 * Viewport-driven sidebar state (per design breakpoints):
 *  - ≥1380px  : expanded (width 300px / 320px@≥1480 via globals.css)
 *  - 768~1380 : collapsed (icon rail, widened to 4.5rem)
 *  - <768px   : mobile sheet (handled by SidebarProvider isMobile)
 */
export function SidebarAutoCollapse() {
  const { setOpen, isMobile } = useSidebar();
  useEffect(() => {
    if (isMobile) return;
    const mq = window.matchMedia('(min-width: 1380px)');
    const apply = () => setOpen(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [isMobile, setOpen]);
  return null;
}
