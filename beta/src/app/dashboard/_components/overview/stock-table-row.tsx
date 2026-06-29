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
        <div className="min-w-0 flex-1">
          <Badge variant="secondary" className="mr-1 font-mono text-[10px]">{stock.ticker}</Badge>
          <span className="text-[14px] text-foreground truncate">{stock.name}</span>
        </div>
      </TableCell>
      <TableCell className="gf-stock-table__cell text-right py-1.5 px-2 tabular-nums text-foreground whitespace-nowrap">
        {stock.price}
      </TableCell>
      <TableCell className="gf-stock-table__cell text-right py-1.5 px-2 whitespace-nowrap">
        <div className={cn("flex items-center gap-0.5 justify-end", stock.isPositive ? "text-[#0E9E4B]" : "text-[#FF4B4B]")}>
          <span className="text-[11px] font-medium">{stock.change}</span>
          {stock.isPositive ? <ArrowUpRight className="w-3 h-3 text-[#0E9E4B]" /> : <ArrowDownRight className="w-3 h-3 text-[#FF4B4B]" />}
        </div>
      </TableCell>
      {showVolume && (
        <TableCell className="gf-stock-table__cell text-right py-1.5 px-2 tabular-nums text-muted-foreground whitespace-nowrap">
          {volume ?? stock.volume ?? '—'}
        </TableCell>
      )}
    </TableRow>
  );
}
