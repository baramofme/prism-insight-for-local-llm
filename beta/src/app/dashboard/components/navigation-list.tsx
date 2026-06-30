import React from "react";
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { MiniChart } from "../_components/overview/mini-chart";
import { formatPrice, getSparklineColor } from "../_lib/format";

export function SectionHeader({ title, titleAfter, rightButtons = [], className = "" }: {
  title: string;
  titleAfter?: React.ReactNode;
  rightButtons?: React.ReactNode[];
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      {/* GF "목록 ▾": 24px/400 title with the list-selector caret inline. */}
      <div className="flex items-center gap-0.5 min-w-0">
        <span className="text-[24px] font-normal text-foreground truncate">{title}</span>
        {titleAfter}
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        {rightButtons}
      </div>
    </div>
  );
}

export function SimpleStockNav({ item, index, sparkData, onStockClick, compact }: {
  item: any;
  index: number;
  sparkData: any[];
  onStockClick?: () => void;
  compact?: boolean;
}) {
  const color = getSparklineColor(item.positive);

  // Collapsed rail (80px): GF shows ticker + change% only, centered — no name,
  // no sparkline, no price (those overflow the rail).
  if (compact) {
    return (
      <Button
        variant="ghost"
        onClick={onStockClick}
        title={item.fullName || item.name}
        className="w-full h-auto py-2 px-1 hover:bg-muted/50 transition-colors rounded-lg flex-col items-center gap-0.5"
      >
        <div className="text-[12px] font-semibold text-foreground truncate max-w-full leading-tight">{item.name}</div>
        <div className={`text-[11px] font-medium flex items-center gap-0.5 leading-tight ${item.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>
          <span>{item.change}</span>
          {item.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        </div>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={onStockClick}
      className="w-full h-auto p-3 hover:bg-muted/50 transition-colors rounded-lg justify-start border-border/40"
    >
      <div className="text-left truncate min-w-0 flex-1">
        <div className="text-[14px] font-medium text-foreground truncate">{item.name}</div>
        <div className="text-[12px] text-muted-foreground truncate">{item.fullName || ""}</div>
      </div>
      {/* ml gives the left gap; the price column sits flush so the chart can
          move right (price is right-aligned, so text never touches it). */}
      <div className="flex-shrink-0 ml-3">
        <MiniChart data={sparkData[index].data} color={color} prevClose={sparkData[index].data[0]} small />
      </div>
      {/* Fixed price column (sized to the longest price) → the center chart
          lands at the same x on every row and a bit further right, GF-style,
          without clipping prices. */}
      <div className="text-right flex flex-col items-end w-[80px] shrink-0 ml-1">
        <div className="text-[14px] tabular-nums font-medium text-foreground truncate max-w-full">{formatPrice(item.price)}</div>
        <div className={`text-[11px] font-medium flex items-center gap-0.5 ${item.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>
          <span>{item.change}</span>
          {item.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        </div>
      </div>
    </Button>
  );
}

export function ListNavigation({ title, isOpen, onToggleOpen, rightButtons = [], children }: { 
  title: string; 
  isOpen: boolean; 
  onToggleOpen: () => void; 
  rightButtons?: React.ReactNode[]; 
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggleOpen} className="mb-2">
      <div className="flex items-center w-full">
        <CollapsibleTrigger className="flex-1 min-w-0">
          {/* GF group header: 16px/400 title, symmetric 24px inset, ~28px tall */}
          <div className="flex items-center justify-between w-full py-1 px-6 cursor-pointer">
            <span className="text-[16px] font-normal text-foreground truncate">{title}</span>
            <span aria-label={isOpen ? "닫기" : "열기"}>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </span>
          </div>
        </CollapsibleTrigger>
        {rightButtons.length > 0 && (
          <div className="flex items-center gap-0.5 shrink-0 pr-6">
            {rightButtons}
          </div>
        )}
      </div>
      <CollapsibleContent>
        {/* GF rows: symmetric 24px inset = content px-3 (12) + row p-3 (12). */}
        <div className="px-3 space-y-0.5 py-1">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
