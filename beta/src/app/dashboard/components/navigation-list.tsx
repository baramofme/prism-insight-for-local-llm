import React from "react";
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { MiniChart } from "../_components/overview/mini-chart";
import { formatPrice, getSparklineColor } from "../_lib/format";

export function SectionHeader({ title, rightButtons = [], className = "" }: {
  title: string;
  rightButtons?: React.ReactNode[];
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      <span className="text-[16px] font-medium text-foreground">{title}</span>
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
      className="w-full h-auto p-3 hover:bg-muted/50 transition-colors rounded-lg justify-start gap-3 border-border/40"
    >
      <div className="text-left truncate min-w-0 flex-1">
        <div className="text-[14px] font-medium text-foreground truncate">{item.name}</div>
        <div className="text-[12px] text-muted-foreground truncate">{item.fullName || ""}</div>
      </div>
      <div className="flex-shrink-0">
        <MiniChart data={sparkData[index].data} color={color} prevClose={sparkData[index].data[0]} small />
      </div>
      <div className="text-right flex flex-col items-end min-w-0 ml-2">
        <div className="text-[14px] tabular-nums font-medium text-foreground">{formatPrice(item.price)}</div>
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
          {/* GF group header: 16px/400 title, 24px left inset, ~28px tall */}
          <div className="flex items-center justify-between w-full py-1 pl-6 pr-2 cursor-pointer">
            <span className="text-[16px] font-normal text-foreground truncate">{title}</span>
            <span aria-label={isOpen ? "닫기" : "열기"}>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </span>
          </div>
        </CollapsibleTrigger>
        {rightButtons.length > 0 && (
          <div className="flex items-center gap-0.5 shrink-0 pr-2">
            {rightButtons}
          </div>
        )}
      </div>
      <CollapsibleContent>
        {/* GF rows sit at 24px inset: content pl-3 (12) + row p-3 (12). */}
        <div className="pl-3 space-y-0.5 py-1">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
