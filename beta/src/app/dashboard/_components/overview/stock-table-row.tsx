"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TableCell, TableRow } from "@/components/ui/table";

export function StockTableRow({
  stock,
  showVolume,
  volume,
}: {
  stock: {
    rank: number;
    name: string;
    ticker: string;
    price: string;
    change: string;
    isPositive: boolean;
    basePrice: number;
    volume?: string;
  };
  showVolume?: boolean;
  volume?: string;
}) {
  return (
    <TableRow className="gf-stock-table__row hover:bg-muted/50 cursor-pointer transition-colors">
      <TableCell className="gf-stock-table__cell py-1.5 px-2">
        <div className="flex items-center gap-1 min-w-0">
          <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">{stock.ticker}</Badge>
          <span className="text-[14px] text-foreground truncate min-w-0">{stock.name}</span>
        </div>
      </TableCell>
      <TableCell className="gf-stock-table__cell text-right py-1.5 px-2 tabular-nums text-foreground whitespace-nowrap w-[74px]">
        {stock.price}
      </TableCell>
      <TableCell className="gf-stock-table__cell text-right py-1.5 px-2 whitespace-nowrap w-[66px]">
        <div className={cn("flex items-center gap-0.5 justify-end", stock.isPositive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]")}>
          <span className="text-[11px] font-medium">{stock.change}</span>
          {stock.isPositive ? <ArrowUpRight className="w-3 h-3 text-[var(--gf-up)]" /> : <ArrowDownRight className="w-3 h-3 text-[var(--gf-down)]" />}
        </div>
      </TableCell>
      {showVolume && (
        <TableCell className="gf-stock-table__cell text-right py-1.5 px-2 tabular-nums text-muted-foreground whitespace-nowrap w-[52px]">
          {volume ?? stock.volume ?? '—'}
        </TableCell>
      )}
    </TableRow>
  );
}
