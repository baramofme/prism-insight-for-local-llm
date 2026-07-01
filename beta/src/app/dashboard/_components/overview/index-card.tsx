"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { formatPrice, getSparklineColor, generateSparklineData, useDeterministicSparkline } from "../../_lib/format";
import { MiniChart } from "./mini-chart";
import { Card, CardContent } from "@/components/ui/card";

export function IndexCard({
  item, vp, onClick,
}: {
  item: { name: string; value: string; change: string; isPositive: boolean; basePrice: number };
  vp: number;
  onClick?: () => void;
}) {
  const sp = useDeterministicSparkline(item.basePrice);
  const numVal = parseFloat(item.value.replace(/,/g, ''));
  const pct = parseFloat(item.change.replace('%', ''));
  const absChange = numVal * Math.abs(pct) / 100;
  const absStr = absChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const color = item.isPositive ? "#0E9E4B" : "#FF4B4B";
  return (
    <Card id="gf-index-card" onClick={onClick} role={onClick ? "button" : undefined} aria-label={onClick ? `${item.name} 상세` : undefined} className="gf-index-card px-3 py-3 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden border-border/40">
      <CardContent className="p-0">
        <div className="gf-index-card__name text-[14px] font-semibold text-foreground truncate mb-1">{item.name}</div>
        <div className="gf-index-card__value text-[12px] text-muted-foreground tabular-nums">{item.value}</div>
        {vp >= BREAKPOINTS.MOBILE && <div className="text-[12px] text-muted-foreground">({item.isPositive ? "+" : "-"}${absStr})</div>}
        <div className="flex items-center gap-0.5 mt-1.5">
          <span className={`gf-index-card__change text-[14px] font-medium ${item.isPositive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>{item.change}</span>
          {item.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 text-[#0E9E4B]" /> : <ArrowDownRight className="w-3.5 h-3.5 text-[#FF4B4B]" />}
        </div>
        <div className={cn("gf-index-card__sparkline -mx-3 -mb-3", vp < BREAKPOINTS.MOBILE ? "mt-0.5" : "mt-2")}>
          <MiniChart data={sp} color={color} prevClose={sp[0]} fillWidth />
        </div>
      </CardContent>
    </Card>
  );
}
