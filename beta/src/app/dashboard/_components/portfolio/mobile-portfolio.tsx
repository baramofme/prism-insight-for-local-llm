"use client";

import { ArrowUpRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { watchlistStocks } from "../../_data/watchlist";
import { formatPrice } from "../../_lib/format";

export function MobilePortfolio({ vp, onViewPortfolio }: { vp: number; onViewPortfolio?: () => void }) {
  if (vp >= BREAKPOINTS.MOBILE) return null;

  return <>
    <div id="gf-mobile-portfolio" className="gf-mobile-portfolio mb-5">
      <div className="text-[20px] font-medium text-foreground mb-1">포트폴리오</div>
      <div className="flex items-center px-1 py-1.5 text-[12px] text-muted-foreground border-b border-border">
        <div className="flex-1">이름</div>
        <div className="w-[100px] text-right">가격</div>
        <div className="w-[90px] text-right">변동</div>
      </div>
      <div className="flex items-center px-1 py-2.5 cursor-pointer hover:bg-muted transition-colors rounded" role="button" onClick={onViewPortfolio}>
        <div className="flex-1">
          <div className="text-[14px] text-foreground font-medium">투자중</div>
        </div>
        <div className="w-[100px] text-right text-[14px] text-foreground tabular-nums">$19,653,380.00</div>
        <div className="w-[90px] text-right flex items-center justify-end gap-0.5 text-[14px] text-[var(--gf-up)] font-medium">
          <span>+2.36%</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>

    <div className="mb-5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[20px] font-medium text-foreground">목록의 최대 변동 항목</span>
        <div className="flex items-center gap-0.5 text-[14px] text-muted-foreground cursor-pointer px-2 py-1 rounded hover:bg-muted transition-colors">
          <span>통계</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 pr-2 font-medium whitespace-nowrap">종목 코드</th>
                <th className="text-right py-2 px-2 font-medium whitespace-nowrap">가격</th>
                <th className="text-right py-2 px-2 font-medium whitespace-nowrap">변동</th>
                <th className="text-right py-2 pl-2 font-medium whitespace-nowrap">변동률(%)</th>
              </tr>
          </thead>
          <tbody>
            {watchlistStocks.map((s, idx) => (
              <tr key={s.name} className="border-b border-border last:border-b-0 hover:bg-muted cursor-pointer transition-colors">
                <td className="py-2 pr-2">
                  <div className="text-[14px] font-semibold text-foreground">{s.name}</div>
                  <div className="text-[12px] text-muted-foreground">{s.fullName}</div>
                </td>
                <td className="text-right py-2 px-2 tabular-nums text-foreground text-[14px] whitespace-nowrap">{formatPrice(s.price)}</td>
                <td className={`text-right py-2 px-2 tabular-nums whitespace-nowrap ${s.positive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]"}`}>{s.positive ? "+" : ""}{s.change}</td>
                <td className="text-right py-2 px-2 tabular-nums text-muted-foreground whitespace-nowrap">{s.change}</td>
              </tr>
            ))}
          </tbody>
            </table>
          </div>
      <div className="flex items-center gap-2 pt-3 overflow-x-auto scroll-hide">
        <Button variant="ghost" className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] text-primary hover:bg-muted rounded-lg transition-colors whitespace-nowrap shrink-0">
          <List className="w-4 h-4" /> 모든 목록 보기
        </Button>
        <Button variant="ghost" className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] text-primary hover:bg-muted rounded-lg transition-colors whitespace-nowrap shrink-0">관심 목록</Button>
        <Button variant="ghost" className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] text-primary hover:bg-muted rounded-lg transition-colors whitespace-nowrap shrink-0">테스트 목록</Button>
      </div>
    </div>
    </>;
}
