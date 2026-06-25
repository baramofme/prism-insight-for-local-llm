"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Settings,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Plus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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

  // The Google Finance clone (/dashboard) renders its own full-page shell.
  if (pathname === "/dashboard") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <TrendingUp className="h-6 w-6 shrink-0 text-primary" />
            <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">
              PRISM
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={pathname === item.href}
                        tooltip={item.label}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Lists</SidebarGroupLabel>
            <SidebarGroupAction title="목록 추가">
              <Plus /> <span className="sr-only">목록 추가</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {watchlistItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton tooltip={item.name}>
                      <span className="truncate">{item.name}</span>
                      <span
                        className={cn(
                          "ml-auto flex items-center gap-0.5 text-xs font-semibold tabular-nums",
                          item.change >= 0 ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {item.change >= 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {item.change >= 0 ? "+" : ""}
                        {item.change}%
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium">
              U
            </div>
            <div className="text-sm group-data-[collapsible=icon]:hidden">
              <div className="font-medium">사용자</div>
              <div className="text-xs text-muted-foreground">Free Plan</div>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-bold">PRISM</span>
          </div>
        </header>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
