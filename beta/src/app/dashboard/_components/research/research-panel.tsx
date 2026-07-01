"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, PenSquare, Mic, Info, Edit3, Plus, Minus, Globe, Newspaper, Clock, X, Maximize2, Minimize2, ScrollText, ArrowLeft, Brain, TrendingUp, BarChart3, MessageSquare, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Chart, AreaSeries, LineSeries } from 'lightweight-charts-react-components';
import { ColorType } from 'lightweight-charts';
import { SectionHeader, SimpleStockNav, ListNavigation } from "../../components/navigation-list";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { regionIndices } from "../../_data/indices";
import { marketSummaries, newsItems } from "../../_data/news";
import { mostActiveStocks, gainers, losers } from "../../_data/stocks";
import { sectorIndices } from "../../_data/sectors";
import { watchlistStocks } from "../../_data/watchlist";
import { searchStockSuggestions, searchAiPrompts, footerTickerSuggestions } from "../../_data/search";
import { formatPrice, getSparklineColor, generateSparklineData, useDeterministicSparkline } from "../../_lib/format";
import { SHAPE_TYPES, type ShapeType, type ShapeRenderer, SHAPE_SVG, AssetSymbol, getAssetShape } from "../../_lib/shapes";
import { MiniChart } from "../../_components/overview/mini-chart";

const posColor = "#D32F2F";
const negColor = "#1976D2";

