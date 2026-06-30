'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface WatchListItem {
  name: string;
  change: number;
}

interface GfNavRailProps {
  navItems: NavItem[];
  watchlistItems?: WatchListItem[];
}

type NavMode = 'hidden' | 'collapsed' | 'expanded';

function useNavMode(): NavMode {
  const [mode, setMode] = useState<NavMode>('hidden');

  useEffect(() => {
    const mqCollapsed = window.matchMedia('(min-width: 760px)');
    const mqExpanded = window.matchMedia('(min-width: 1480px)');

    const update = () => {
      if (!mqCollapsed.matches) {
        setMode('hidden');
      } else if (mqExpanded.matches) {
        setMode('expanded');
      } else {
        setMode('collapsed');
      }
    };

    update();
    mqCollapsed.addEventListener('change', update);
    mqExpanded.addEventListener('change', update);
    return () => {
      mqCollapsed.removeEventListener('change', update);
      mqExpanded.removeEventListener('change', update);
    };
  }, []);

  return mode;
}

export function GfNavRail({ navItems, watchlistItems }: GfNavRailProps) {
  const mode = useNavMode();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

  const visible = mode !== 'hidden';
  const width = mode === 'expanded' || hovered ? 320 : 80;

  useEffect(() => {
    if (mode === 'expanded') setHovered(false);
  }, [mode]);

  const handleMouseEnter = useCallback(() => {
    if (mode === 'collapsed') setHovered(true);
  }, [mode]);

  const handleMouseLeave = useCallback(() => {
    if (mode === 'collapsed') setHovered(false);
  }, [mode]);

  if (!visible) return null;

  return (
    <nav
      id="gf-nav-rail"
      data-gf="nav-rail"
      className="gf-nav-rail fixed top-0 left-0 h-screen z-50 overflow-hidden bg-background border-r border-border"
      style={{
        width: `${width}px`,
        transition: 'width 0.2s ease',
        zIndex: mode === 'collapsed' && hovered ? 60 : 50,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full py-3 px-2">
        <Link href="/dashboard/settings" className="py-1.5 block">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="PRISM" className="h-8 w-8" />
            <span
              className="text-lg font-semibold truncate"
              style={{ display: width > 100 ? undefined : 'none' }}
            >
              PRISM
            </span>
          </div>
        </Link>

        <ul className="mt-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-gf-bg-hover text-gf-text-primary'
                      : 'text-gf-text-secondary hover:bg-gf-bg-hover hover:text-gf-text-primary',
                  )}
                  style={{ justifyContent: width > 100 ? undefined : 'flex-start' }}
                >
                  <Icon className="shrink-0 h-4 w-4" />
                  <span
                    className="truncate"
                    style={{ display: width > 100 ? undefined : 'none' }}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {watchlistItems && watchlistItems.length > 0 && (
          <div className="mt-4 flex-1 overflow-y-auto">
            <div
              className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gf-text-secondary"
              style={{ display: width > 100 ? undefined : 'none' }}
            >
              Lists
            </div>
            <ul className="space-y-0.5">
              {watchlistItems.map((item) => (
                <li key={item.name}>
                  <div
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-gf-bg-hover',
                    )}
                  >
                    <span
                      className="text-gf-text-primary truncate"
                      style={{ display: width > 100 ? undefined : 'none' }}
                    >
                      {item.name}
                    </span>
                    {width > 100 && (
                      <span
                        className={cn(
                          'ml-auto text-xs font-semibold tabular-nums',
                          item.change >= 0 ? 'text-[var(--gf-color-rise)]' : 'text-[var(--gf-color-fall)]',
                        )}
                      >
                        {item.change >= 0 ? '+' : ''}
                        {item.change}%
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="shrink-0 h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
              U
            </div>
            <div
              className="min-w-0"
              style={{ display: width > 100 ? undefined : 'none' }}
            >
              <div className="text-sm font-medium truncate">사용자</div>
              <div className="text-xs text-gf-text-secondary truncate">Free Plan</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
