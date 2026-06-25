import React from "react";
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { MiniChart, formatPrice, getSparklineColor } from "./main-content";

export function SectionHeader({ title, rightButtons = [] }: { 
  title: string; 
  rightButtons?: React.ReactNode[] 
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[16px] font-medium text-foreground">{title}</span>
      <div className="flex items-center gap-0.5 shrink-0">
        {rightButtons}
      </div>
    </div>
  );
}

export function SimpleStockNav({ item, index, sparkData, onStockClick }: { 
  item: any; 
  index: number; 
  sparkData: any[]; 
  onStockClick?: () => void 
}) {
  const color = getSparklineColor(item.positive);
  
  return (
    <Button 
      variant="ghost" 
      onClick={onStockClick}
      className="w-full h-auto p-3 hover:bg-muted/50 transition-colors rounded-lg justify-start gap-3 border-border/40"
    >
      <div className="text-left truncate min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-foreground truncate">{item.name}</div>
        <div className="text-[11px] text-muted-foreground truncate">{item.fullName || ""}</div>
      </div>
      <div className="flex-shrink-0">
        <MiniChart data={sparkData[index].data} color={color} prevClose={sparkData[index].data[0]} small />
      </div>
      <div className="text-right flex flex-col items-end min-w-0 ml-2">
        <div className="text-[13px] tabular-nums font-semibold text-foreground">{formatPrice(item.price)}</div>
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
    <Collapsible open={isOpen} onOpenChange={onToggleOpen} className="mb-1">
      <CollapsibleTrigger>
        <div className="flex items-center justify-between w-full px-0 py-0 h-auto bg-transparent hover:bg-transparent text-left inline-flex gap-2 rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:outline-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 [&_button:hover]:bg-muted/50">
          <SectionHeader 
            title={title} 
            rightButtons={[...rightButtons]} 
          />
          <span aria-label={isOpen ? "닫기" : "열기"}>
            {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-2 space-y-0.5 py-1">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
