"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function MarketSummaryCard({ summary }: { summary: { id: string; title: string; content: string; sites: number } }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="gf-market-summary__card">
      <div className="py-2 border-b border-border last:border-b-0">
        <CollapsibleTrigger>
           <div className="flex w-full justify-between px-0 py-0 h-auto bg-transparent hover:bg-transparent text-left inline-flex items-center gap-2 rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:outline-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 [&_button:hover]:bg-muted/50">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="gf-market-summary__title text-[14px] text-foreground truncate">{summary.title}</span>
             </div>
             <div className="flex items-center gap-2 flex-shrink-0 ml-2">
               <Badge variant="outline" className="text-[10px]">{summary.sites} sites</Badge>
               {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
             </div>
           </div>
         </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 pb-2">
          <p className="gf-market-summary__content text-[14px] text-muted-foreground leading-relaxed">{summary.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <Button variant="link" className="h-auto p-0 text-primary underline-offset-4 hover:underline">
              <Search className="w-3 h-3 mr-1" /> AI로 더 자세히 알아보기
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