export function ResearchPanel({ centerBounds, expanded, setExpanded, collapsedWidth, embedded, initialQuestion, initialQuestionId, wrapperMargin, rightW, onClose }: { centerBounds?: { left: number; right: number }; expanded?: boolean; setExpanded?: (v: boolean) => void; collapsedWidth?: number; embedded?: boolean; initialQuestion?: string; initialQuestionId?: number; wrapperMargin?: number; rightW?: number; onClose?: () => void }) {
  const [showHistory, setShowHistory] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; time: string }[]>([]);
  const [expandedMsgs, setExpandedMsgs] = useState<Set<number>>(new Set());
  const [toolsOpen, setToolsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isExpanded = expanded ?? false;
  const setIsExpanded = setExpanded ?? (() => {});
  const isEmbedded = embedded ?? false;
  const lastQuestionId = useRef(0);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const isWideTable = measuredWidth > 1000;

  const toggleMsg = (i: number) => {
    setExpandedMsgs(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const fmtTime = () => {
    const d = new Date();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const mon = months[d.getMonth()];
    const day = d.getDate();
    let h = d.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${mon} ${day}, ${h}:${min} ${ampm}`;
  };

  const loadSemiconductorChat = () => {
    const t = "Jun 19, 2026";
    setMessages([
      { role: "user" as const, content: "왜 다 팔아서 현금을 쓰라고 해. 쓰면 돈이 남지 않잖아.\n\n투자자님의 마음을 충분히 이해합니다. 돈을 벌기 위해 투자를 시작했는데, 힘들게 번 수익을 인출해서 써버리면 자산이 줄어든다는 그 아쉬움이 당연히 크실 겁니다.\n\n제가 왜 '현금화'를 제안했는지, 그 이면의 심리적·투자적 이유를 명확히 설명해 드립니다.", time: t },
      { role: "assistant" as const, content: "투자자님의 마음을 충분히 이해합니다. 돈을 벌기 위해 투자를 시작했는데, 힘들게 번 수익을 인출해서 써버리면 자산이 줄어든다는 그 아쉬움이 당연히 크실 겁니다.\n\n1. '투자'와 '소비'의 경계선 긋기\n현재 투자자님은 이별의 고통을 잊기 위해 주식 거래라는 행위 자체에 몰입하고 계십니다. 수익금을 그대로 계좌에 두면, 그 돈은 다시 '더 큰 도파민을 위한 불쏘시개'로 사용될 확률이 매우 높습니다.\n\n2. '나'를 지키는 헤지(Hedge)\n지금 투자자님의 가장 중요한 자산은 SK하이닉스도, 삼성전기도 아닙니다. 일상생활을 영위하고 업무에 집중할 수 있는 '투자자님 본인'입니다.\n\n3. 관점의 전환: 인출은 실패가 아닙니다\n투자의 목적은 결국 '더 나은 삶'입니다. 오늘의 수익 5.47%를 통해 얻은 현금으로 이별의 고통을 조금이라도 치유할 수 있다면, 그것은 자산이 줄어드는 것이 아니라 '치유라는 가치'로 교환된 것입니다.", time: t },
      { role: "user" as const, content: "나 월요일까지 보고싶어. 하이닉스 ADR 로 미국에 상장될 때까지는 버티고 싶어.\n\n20년 주식 투자한 철저한 경력자라고 너를 가정해봐. 그리고 월요일에 투기세가 나와서 반도체 주가가 하락할 여지가 있는지 생각을 해봐.\n\n전쟁이 끝났어. 그리고 지금 돈이 몰릴 곳이 한곳밖에 없고. 일단은 오를 수 밖에 없다는 게 내 생각이야.", time: t },
      { role: "assistant" as const, content: "20년 동안 시장의 온갖 파도를 몸으로 겪어온 투자자의 관점에서, 투자자님의 지금 상황과 향후 전략을 냉정하게 짚어드리겠습니다.\n\n1. 월요일, 투기세와 반도체 주가의 향방\n월요일의 변수: 주말 동안 발생한 뉴스나 금요일 미국 시장의 마감 상황에 따라 월요일 아침 투기적 자금은 언제든 방향을 바꿀 수 있습니다. 특히 반도체는 현재 외국인과 기관의 수급이 집중되어 있어, 그들이 차익 실현을 위해 물량을 던지는 날이 바로 '투기세가 빠지는 날'이 됩니다.\n\n2. 하이닉스 ADR 이슈, 월요일에 꺼질까?\nADR 이슈나 기업의 호재는 주가에 미리 반영되는 경우가 많습니다. 만약 월요일에 ADR 관련 구체적인 발표나 뉴스 흐름이 나오지 않는다면, '기대감으로 올랐던 주가가 실망감으로 되돌림'이 나타날 가능성이 있습니다.\n\n3. '오를 수밖에 없다'는 확신에 대한 경고\n20년 시장을 보면 가장 위험한 것이 '오를 수밖에 없다'는 확신입니다. 시장은 언제나 '오를 수밖에 없는 이유'를 만들어내지만, 동시에 '내려야 할 이유'도 항상 공존합니다.\n\n정리: 월요일에 주가가 하락할 여지는 분명히 있습니다. '하이닉스 ADR까지 버티겠다'는 전략을 유지하시되, 구체적인 탈출 계획을 지금 적어두세요.", time: t },
      { role: "user" as const, content: "외국인은 매도하고 나갔어. 지금 국내 자금이 유입중인거 같은데 실제로 그런지 검색을 해봐", time: t },
      { role: "assistant" as const, content: "투자자님, 지금 시장의 수급 상황은 투자자님의 생각과 매우 밀접하게 맞닿아 있습니다.\n\n1. 외국인의 이탈과 수급의 공백\n최근 외국인은 코스피 시장에서 19거래일 연속 순매도라는 기록적인 탈출세를 보이고 있으며, 이 중 약 83%에 달하는 59조 원가량이 반도체 및 IT 업종에 집중되어 있습니다.\n\n2. 국내 자금의 유입 (동학개미의 방어)\n외국인이 쏟아내는 물량을 현재 시장에서 받아내고 있는 주체는 사실상 국내 개인 투자자들입니다. 외국인의 이중 타격(주가 손실+환손실) 회피 심리와 개인의 '반등 기대감'이 정면으로 충돌하는 구간입니다.\n\n3. 경력자로서의 제언\n월요일 장에서 개인 투자자들의 매수세가 여전히 강력하게 유지되는지 수급 데이터를 반드시 확인하십시오.", time: t },
      { role: "user" as const, content: "나 초보라서, 시나리오를 어떻게 만드는 지 몰라.", time: t },
      { role: "assistant" as const, content: "초보 투자자에게 '시나리오'라는 말은 거창해 보일 수 있지만, 사실 '만약~하면 어떻게 할까?'라는 질문을 미리 던져보는 것일 뿐입니다.\n\n1단계: 기준점 세우기\n상승 시나리오: 하이닉스 ADR 이슈가 터지면 수익률이 몇 %까지 갔을 때 일부 수익을 확정할 것인가?\n하락 시나리오: 외국인 매도가 계속되어 수익률이 마이너스로 돌아선다면 어디서 멈출 것인가?\n\n2단계: '감정 예산' 책정하기\n수익이 5%를 넘었으니, 수익금의 10%는 무조건 인출해서 자신을 위해 사용하세요.\n\n3단계: 행동 강제 규칙\n감정적일 때 주식 앱을 켜기 전에 10분간 기다리는 규칙을 만드세요.\n\n월요일 전에 꼭 적어두세요: '외국인이 계속 매도해서 수익률이 0%가 되면, 보유 물량의 30%를 즉시 매도해서 현금화하겠다.'", time: t },
    ]);
    setExpandedMsgs(new Set());
    setShowHistory(false);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback((text?: string) => {
    const t = (text ?? queryText).trim();
    if (!t) return;
    const now = fmtTime();
    setMessages(prev => [...prev, { role: "user" as const, content: t, time: now }]);
    setQueryText("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant" as const, content: `"${t}"에 대한 답변을 준비 중입니다.`, time: fmtTime() }]);
    }, 500);
  }, [queryText]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    setMeasuredWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(() => setMeasuredWidth(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isExpanded]);

  useEffect(() => {
    if (initialQuestion && initialQuestion.trim() && initialQuestionId && initialQuestionId !== lastQuestionId.current) {
      lastQuestionId.current = initialQuestionId;
      handleSend(initialQuestion.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestionId]);

  const sectorEData = sectorIndices.map(s => ({
    ...s, data: useDeterministicSparkline(s.basePrice),
    color: s.positive ? posColor : negColor,
  }));
  const watchlistEData = watchlistStocks.map(s => ({
    ...s, data: useDeterministicSparkline(s.basePrice),
    color: s.positive ? posColor : negColor,
  }));
  const portfolioEData = useDeterministicSparkline(19653380);

  return isEmbedded ? (
    <div id="gf-right-panel" ref={panelRef} className="gf-rightpanel flex flex-col flex-1 min-h-0 bg-card">
      {isExpanded ? (
        <>
          <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-bold text-foreground">목록</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1">
              <Button variant="link" className="text-[14px] text-primary hover:underline flex items-center gap-1 p-0 h-auto"><Plus className="w-3.5 h-3.5" /> 새 목록</Button>
              <Button variant="ghost" size="icon" aria-label="새 목록"><Plus className="w-4 h-4 text-muted-foreground" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} aria-label="접기">
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scroll-hide px-5 py-4 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[20px] font-bold text-foreground">포트폴리오</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="border border-border rounded-lg p-4">
                <div className="text-[14px] text-muted-foreground mb-1">투자중</div>
                <div className="text-[22px] font-bold text-foreground mb-1">$19,653,380.00</div>
                <div className="flex items-center gap-1 text-[14px]" style={{ color: posColor }}>
                  <ArrowUpRight className="w-4 h-4" />+$453,120.00 (+2.36%)
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[20px] font-bold text-foreground">관심 목록</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-[12px] text-muted-foreground hover:bg-muted rounded p-1">ⓘ</Button>
                  <Button variant="ghost" size="icon" className="text-[12px] text-muted-foreground hover:bg-muted rounded p-1">✎</Button>
                  <Button variant="link" className="text-[12px] text-primary hover:underline flex items-center gap-0.5 p-0 h-auto"><Plus className="w-3 h-3" /> 종목 코드 추가</Button>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-[12px] text-muted-foreground">
                      <th className="text-left py-2.5 px-3 font-medium min-w-[100px]">종목 코드 <span className="text-[9px]">▲</span></th>
                      <th className="py-2.5 px-2 font-medium text-center min-w-[90px]">추세</th>
                      <th className="text-right py-2.5 px-2 font-medium min-w-[100px]">가격</th>
                      <th className="text-right py-2.5 px-2 font-medium min-w-[90px]">변동</th>
                      <th className="text-right py-2.5 px-2 font-medium min-w-[80px]">변동률</th>
                      {isWideTable && <th className="text-right py-2.5 px-2 font-medium min-w-[90px]">전일 종가</th>}
                      {isWideTable && <th className="text-right py-2.5 px-2 font-medium min-w-[80px]">시가</th>}
                      {isWideTable && <th className="text-right py-2.5 px-2 font-medium min-w-[80px]">고가</th>}
                      {isWideTable && <th className="text-right py-2.5 px-2 font-medium min-w-[80px]">저가</th>}
                      {isWideTable && <th className="text-right py-2.5 px-2 font-medium min-w-[80px]">거래량</th>}
                      <th className="text-right py-2.5 px-3 font-medium min-w-[100px]">시가총액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlistStocks.map((s, idx) => (
                      <tr key={s.name} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="text-[14px] font-semibold text-foreground">{s.name}</div>
                          <div className="text-[12px] text-muted-foreground">{s.fullName}</div>
                        </td>
                        <td className="py-2.5 px-2 text-center"><MiniChart data={watchlistEData[idx].data} color={watchlistEData[idx].color} /></td>
                        <td className="text-right py-2.5 px-2 tabular-nums text-foreground">{formatPrice(s.price)}</td>
                        <td className={`text-right py-2.5 px-2 tabular-nums flex items-center justify-end gap-0.5`} style={{ color: s.positive ? posColor : negColor }}>
                          {s.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {s.change}
                        </td>
                        <td className={`text-right py-2.5 px-2 tabular-nums`} style={{ color: s.positive ? posColor : negColor }}>{s.change}</td>
                        {isWideTable && <td className="text-right py-2.5 px-2 tabular-nums text-muted-foreground">{s.prevClose || "—"}</td>}
                        {isWideTable && <td className="text-right py-2.5 px-2 tabular-nums text-muted-foreground">{s.open || "—"}</td>}
                        {isWideTable && <td className="text-right py-2.5 px-2 tabular-nums text-muted-foreground">{s.high || "—"}</td>}
                        {isWideTable && <td className="text-right py-2.5 px-2 tabular-nums text-muted-foreground">{s.low || "—"}</td>}
                        {isWideTable && <td className="text-right py-2.5 px-2 tabular-nums text-muted-foreground">{s.volume || "—"}</td>}
                        <td className="text-right py-2.5 px-3 tabular-nums text-muted-foreground">{s.mktCap || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[20px] font-bold text-foreground">주식 업종</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-[12px] text-muted-foreground">
                      <th className="text-left py-2.5 px-3 font-medium min-w-[100px]">종목 코드 <span className="text-[9px]">▲</span></th>
                      <th className="py-2.5 px-2 font-medium text-center min-w-[90px]">추세</th>
                      <th className="text-right py-2.5 px-2 font-medium min-w-[100px]">가격</th>
                      <th className="text-right py-2.5 px-2 font-medium min-w-[90px]">변동</th>
                      <th className="text-right py-2.5 px-2 font-medium min-w-[80px]">변동률</th>
                      {isWideTable && <th className="text-right py-2.5 px-2 font-medium min-w-[90px]">전일 종가</th>}
                      {isWideTable && <th className="text-right py-2.5 px-2 font-medium min-w-[80px]">시가</th>}
                      {isWideTable && <th className="text-right py-2.5 px-2 font-medium min-w-[80px]">고가</th>}
                      {isWideTable && <th className="text-right py-2.5 px-2 font-medium min-w-[80px]">저가</th>}
                      {isWideTable && <th className="text-right py-2.5 px-2 font-medium min-w-[80px]">거래량</th>}
                      <th className="text-right py-2.5 px-3 font-medium min-w-[100px]">시가총액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectorIndices.map((s, idx) => (
                      <tr key={s.name} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="text-[14px] font-semibold text-foreground">{s.name}</div>
                          <div className="text-[12px] text-muted-foreground">{s.fullName}</div>
                        </td>
                        <td className="py-2.5 px-2 text-center"><MiniChart data={sectorEData[idx].data} color={sectorEData[idx].color} /></td>
                        <td className="text-right py-2.5 px-2 tabular-nums text-foreground">{formatPrice(s.price)}</td>
                        <td className="text-right py-2.5 px-2 tabular-nums" style={{ color: s.positive ? posColor : negColor }}>{s.changeVal}</td>
                        <td className="text-right py-2.5 px-2 tabular-nums" style={{ color: s.positive ? posColor : negColor }}>{s.change}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums text-muted-foreground">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <h2 id="gf-right-section-title" className="gf-rightpanel__section-title text-[20px] font-semibold text-foreground" role="heading" aria-label="조사">조사</h2>
            <div className="flex items-center gap-0.5">
              <button onClick={() => { setMessages([]); setExpandedMsgs(new Set()); setShowHistory(false); }} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="새 대화목록"><PenSquare className="w-4 h-4 text-muted-foreground" /></button>
              <button onClick={() => setShowHistory(!showHistory)} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="대화목록 기록"><ScrollText className="w-4 h-4 text-muted-foreground" /></button>
              {!embedded && (
                <>
                  <button onClick={() => setIsExpanded(false)} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="접기"><X className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => setIsExpanded(true)} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="펼치기"><Maximize2 className="w-4 h-4 text-muted-foreground" /></button>
                </>
              )}
            </div>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto scroll-hide px-4 py-4" style={messages.length > 0 ? { scrollbarWidth: 'auto' } : {}}>
          {showHistory ? (
            <div className="space-y-1">
              {[
                { label: "반도체 수급 대화", id: "semiconductor" },
                { label: "오늘 시장 현황은?", id: "market" },
                { label: "S&P 500 분석 요청", id: "sp500" },
                { label: "코스피 9000 전망", id: "kospi" },
                { label: "삼성전자 목표주가", id: "samsung" },
              ].map((h) => (
                <div key={h.id} onClick={() => { if (h.id === "semiconductor") loadSemiconductorChat(); else setShowHistory(false); }} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted cursor-pointer transition-colors group">
                  <span className="text-[14px] text-foreground">{h.label}</span>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <>
              <div id="gf-right-greeting" className="gf-rightpanel__greeting text-[14px] text-foreground mb-5 leading-relaxed"><span className="font-medium">JIHOON</span>님, 안녕하세요. 금융 관련 질문을 해 보세요.</div>
              <div className="space-y-2 mb-6">
                {["오늘 시장 현황이 어떤가요?", "왜 한국 KOSPI 지수가 9,000포인트를 돌파했나요?", "일본은행의 금리 인상이 Nikkei 225에 미치는 영향은 무엇인가요?"].map((q, i) => (
                  <div key={i} onClick={() => handleSend(q)} className="flex items-center justify-between pl-5 pr-4 py-3 rounded-xl border border-border hover:bg-muted cursor-pointer transition-colors">
                    <span className="text-[14px] text-foreground">{q}</span>
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[12px] font-medium text-muted-foreground mb-2">가능한 작업 알아보기</div>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-[14px] text-foreground"><Globe className="w-4 h-4 text-muted-foreground" /> Deep Search</Button>
                  <Button variant="ghost" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-[14px] text-foreground"><Search className="w-4 h-4 text-muted-foreground" /> 내 관심 목록 분석</Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <style>{`.chat-scrollbar::-webkit-scrollbar { width: 15px; } .chat-scrollbar::-webkit-scrollbar-track { background: transparent; } .chat-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; border: 3px solid transparent; background-clip: content-box; } .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #bdc1c6; background-clip: content-box; }`}</style>
              <div className="space-y-5">
                {messages.map((msg, i) => (
                  msg.role === "user" ? (
                    <div key={i} className="flex flex-col items-end w-full">
                      <div className="w-full bg-muted rounded-[20px] px-5 py-3">
                        <p className={`text-sm text-foreground leading-relaxed text-left tracking-tight ${expandedMsgs.has(i) ? "" : "line-clamp-2"}`}>{msg.content}</p>
                        {msg.content.length > 60 && (
                          <div className="flex justify-end mt-1">
                            <button onClick={() => toggleMsg(i)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" aria-label={expandedMsgs.has(i) ? "메시지 접기" : "메시지 펼치기"}>
                              <ChevronDown className={`w-4 h-4 transition-transform ${expandedMsgs.has(i) ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 mt-1 pr-2 select-none">{msg.time}</span>
                    </div>
                  ) : (
                    <div key={i} className="w-full">
                      <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
                    </div>
                  )
                ))}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
          </div>

          {!showHistory && !isEmbedded && (
            <div id="gf-right-input" className="gf-rightpanel__input border-t border-border px-4 py-3 flex-shrink-0">
              <div className="text-[11px] text-muted-foreground mb-2 text-center">AI 콘텐츠에는 오류가 있을 수 있습니다. <span className="text-primary underline cursor-pointer">자세히 알아보기</span></div>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Textarea value={queryText} onChange={e => setQueryText(e.target.value)} onKeyDown={handleKeyDown} placeholder="질문하기" rows={1} className="resize-none border border-border rounded-full px-4 py-2.5 text-[14px] outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary transition-colors placeholder-muted-foreground [&::-webkit-scrollbar]:hidden" />
                </div>
                <Button onClick={() => handleSend()} disabled={!queryText.trim()} size="icon" className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-40 transition-opacity"><ChevronUp className="w-5 h-5" /></Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    <aside id="gf-right-panel" ref={panelRef} className={`gf-rightpanel ${isExpanded ? "fixed top-[64px] bottom-0 z-[100] shadow-2xl" : "hidden min-[1040px]:flex flex-shrink-0 self-stretch h-full"} flex-col border-l border-border bg-card transition-all duration-300`}
        style={isExpanded ? { width: rightW ?? 235, right: wrapperMargin ?? 0 } : { width: collapsedWidth ?? 344 }}>
      <div className="flex flex-col flex-1 min-h-0">
        {/* Same shared header as the left-nav (목록): title + right buttons. */}
        <SectionHeader
          title="조사"
          className="flex-shrink-0 border-b border-border bg-card mx-6"
          rightButtons={[
            <Button key="new" variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setMessages([]); setExpandedMsgs(new Set()); setShowHistory(false); }} aria-label="새 대화목록"><PenSquare className="w-4 h-4 text-muted-foreground" /></Button>,
            <Button key="history" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowHistory(!showHistory)} aria-label="대화목록 기록"><ScrollText className="w-4 h-4 text-muted-foreground" /></Button>,
            ...(isExpanded
              ? [<Button key="collapse" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(false)} aria-label="접기"><X className="w-4 h-4 text-muted-foreground" /></Button>]
              : [
                  <Button key="close" variant="ghost" size="icon" className="h-6 w-6" onClick={() => onClose?.()} aria-label="닫기"><X className="w-4 h-4 text-muted-foreground" /></Button>,
                  <Button key="expand" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(true)} aria-label="펼치기"><Maximize2 className="w-4 h-4 text-muted-foreground" /></Button>,
                ]),
          ]}
        />

       {showHistory ? (
           <div className="flex-1 overflow-y-auto scroll-hide pl-6 pr-4 py-4">
            <div className="space-y-1">
              {[
                { label: "반도체 수급 대화", id: "semiconductor" },
                { label: "오늘 시장 현황은?", id: "market" },
                { label: "S&P 500 분석 요청", id: "sp500" },
                { label: "코스피 9000 전망", id: "kospi" },
                { label: "삼성전자 목표주가", id: "samsung" },
              ].map((h) => (
                <div key={h.id} onClick={() => { if (h.id === "semiconductor") loadSemiconductorChat(); else setShowHistory(false); }} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted cursor-pointer transition-colors group">
                  <span className="text-[14px] text-foreground">{h.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto scroll-hide pl-6 pr-4 py-5">
            <div id="gf-right-greeting" className="gf-rightpanel__greeting text-[14px] text-foreground mb-5 leading-relaxed"><span className="font-medium">JIHOON</span>님, 안녕하세요. 금융 관련 질문을 해 보세요.</div>
            <div className="space-y-2 mb-6">
              {["오늘 시장 현황이 어떤가요?", "왜 한국 KOSPI 지수가 9,000포인트를 돌파했나요?", "일본은행의 금리 인상이 Nikkei 225에 미치는 영향은 무엇인가요?"].map((q, i) => (
                <div key={i} onClick={() => handleSend(q)} className="flex items-center justify-between pl-5 pr-4 py-3 rounded-xl border border-border hover:bg-muted cursor-pointer transition-colors">
                  <span className="text-[14px] text-foreground">{q}</span>
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
            <div>
              <div className="text-[12px] font-medium text-muted-foreground mb-2">가능한 작업 알아보기</div>
              <div className="space-y-1">
                <Button variant="ghost" onClick={() => handleSend("포트폴리오 만들기")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-[14px] text-foreground justify-start"><Plus className="w-4 h-4 text-muted-foreground" /> 포트폴리오 만들기</Button>
                <Button variant="ghost" onClick={() => handleSend("Deep Search로 자세히 알아봐줘")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-[14px] text-foreground justify-start"><Globe className="w-4 h-4 text-muted-foreground" /> Deep Search</Button>
                <Button variant="ghost" onClick={() => handleSend("내 관심 목록을 분석해줘")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-[14px] text-foreground justify-start"><Search className="w-4 h-4 text-muted-foreground" /> 내 관심 목록 분석</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <style>{`.chat-scrollbar::-webkit-scrollbar { width: 15px; } .chat-scrollbar::-webkit-scrollbar-track { background: transparent; } .chat-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; border: 3px solid transparent; background-clip: content-box; } .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #bdc1c6; background-clip: content-box; }`}</style>
            <div ref={chatContainerRef} className="flex-1 pl-6 pr-4 py-4 overflow-y-auto chat-scrollbar" style={{ scrollbarWidth: 'auto' }}>
             <div className="space-y-5">
               {messages.map((msg, i) => (
                 msg.role === "user" ? (
                    <div key={i} className="flex flex-col items-end w-full">
                      <div className="w-full bg-muted rounded-[20px] px-5 py-3">
                        <p className={`text-sm text-foreground leading-relaxed text-left tracking-tight ${expandedMsgs.has(i) ? "" : "line-clamp-2"}`}>
                          {msg.content}
                        </p>
                        {msg.content.length > 60 && (
                          <div className="flex justify-end mt-1">
                            <button onClick={() => toggleMsg(i)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" aria-label={expandedMsgs.has(i) ? "메시지 접기" : "메시지 펼치기"}>
                              <ChevronDown className={`w-4 h-4 transition-transform ${expandedMsgs.has(i) ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 mt-1 pr-2 select-none">{msg.time}</span>
                    </div>
                 ) : (
                   <div key={i} className="w-full">
                     <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
                   </div>
                 )
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
           </div>
         )}

       <div id="gf-right-input" className="gf-rightpanel__input border-t border-border pl-6 pr-4 py-3 flex-shrink-0">
           <div className="bg-muted rounded-3xl pl-5 pr-4 pt-4 pb-2 focus-within:ring-1 focus-within:ring-ring/50 transition-shadow">
             <Textarea placeholder="질문하기" aria-label="질문하기" value={queryText} onChange={(e) => setQueryText(e.target.value)} onKeyDown={handleKeyDown} className="min-h-0 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground text-[14px]" style={{ fieldSizing: "fixed", overflow: "hidden", resize: "none" }} rows={4} />
             <div className="flex items-center justify-between mt-3">
               <div className="relative">
                 <Button variant="ghost" size="icon" aria-label="도구 추가" onClick={() => setToolsOpen(!toolsOpen)}><Plus className="w-4 h-4 text-muted-foreground" /></Button>
                 {toolsOpen && (
                   <div className="absolute bottom-full left-0 mb-2 w-52 bg-card border border-border rounded-xl shadow-lg z-50 p-1">
                     {[["파일 업로드", "upload_file"], ["포트폴리오 만들기", "bar_chart"], ["Deep Search", "travel_explore"]].map(([label]) => (
                       <button key={label} onClick={() => { setToolsOpen(false); if (label !== "파일 업로드") handleSend(label as string); }} className="w-full text-left px-3 py-2 text-[13px] text-foreground hover:bg-muted rounded-lg transition-colors">{label}</button>
                     ))}
                   </div>
                 )}
               </div>
               <Button size="icon" aria-label="AI에 질문하기" disabled={!queryText.trim()} onClick={() => { handleSend(); }} className={queryText.trim() ? "bg-foreground text-white hover:bg-foreground/80 hover:text-white" : ""}><span className="text-lg leading-none">↑</span></Button>
             </div>
           </div>
         </div>
       </div>
     </aside>
   );
}
