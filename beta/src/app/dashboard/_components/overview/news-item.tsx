"use client";

import { Newspaper, Globe, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function NewsItem({ item }: { item: { id: number; title: string; source: string; time: string; icon: string } }) {
  const Icon = item.icon === "Newspaper" ? Newspaper : Globe;
  // Mock news has no source URL; open a search for the headline like GF opens
  // the article. Kept as a real link so it's keyboard-accessible.
  const href = `https://news.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={item.title} className="block">
    <Card className="gf-news__item hover:bg-muted/50 transition-colors cursor-pointer border-border/60 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <Avatar className="gf-news__icon w-10 h-10 rounded-lg flex-shrink-0 bg-muted">
            <AvatarFallback><Icon className="w-5 h-5 text-muted-foreground" /></AvatarFallback>
          </Avatar>
          <div className="gf-news__content flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="secondary" className="text-[10px]">{item.source}</Badge>
              <span className="text-[11px] text-muted-foreground">·</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="gf-news__meta text-[11px] text-muted-foreground">{item.time}</span>
              </div>
            </div>
            <p className="gf-news__headline text-[14px] text-foreground leading-snug line-clamp-2 font-medium">{item.title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    </a>
  );
}
