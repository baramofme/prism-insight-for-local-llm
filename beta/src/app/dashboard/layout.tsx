'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { GfLayout } from '@/components/layout/gf-layout';
import { GfNavRail } from '@/components/layout/gf-nav-rail';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/dashboard/stocks', label: '종목 검색', icon: Search },
  { href: '/dashboard/portfolio', label: '포트폴리오', icon: Briefcase },
  { href: '/dashboard/settings', label: '설정', icon: Settings },
];

const watchlistItems = [
  { name: '삼성전자', change: 1.2 },
  { name: 'SK하이닉스', change: 3.5 },
  { name: 'LG에너지솔루션', change: -0.8 },
  { name: '현대차', change: 0.5 },
  { name: '셀트리온', change: -2.1 },
  { name: 'NAVER', change: 0.3 },
  { name: '카카오', change: -1.4 },
  { name: '포스코홀딩스', change: 2.7 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/dashboard') {
    return <>{children}</>;
  }

  return (
    <>
      <GfNavRail navItems={navItems} watchlistItems={watchlistItems} />

      <header
        className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4"
        style={{ marginLeft: 'var(--main-margin-left)' }}
      >
        <TrendingUp className="h-5 w-5 text-primary" />
        <span className="font-bold">PRISM</span>
      </header>
      <GfLayout>{children}</GfLayout>
    </>
  );
}
