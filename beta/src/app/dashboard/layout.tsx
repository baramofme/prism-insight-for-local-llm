"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, Briefcase, Settings, TrendingUp, Menu, X,
  ArrowUp, ArrowDown, Plus, ListTree
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/dashboard/stocks", label: "종목 검색", icon: Search },
  { href: "/dashboard/portfolio", label: "포트폴리오", icon: Briefcase },
  { href: "/dashboard/settings", label: "설정", icon: Settings },
];

const watchlistItems = [
  { name: "삼성전자", change: 1.2 },
  { name: "SK하이닉스", change: 3.5 },
  { name: "LG에너지솔루션", change: -0.8 },
  { name: "현대차", change: 0.5 },
  { name: "셀트리온", change: -2.1 },
  { name: "NAVER", change: 0.3 },
  { name: "카카오", change: -1.4 },
  { name: "포스코홀딩스", change: 2.7 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isGoogleFinance = pathname === "/dashboard";

  if (isGoogleFinance) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">PRISM</span>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Lists Section */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ListTree className="h-3 w-3" />
                Lists
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ScrollArea className="h-[280px] pr-1">
              <div className="space-y-0.5">
                {watchlistItems.map((item) => (
                  <button
                    key={item.name}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                      "text-foreground hover:bg-accent"
                    )}
                    onClick={() => setSidebarOpen(false)}
                    aria-label={`${item.name} 종목 보기`}
                  >
                    <span className="font-medium truncate">{item.name}</span>
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-semibold tabular-nums",
                      item.change >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {item.change >= 0 ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      <span>{item.change >= 0 ? "+" : ""}{item.change}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* User info placeholder */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                U
              </div>
              <div className="text-sm">
                <div className="font-medium">사용자</div>
                <div className="text-xs text-muted-foreground">Free Plan</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-card">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-bold">PRISM</span>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
