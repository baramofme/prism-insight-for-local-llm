import React from "react";
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { MiniChart } from "../_components/overview/mini-chart";
import { formatPrice, getSparklineColor } from "../_lib/format";

// Shared header layout: left (title) / right (action buttons). Used by both the
// section header (목록) and every group header so the right-hand buttons line up
// at identical sizes/positions.
export function NavGroupHeader({ left, right, className = "" }: {
  left: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  // No w-full: as a block flex container its width is auto, so a margin (used
  // by SectionHeader) reduces it correctly instead of overflowing.
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center gap-0.5 flex-1 min-w-0">{left}</div>
      {right ? <div className="flex items-center gap-0.5 shrink-0">{right}</div> : null}
    </div>
  );
}

export function SectionHeader({ title, titleAfter, rightButtons = [], className = "" }: {
  title: string;
  titleAfter?: React.ReactNode;
  rightButtons?: React.ReactNode[];
  className?: string;
}) {
  // Same header style as a group header, just a bigger title + an inline caret.
  return (
    <NavGroupHeader
      className={`py-2 ${className}`}
      left={
        <>
          <span className="text-[24px] font-normal text-foreground truncate">{title}</span>
          {titleAfter}
        </>
      }
      right={rightButtons.length ? rightButtons : undefined}
    />
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
        <div className={`text-[11px] font-medium flex items-center gap-0.5 leading-tight ${item.positive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]"}`}>
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
      className="w-full h-auto px-0 py-3 hover:bg-muted/50 transition-colors rounded-lg justify-start border-border/40"
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
        <div className={`text-[11px] font-medium flex items-center gap-0.5 ${item.positive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]"}`}>
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
    // No bottom padding — group spacing comes from each group's pt-6.
    <Collapsible open={isOpen} onOpenChange={onToggleOpen} className="pt-6">
      {/* Same header style as SectionHeader: plain title on the left; action
          buttons then the collapse chevron (the only trigger) on the right.
          `group` reveals the hover-only action icons. */}
      <NavGroupHeader
        className="group mb-2"
        left={<span className="text-[16px] font-normal text-foreground truncate">{title}</span>}
        right={
          <>
            {rightButtons}
            <CollapsibleTrigger
              aria-label={isOpen ? `${title} 접기` : `${title} 펼치기`}
              className="flex items-center justify-center h-6 w-6 cursor-pointer text-muted-foreground"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
          </>
        }
      />
      <CollapsibleContent>
        {/* Rows sit flush in the groups container (which provides the 24px
            inset); no horizontal padding here. */}
        <div className="space-y-0.5">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
