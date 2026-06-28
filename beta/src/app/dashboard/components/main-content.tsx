"use client";

import { useState, useEffect, useRef, useMemo, useId, useCallback, Fragment } from "react";
import {
  Search, Settings, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, Menu, PenSquare,
  Mic, Info, Edit3, Plus, Minus, Globe, Newspaper, Clock, X, Maximize2, Minimize2, ScrollText, ArrowLeft,
  Brain, TrendingUp, BarChart3, MessageSquare,
} from "lucide-react";
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
import { BREAKPOINTS } from "@/lib/breakpoints";
import { Chart, AreaSeries, LineSeries } from 'lightweight-charts-react-components';
import { ColorType } from 'lightweight-charts';
import { SectionHeader, SimpleStockNav, ListNavigation } from "./navigation-list";

// ─── Sparkline Utilities ────────────────────────────────────────────────────


function generateSparklineData(
  basePrice: number,
  points: number = 24,
  volatility: number = 0.02,
  seedOffset: number = 0
): number[] {
  const data: number[] = [];
  let price = basePrice;
  for (let i = points; i >= 0; i--) {
    const step = (i + seedOffset * 100) * 7919;
    const wiggle = ((step % 1000) - 500) / 500;
    price = price * (1 + wiggle * volatility);
    data.push(Math.round(price * 100) / 100);
  }
  return data;
}

export function formatPrice(price: string): string {
  return price.replace(/(₩[\d,]+)\.00$/, '$1');
}

function useDeterministicSparkline(basePrice: number) {
  return useMemo(() => generateSparklineData(basePrice, 24, 0.02, basePrice), [basePrice]);
}

export function MiniChart({ data, color, prevClose, fillWidth, small }: { data: number[]; color: string; prevClose?: number; fillWidth?: boolean; small?: boolean }) {
  const w = fillWidth ? 200 : small ? 55 : 96, h = fillWidth ? 56 : small ? 24 : 36, pad = 3;
  const gradientId = useId();
  if (!data || data.length < 2) return <svg width={w} height={h} className="flex-shrink-0" />;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return { x, y };
  });
  const prevY = prevClose !== undefined ? h - pad - ((prevClose - min) / range) * (h - pad * 2) : null;
  const linePath = `M${pts.map(p => `${p.x},${p.y}`).join(" L")}`;
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;
  const gradient = (
    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity="0.85" />
      <stop offset="100%" stopColor={color} stopOpacity="0.45" />
    </linearGradient>
  );
  return (
    <svg width={fillWidth ? "100%" : w} height={h} viewBox={fillWidth ? `0 0 ${w} ${h}` : undefined} className={`${fillWidth ? "overflow-visible block" : "flex-shrink-0 overflow-visible"}`}>
      <defs>
        {gradient}
      </defs>
      {prevY !== null && (
        <line x1={pad} y1={prevY} x2={w - pad} y2={prevY} stroke={color} strokeWidth={1} strokeDasharray="3,3" opacity={0.5} />
      )}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function getSparklineColor(isPositive: boolean): string {
  return isPositive ? "#0E9E4B" : "#FF4B4B";
}

// ─── Data Arrays ────────────────────────────────────────────────────────────

export const regionIndices: Record<
  string,
  {
    name: string;
    value: string;
    change: string;
    isPositive: boolean;
    basePrice: number;
  }[]
> = {
  미국: [
    { name: "다우 존스 산업평균지수", value: "51,564.70", change: "+0.14%", isPositive: true, basePrice: 51564 },
    { name: "S&P 500", value: "7,500.58", change: "+1.08%", isPositive: true, basePrice: 7500 },
    { name: "나스닥 종합주가지수", value: "26,517.93", change: "+1.91%", isPositive: true, basePrice: 26517 },
    { name: "러셀 2000 지수", value: "2,979.77", change: "+2.12%", isPositive: true, basePrice: 2979 },
    { name: "뉴욕주식시장 변동성지수", value: "16.78", change: "-9.00%", isPositive: false, basePrice: 16 },
  ],
  유럽: [
    { name: "DAX", value: "24,985.82", change: "-0.16%", isPositive: false, basePrice: 24985 },
    { name: "FTSE 100 지수", value: "10,363.27", change: "-0.35%", isPositive: false, basePrice: 10363 },
    { name: "CAC 40", value: "8,421.14", change: "-0.55%", isPositive: false, basePrice: 8421 },
    { name: "IBEX 35", value: "19,347.40", change: "-0.29%", isPositive: false, basePrice: 19347 },
    { name: "유로 스톡스50", value: "6,293.13", change: "-0.48%", isPositive: false, basePrice: 6293 },
  ],
  아시아: [
    { name: "닛케이 평균주가", value: "71,250.06", change: "+0.28%", isPositive: true, basePrice: 71250 },
    { name: "상해종합주가지수", value: "4,090.48", change: "-0.43%", isPositive: false, basePrice: 4090 },
    { name: "항셍지수", value: "23,924.81", change: "-1.59%", isPositive: false, basePrice: 23924 },
    { name: "BSE 센섹스", value: "76,802.90", change: "-0.78%", isPositive: false, basePrice: 76802 },
    { name: "니프티50", value: "24,013.10", change: "-0.64%", isPositive: false, basePrice: 24013 },
  ],
  중남미: [
    { name: "S&P Latin America 40", value: "3,483.82", change: "-0.86%", isPositive: false, basePrice: 3483 },
  ],
  통화: [
    { name: "USD/KRW", value: "1,328.50", change: "-0.08%", isPositive: false, basePrice: 1328 },
    { name: "EUR/KRW", value: "1,456.30", change: "+0.12%", isPositive: true, basePrice: 1456 },
    { name: "JPY/KRW", value: "9.12", change: "+0.34%", isPositive: true, basePrice: 9 },
  ],
  암호화폐: [
    { name: "비트코인", value: "112,345.67", change: "+2.34%", isPositive: true, basePrice: 112345 },
    { name: "이더리움", value: "3,890.12", change: "+1.56%", isPositive: true, basePrice: 3890 },
  ],
  선물: [
    { name: "나스닥 선물", value: "26,542.25", change: "+0.12%", isPositive: true, basePrice: 26542 },
    { name: "S&P 500 선물", value: "7,512.75", change: "+0.18%", isPositive: true, basePrice: 7512 },
    { name: "원유(WTI)", value: "68.45", change: "-1.23%", isPositive: false, basePrice: 68 },
    { name: "금 선물", value: "3,312.50", change: "+0.45%", isPositive: true, basePrice: 3312 },
  ],
};

const regionTabs = ["미국", "유럽", "아시아", "중남미", "통화", "암호화폐", "선물"];

export const marketSummaries: {
  id: string;
  title: string;
  content: string;
  sites: number;
}[] = [
  {
    id: "asia1",
    title: "닛케이지수, 역사적 고점 기록하며 지리적 리스크 완화",
    content:
      "닛케이지수가 71,000선을 돌파하며 사상 최고치를 기록했다. 중국 경제 회복세 둔화와 일본 은행의 금리 인상 기조 전환 속에서도 일본 증시는 견조한 상승세를 보이고 있다. 외국인 투자자들의 일본 주식 매수세가 지속되고 있으며, 반도체 및 기술주 중심의 랠리가 시장을 이끌고 있다.",
    sites: 2,
  },
  {
    id: "asia2",
    title: "일본은행, 금리인상 기조 전환으로 인플레이션 대응 본격화",
    content:
      "일본은행이 기준금리 인상을 단행하며 인플레이션 대응에 나섰다. 장기 저금리 기조에서 벗어나는 전환점으로 평가받으며, 일본 채시장과 외환시장에 영향을 미치고 있다. 엔화 가치 상승이 수출 기업들에 부담으로 작용할지 주목된다.",
    sites: 3,
  },
  {
    id: "asia3",
    title: "중국 경제 회복세 불균형, 증시 불안정 지속",
    content:
      "중국의 경제 회복이 불균형하게 진행되면서 증시 변동성이 이어지고 있다. 부동산 시장 부진과 내수 소비 부진이 지속되는 가운데, 정부 stimulations 기대감이 제한적으로 작용하고 있다. 기술주 중심의 약진과 전통 산업의 부진이 공존하는 양상이다.",
    sites: 2,
  },
  {
    id: "asia4",
    title: "동남아 통화, 공격적 금리 조치에도 압력",
    content:
      "동남아시아 주요국 통화가 추가 금리 인상 조치에도 불구하고 달러 대비 압력을 받고 있다. 미국 금리 정책 불확실성과 무역 불확실성이 주요 요인으로 작용하고 있다. 인도, 인도네시아, 태국 등 지역 중앙은행들의 대응이 주목된다.",
    sites: 2,
  },
];

export const newsItems: {
  id: number;
  title: string;
  source: string;
  time: string;
  icon: string;
}[] = [
  {
    id: 1,
    title: "굳건한 '삼전닉스' 꽃길...삼성·SK하이닉스 견인",
    source: "문화일보",
    time: "4분 전",
    icon: "Newspaper",
  },
  {
    id: 2,
    title: "'코스피 9000' 기쁨보다는 불안감 우세…외국인 순매수 전환",
    source: "네이버",
    time: "28분 전",
    icon: "Globe",
  },
  {
    id: 3,
    title: "삼성전자, 차세대 메모리반도체 양산 확대 계획 발표",
    source: "연합뉴스",
    time: "1시간 전",
    icon: "Newspaper",
  },
  {
    id: 4,
    title: "SK하이닉스, AI 반도체 수주 물량 2분기부터 본격 납품",
    source: "한국경제",
    time: "2시간 전",
    icon: "Newspaper",
  },
  {
    id: 5,
    title: "외국인, 코스피 시장 순매수 전환…3일 연속 매수",
    source: "서울경제",
    time: "3시간 전",
    icon: "Globe",
  },
  {
    id: 6,
    title: "현대차그룹, 전기차 전용 플랫폼 E-GMP 2세대 출시 예정",
    source: "매일경제",
    time: "4시간 전",
    icon: "Newspaper",
  },
  {
    id: 7,
    title: "나스닥, 연방준의회 이사회 결과에 급등…AI주 중심 강세",
    source: "Daum 금융",
    time: "5시간 전",
    icon: "Newspaper",
  },
  {
    id: 8,
    title: "LG에너지솔루션, 북미 배터리 공장 증설 계획 발표",
    source: "조선일보",
    time: "6시간 전",
    icon: "Newspaper",
  },
];

export const mostActiveStocks: {
  rank: number;
  name: string;
  ticker: string;
  price: string;
  change: string;
  isPositive: boolean;
  basePrice: number;
  volume: string;
}[] = [
  {
    rank: 1,
    name: "JW신약",
    ticker: "(067290)",
    price: "₩2,335",
    change: "+13.08%",
    isPositive: true,
    basePrice: 2335,
    volume: "82.3M",
  },
  {
    rank: 2,
    name: "GW바이오텍",
    ticker: "(036180)",
    price: "₩2",
    change: "-60.00%",
    isPositive: false,
    basePrice: 2,
    volume: "71.8M",
  },
  {
    rank: 3,
    name: "삼성전자",
    ticker: "(005930)",
    price: "₩354,000",
    change: "-2.34%",
    isPositive: false,
    basePrice: 354000,
    volume: "65.2M",
  },
  {
    rank: 4,
    name: "우리로",
    ticker: "(046970)",
    price: "₩7,350",
    change: "-9.82%",
    isPositive: false,
    basePrice: 7350,
    volume: "42.1M",
  },
];

export const gainers: {
  rank: number;
  name: string;
  ticker: string;
  price: string;
  change: string;
  isPositive: boolean;
  basePrice: number;
}[] = [
  {
    rank: 1,
    name: "삼익제약",
    ticker: "(014950)",
    price: "₩8,410",
    change: "+29.98%",
    isPositive: true,
    basePrice: 8410,
  },
  {
    rank: 2,
    name: "한울반도체",
    ticker: "(320000)",
    price: "₩17,820",
    change: "+29.98%",
    isPositive: true,
    basePrice: 17820,
  },
  {
    rank: 3,
    name: "다스코",
    ticker: "(058730)",
    price: "₩3,470",
    change: "+29.96%",
    isPositive: true,
    basePrice: 3470,
  },
  {
    rank: 4,
    name: "시지메드텍",
    ticker: "(056090)",
    price: "₩1,618",
    change: "+29.96%",
    isPositive: true,
    basePrice: 1618,
  },
];

export const losers: {
  rank: number;
  name: string;
  ticker: string;
  price: string;
  change: string;
  isPositive: boolean;
  basePrice: number;
}[] = [
  {
    rank: 1,
    name: "에이디칩스",
    ticker: "(054630)",
    price: "₩15",
    change: "-84.04%",
    isPositive: false,
    basePrice: 15,
  },
  {
    rank: 2,
    name: "국보",
    ticker: "(001140)",
    price: "₩14",
    change: "-83.53%",
    isPositive: false,
    basePrice: 14,
  },
  {
    rank: 3,
    name: "선샤인푸드케어",
    ticker: "(217620)",
    price: "₩5",
    change: "-78.26%",
    isPositive: false,
    basePrice: 5,
  },
  {
    rank: 4,
    name: "푸른소나무",
    ticker: "(057880)",
    price: "₩6",
    change: "-68.42%",
    isPositive: false,
    basePrice: 6,
  },
];

interface SectorData { name: string; fullName: string; price: string; changeVal: string; change: string; positive: boolean; basePrice: number; prevClose: string; open: string; high: string; low: string; volume: string; mktCap: string; }
export const sectorIndices: SectorData[] = [
  { name: "SIXB", fullName: "Materials", price: "1,097.08", changeVal: "-5.00", change: "-0.45%", positive: false, basePrice: 1097, prevClose: "1,102.08", open: "1,100.50", high: "1,103.20", low: "1,095.40", volume: "—", mktCap: "—" },
  { name: "SIXC", fullName: "Communications", price: "571.79", changeVal: "+1.54", change: "+0.27%", positive: true, basePrice: 571, prevClose: "570.25", open: "570.80", high: "573.10", low: "569.90", volume: "—", mktCap: "—" },
  { name: "SIXE", fullName: "Energy", price: "1,124.31", changeVal: "-19.31", change: "-1.69%", positive: false, basePrice: 1124, prevClose: "1,143.62", open: "1,140.00", high: "1,142.50", low: "1,120.80", volume: "—", mktCap: "—" },
  { name: "SIXI", fullName: "Industrials", price: "1,820.63", changeVal: "+13.01", change: "+0.72%", positive: true, basePrice: 1820, prevClose: "1,807.62", open: "1,809.00", high: "1,825.40", low: "1,806.30", volume: "—", mktCap: "—" },
  { name: "SIXM", fullName: "Financials", price: "658.84", changeVal: "-6.05", change: "-0.91%", positive: false, basePrice: 658, prevClose: "664.89", open: "663.50", high: "665.20", low: "657.10", volume: "—", mktCap: "—" },
  { name: "SIXR", fullName: "Staples", price: "837.82", changeVal: "-4.13", change: "-0.49%", positive: false, basePrice: 837, prevClose: "841.95", open: "841.00", high: "842.30", low: "836.50", volume: "—", mktCap: "—" },
  { name: "SIXRE", fullName: "Real estate", price: "214.08", changeVal: "-0.62", change: "-0.29%", positive: false, basePrice: 214, prevClose: "214.70", open: "214.50", high: "215.10", low: "213.60", volume: "—", mktCap: "—" },
  { name: "SIXT", fullName: "Technology", price: "3,853.63", changeVal: "+115.23", change: "+3.08%", positive: true, basePrice: 3853, prevClose: "3,738.40", open: "3,745.00", high: "3,860.20", low: "3,740.10", volume: "—", mktCap: "—" },
  { name: "SIXU", fullName: "Utilities", price: "901.60", changeVal: "+5.91", change: "+0.66%", positive: true, basePrice: 901, prevClose: "895.69", open: "896.50", high: "903.40", low: "895.20", volume: "—", mktCap: "—" },
  { name: "SIXV", fullName: "Health care", price: "1,505.60", changeVal: "-12.91", change: "-0.85%", positive: false, basePrice: 1505, prevClose: "1,518.51", open: "1,516.00", high: "1,519.30", low: "1,503.20", volume: "—", mktCap: "—" },
  { name: "SIXY", fullName: "Discretionary", price: "2,365.50", changeVal: "+35.24", change: "+1.51%", positive: true, basePrice: 2365, prevClose: "2,330.26", open: "2,335.00", high: "2,370.80", low: "2,332.40", volume: "—", mktCap: "—" },
];

export const watchlistStocks: {
  name: string; fullName: string; price: string; change: string; positive: boolean; basePrice: number;
  prevClose?: string; open?: string; high?: string; low?: string; volume?: string; mktCap?: string;
}[] = [
  { name: "329180", fullName: "HD현대중공업", price: "₩667,000.00", change: "-2.49%", positive: false, basePrice: 667000, prevClose: "₩684,000", open: "₩680,000", high: "₩685,000", low: "₩665,000", volume: "12.4만", mktCap: "70.01조" },
  { name: "005930", fullName: "삼성전자", price: "₩354,000.00", change: "-2.34%", positive: false, basePrice: 354000, prevClose: "₩362,500", open: "₩360,000", high: "₩361,000", low: "₩352,000", volume: "1,823만", mktCap: "427조" },
  { name: "000660", fullName: "SK하이닉스", price: "₩2,764,000.00", change: "+2.94%", positive: true, basePrice: 2764000, prevClose: "₩2,685,000", open: "₩2,690,000", high: "₩2,800,000", low: "₩2,688,000", volume: "892만", mktCap: "138조" },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function MarketIndexCard({
  index,
}: {
  index: { name: string; value: string; change: string; isPositive: boolean; basePrice: number };
}) {
  const sparklineData = useDeterministicSparkline(index.basePrice);
  const color = getSparklineColor(index.isPositive);

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="ghost" size="sm" className="w-full h-auto p-0 bg-transparent hover:bg-transparent focus-visible:ring-0 flex-shrink-0 text-left">
            <div className="flex items-start gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-muted-foreground truncate">{index.name}</p>
              <p className="text-[14px] text-foreground font-medium mt-0.5">{index.value}</p>
              <div className="flex items-center gap-0.5 mt-0.5">
                {index.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 text-[#0E9E4B]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-[#FF4B4B]" />
                )}
                <span
                  className={`text-[11px] font-medium ${
                    index.isPositive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"
                  }`}
                >
                  {index.change}
                </span>
              </div>
            </div>
            <MiniChart data={sparklineData} color={color} />
     </div>
    </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {index.name}: {index.value} ({index.change})
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
}

export function IndexCard({
  item, vp,
}: {
  item: { name: string; value: string; change: string; isPositive: boolean; basePrice: number };
  vp: number;
}) {
  const sp = useDeterministicSparkline(item.basePrice);
  const numVal = parseFloat(item.value.replace(/,/g, ''));
  const pct = parseFloat(item.change.replace('%', ''));
  const absChange = numVal * Math.abs(pct) / 100;
  const absStr = absChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const color = item.isPositive ? "#0E9E4B" : "#FF4B4B";
  return (
    <Card className="px-3 py-3 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden border-border/40">
      <CardContent className="p-0">
        <div className="text-[14px] font-semibold text-foreground truncate mb-1">{item.name}</div>
        <div className="text-[12px] text-muted-foreground tabular-nums">{item.value}</div>
        {vp >= BREAKPOINTS.MOBILE && <div className="text-[12px] text-muted-foreground">({item.isPositive ? "+" : "-"}${absStr})</div>}
        <div className="flex items-center gap-0.5 mt-1.5">
          <span className={`text-[14px] font-medium ${item.isPositive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>{item.change}</span>
          {item.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 text-[#0E9E4B]" /> : <ArrowDownRight className="w-3.5 h-3.5 text-[#FF4B4B]" />}
        </div>
        <div className={cn("-mx-3 -mb-3", vp < BREAKPOINTS.MOBILE ? "mt-0.5" : "mt-2")}>
          <MiniChart data={sp} color={color} prevClose={sp[0]} fillWidth />
        </div>
      </CardContent>
    </Card>
  );
}

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
    <TableRow className="hover:bg-muted/50 cursor-pointer transition-colors">
      <TableCell className="py-1.5 px-2">
        <div className="min-w-0 flex-1">
          <Badge variant="secondary" className="mr-1 font-mono text-[10px]">{stock.ticker}</Badge>
          <span className="text-[14px] text-foreground truncate">{stock.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-right py-1.5 px-2 tabular-nums text-foreground whitespace-nowrap">
        {stock.price}
      </TableCell>
      <TableCell className="text-right py-1.5 px-2 whitespace-nowrap">
        <div className={cn("flex items-center gap-0.5 justify-end", stock.isPositive ? "text-[#0E9E4B]" : "text-[#FF4B4B]")}>
          <span className="text-[11px] font-medium">{stock.change}</span>
          {stock.isPositive ? <ArrowUpRight className="w-3 h-3 text-[#0E9E4B]" /> : <ArrowDownRight className="w-3 h-3 text-[#FF4B4B]" />}
        </div>
      </TableCell>
      {showVolume && (
        <TableCell className="text-right py-1.5 px-2 tabular-nums text-muted-foreground whitespace-nowrap">
          {volume ?? stock.volume ?? '—'}
        </TableCell>
      )}
    </TableRow>
  );
}

export function MarketSummaryCard({ summary }: { summary: { id: string; title: string; content: string; sites: number } }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="py-2 border-b border-border last:border-b-0">
        <CollapsibleTrigger>
           <div className="flex w-full justify-between px-0 py-0 h-auto bg-transparent hover:bg-transparent text-left inline-flex items-center gap-2 rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:outline-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 [&_button:hover]:bg-muted/50">
             <div className="flex items-center gap-2 min-w-0 flex-1">
               <span className="text-[14px] text-foreground truncate">{summary.title}</span>
             </div>
             <div className="flex items-center gap-2 flex-shrink-0 ml-2">
               <Badge variant="outline" className="text-[10px]">{summary.sites} sites</Badge>
               {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
             </div>
           </div>
         </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 pb-2">
          <p className="text-[14px] text-muted-foreground leading-relaxed">{summary.content}</p>
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

export function NewsItem({ item }: { item: { id: number; title: string; source: string; time: string; icon: string } }) {
  const Icon = item.icon === "Newspaper" ? Newspaper : Globe;
  return (
    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-border/60 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 rounded-lg flex-shrink-0 bg-muted">
            <AvatarFallback><Icon className="w-5 h-5 text-muted-foreground" /></AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="secondary" className="text-[10px]">{item.source}</Badge>
              <span className="text-[11px] text-muted-foreground">·</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{item.time}</span>
              </div>
            </div>
            <p className="text-[14px] text-foreground leading-snug line-clamp-2 font-medium">{item.title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Types & Spec Map ────────────────────────────────────────────────────────

type PeriodFilter = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | '최대';

interface ChartRenderSpec {
  xAxis: { tickFormat: string; gridIntervalMonth: number; allowGaps: boolean };
  yAxis: { minPercent: number; maxPercent: number; enableZeroAnchor: boolean };
}

interface ComparisonAsset {
  id: string;
  label: string;
  color: string;
  markerType: 'square' | 'circle' | 'cross';
}

const periodSpecMap: Record<PeriodFilter, ChartRenderSpec> = {
  '1D': { xAxis: { tickFormat: 'M월 D일', gridIntervalMonth: 0, allowGaps: false }, yAxis: { minPercent: -5, maxPercent: 5, enableZeroAnchor: false } },
  '5D': { xAxis: { tickFormat: 'M월 D일', gridIntervalMonth: 0, allowGaps: true }, yAxis: { minPercent: -10, maxPercent: 40, enableZeroAnchor: false } },
  '1M': { xAxis: { tickFormat: 'M월 D일', gridIntervalMonth: 0, allowGaps: false }, yAxis: { minPercent: -10, maxPercent: 50, enableZeroAnchor: false } },
  '6M': { xAxis: { tickFormat: 'M월 D일', gridIntervalMonth: 1, allowGaps: false }, yAxis: { minPercent: -10, maxPercent: 100, enableZeroAnchor: false } },
  'YTD': { xAxis: { tickFormat: 'YYYY년 M월', gridIntervalMonth: 1, allowGaps: false }, yAxis: { minPercent: 0, maxPercent: 200, enableZeroAnchor: true } },
  '1Y': { xAxis: { tickFormat: 'YYYY년 M월', gridIntervalMonth: 3, allowGaps: false }, yAxis: { minPercent: 0, maxPercent: 600, enableZeroAnchor: true } },
  '5Y': { xAxis: { tickFormat: 'YYYY년', gridIntervalMonth: 12, allowGaps: false }, yAxis: { minPercent: -500, maxPercent: 3000, enableZeroAnchor: true } },
  '최대': { xAxis: { tickFormat: 'YYYY년', gridIntervalMonth: 60, allowGaps: false }, yAxis: { minPercent: -1000, maxPercent: 4000, enableZeroAnchor: true } },
};

function getComparisonSparkline(ticker: string): number[] {
  const seed = ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return generateSparklineData(100 + seed, 100, 0.03, seed);
}

function PortfolioChart({
  mainAsset,
  compareAssets,
  period,
  allAssetData,
  chartType,
  onChartReady,
  seriesRef,
}: {
  mainAsset: { data: number[]; color: string; label: string };
  compareAssets: ComparisonAsset[];
  period: PeriodFilter;
  allAssetData: Record<string, number[]>;
  chartType: 'linear' | 'area';
  onChartReady?: (chart: any) => void;
  seriesRef?: React.MutableRefObject<any>;
}) {
  const spec = periodSpecMap[period];
  const isZeroAnchor = spec.yAxis.enableZeroAnchor;
  const interval = period === '1D' ? 300 : period === '5D' ? 900 : period === '1M' ? 3600 : 86400;
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChartReadyRef = useRef(onChartReady);
  onChartReadyRef.current = onChartReady;
  const containerWidthRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      containerWidthRef.current = w;
      if (chartRef.current && w > 0) chartRef.current.resize(w, 192);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleInit = useCallback((chart: any) => {
    chartRef.current = chart;
    onChartReadyRef.current?.(chart);
    if (containerWidthRef.current > 0) chart.resize(containerWidthRef.current, 192);
  }, []);

  const chartData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return mainAsset.data.map((value, i) => {
      const ts = now - (mainAsset.data.length - 1 - i) * interval;
      if (!isZeroAnchor) return { time: ts as any, value };
      const start = mainAsset.data[0] ?? 1;
      return { time: ts as any, value: ((value - start) / start) * 100 };
    });
  }, [mainAsset.data, interval, isZeroAnchor]);

  const compareSeries = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return compareAssets.map(asset => {
      const data = allAssetData[asset.id] || [];
      const seriesData = data.map((value, i) => {
        const ts = now - (data.length - 1 - i) * interval;
        if (!isZeroAnchor) return { time: ts as any, value };
        const start = data[0] ?? 1;
        return { time: ts as any, value: ((value - start) / start) * 100 };
      });
      return { ...asset, seriesData };
    });
  }, [compareAssets, allAssetData, interval, isZeroAnchor]);

  const commonOptions = useMemo(() => ({
    layout: { background: { type: ColorType.Solid, color: 'transparent' } as any, textColor: 'hsl(var(--muted-foreground))' },
    height: 192,
    timeScale: { visible: false } as any,
    rightPriceScale: { visible: true, scaleMargins: { top: 0.1, bottom: 0.05 }, mode: 2 as any, borderColor: 'var(--border)' },
    grid: { vertLines: { visible: false }, horzLines: { visible: false } },
    crosshair: { mode: 0 },
    handleScroll: false,
    handleScale: false,
  }), []);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
    <Chart options={commonOptions} containerProps={{ style: { width: '100%' } }} onInit={handleInit}>
      {chartType === 'area' ? (
        <AreaSeries ref={seriesRef as any} data={chartData} options={{ topColor: `${mainAsset.color}61`, bottomColor: `${mainAsset.color}00`, lineColor: mainAsset.color, lineWidth: 2 }} />
      ) : (
        <LineSeries ref={seriesRef as any} data={chartData} options={{ color: mainAsset.color, lineWidth: 2 }} />
      )}
      {compareSeries.map(asset => (
        <LineSeries key={asset.id} data={asset.seriesData} options={{ color: asset.color, lineWidth: 2, lineStyle: 2 as any, crosshairMarkerRadius: 4, crosshairMarkerBackgroundColor: asset.color }} />
      ))}
    </Chart>
    </div>
  );
}

export const SHAPE_TYPES = ['circle', 'triangle', 'square', 'pentagon', 'star'] as const;
export type ShapeType = typeof SHAPE_TYPES[number];

export type ShapeRenderer = (color: string, size: number) => React.ReactElement;

export const SHAPE_SVG: Record<ShapeType, ShapeRenderer> = {
  circle: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="5" fill={color} />
    </svg>
  ),
  triangle: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <polygon points="6,0.5 11.5,10 0.5,10" fill={color} />
    </svg>
  ),
  square: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <rect x="1" y="1" width="10" height="10" rx="1.5" fill={color} />
    </svg>
  ),
  pentagon: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <polygon points="6,0.5 11.3,4.5 9.1,11.3 2.9,11.3 0.7,4.5" fill={color} />
    </svg>
  ),
  star: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <polygon points="6,0.5 7.3,4.5 11.5,4.5 8.1,7.3 9.3,11.5 6,9 2.7,11.5 3.9,7.3 0.5,4.5 4.7,4.5" fill={color} />
    </svg>
  ),
};

function AssetSymbol({ shape, color, size = 10 }: { shape: ShapeType; color: string; size?: number }) {
  return SHAPE_SVG[shape](color, size);
}

function getAssetShape(assetId: string): ShapeType {
  let hash = 0;
  for (let i = 0; i < assetId.length; i++) {
    hash = ((hash << 5) - hash) + assetId.charCodeAt(i);
  }
  return SHAPE_TYPES[Math.abs(hash) % SHAPE_TYPES.length];
}

export function MobilePortfolioDetail({ onBack, vp, rightW, footerQuestion, footerQuestionId, onFooterQuestionConsumed }: { onBack: () => void; vp: number; rightW: number; footerQuestion?: string; footerQuestionId?: number; onFooterQuestionConsumed?: () => void }) {
  const [activeTab, setActiveTab] = useState<"portfolio" | "research">("portfolio");
  const [period, setPeriod] = useState<PeriodFilter>('1D');
  const [compareAssets, setCompareAssets] = useState<ComparisonAsset[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [chartType, setChartType] = useState<'linear' | 'area'>('area');
  const [styleOpen, setStyleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSection, setOpenSection] = useState<'lines' | 'shapes' | 'drawing' | 'analysis' | null>('lines');
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [bottomTab, setBottomTab] = useState("구성");
  const [expandedTickers, setExpandedTickers] = useState<Record<string, boolean>>({});
  const [sortOption, setSortOption] = useState("name");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [txSortAsc, setTxSortAsc] = useState<Record<string, boolean>>({});
  const [filteredSources, setFilteredSources] = useState<string[]>([]);
  const [showViz, setShowViz] = useState(false);
  const [tradeModal, setTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeTicker, setTradeTicker] = useState("");
  const [tradeQty, setTradeQty] = useState(0);
  const [tradePrice, setTradePrice] = useState(0);
  const [tradeTickerLocked, setTradeTickerLocked] = useState(false);
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split('T')[0]);
  const [sellModal, setSellModal] = useState(false);
  const [sellTarget, setSellTarget] = useState<{ ticker: string; txId: string; maxQty: number; price: number } | null>(null);
  const [sellQty, setSellQty] = useState(0);
  const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);

  const [portfolioAssets, setPortfolioAssets] = useState([
    { ticker: "329180", name: "HD현대중공업", badgeBg: "bg-foreground", price: 667000, qty: 10, dailyProfit: -16675, dailyProfitPercent: -2.49, positive: false, totalAmount: 6670000, transactions: [{ id: "tx1", date: "26. 6. 10.", type: "매수", buyPrice: 683500, qty: 10, profit: -16500, profitPercent: -2.41, positive: false, total: 6670000 }] },
    { ticker: "005930", name: "삼성전자", badgeBg: "bg-primary", price: 354000, qty: 5, dailyProfit: -8284, dailyProfitPercent: -2.34, positive: false, totalAmount: 1770000, transactions: [{ id: "tx2", date: "26. 6. 12.", type: "매수", buyPrice: 362500, qty: 5, profit: -4250, profitPercent: -2.34, positive: false, total: 1770000 }] },
    { ticker: "000660", name: "SK하이닉스", badgeBg: "bg-orange-500", price: 2764000, qty: 3, dailyProfit: 81216, dailyProfitPercent: 2.94, positive: true, totalAmount: 8292000, transactions: [
      { id: "tx3a", date: "26. 6. 1.", type: "매수", buyPrice: 2685000, qty: 2, profit: 15800, profitPercent: 2.94, positive: true, total: 5528000 },
      { id: "tx3b", date: "26. 6. 8.", type: "매수", buyPrice: 2710000, qty: 1, profit: 5400, profitPercent: 1.99, positive: true, total: 2764000 },
    ]},
    { ticker: "006800", name: "미래에셋증권", badgeBg: "bg-green-700", price: 48750, qty: 20, dailyProfit: -1877, dailyProfitPercent: -3.85, positive: false, totalAmount: 975000, transactions: [{ id: "tx4", date: "26. 6. 5.", type: "매수", buyPrice: 50700, qty: 20, profit: -390, profitPercent: -3.85, positive: false, total: 975000 }] },
    { ticker: "009150", name: "삼성전기", badgeBg: "bg-purple-800", price: 2270000, qty: 1, dailyProfit: 72186, dailyProfitPercent: 3.18, positive: true, totalAmount: 2270000, transactions: [{ id: "tx5", date: "26. 6. 3.", type: "매수", buyPrice: 2200000, qty: 1, profit: 70000, profitPercent: 3.18, positive: true, total: 2270000 }] },
  ]);

  const handleDeleteAsset = (ticker: string, name: string) => {
    if (window.confirm(`[${name}] 종목을 포트폴리오에서 삭제하시겠습니까?`)) {
      setPortfolioAssets(prev => prev.filter(a => a.ticker !== ticker));
      setExpandedTickers(prev => { const n = {...prev}; delete n[ticker]; return n; });
    }
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tradeQty <= 0 || tradePrice <= 0) { alert('올바른 수량과 단가를 입력해주세요.'); return; }
    const dateObj = new Date(tradeDate);
    const formattedDate = `${String(dateObj.getFullYear()).slice(2)}. ${dateObj.getMonth() + 1}. ${dateObj.getDate()}.`;
    
    setPortfolioAssets(prev => prev.map(a => {
      if (a.ticker !== tradeTicker) return a;
      
      if (tradeType === 'buy') {
        const newTx = { id: `tx_${Date.now()}`, date: formattedDate, type: '매수' as const, buyPrice: tradePrice, qty: tradeQty, profit: 0, profitPercent: 0, positive: true, total: tradePrice * tradeQty };
        return { ...a, qty: a.qty + tradeQty, totalAmount: (a.qty + tradeQty) * a.price, transactions: [newTx, ...a.transactions] };
      } else {
        // FIFO 매도: 오래된 매수 거래부터 차감
        let remainingToSell = tradeQty;
        const updatedTransactions = a.transactions.map(tx => {
          if (remainingToSell <= 0) return tx;
          if (tx.type === '매수' && tx.qty > 0) {
            const sellFromThis = Math.min(tx.qty, remainingToSell);
            remainingToSell -= sellFromThis;
            return { ...tx, qty: tx.qty - sellFromThis };
          }
          return tx;
        });
        
        if (remainingToSell > 0) { alert('보유 수량보다 많은 수량을 매도할 수 없습니다.'); return a; }
        
        // 매도 기록 추가
        const newTx = { id: `tx_sell_${Date.now()}`, date: formattedDate, type: '매도' as const, buyPrice: tradePrice, qty: tradeQty, profit: 0, profitPercent: 0, positive: true, total: tradePrice * tradeQty };
        return { ...a, qty: a.qty - tradeQty, totalAmount: (a.qty - tradeQty) * a.price, transactions: [newTx, ...updatedTransactions] };
      }
    }));
    setTradeModal(false);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellTarget || sellQty <= 0 || sellQty > sellTarget.maxQty) { alert('올바른 수량을 입력해주세요.'); return; }
    const dateObj = new Date(sellDate);
    const formattedDate = `${String(dateObj.getFullYear()).slice(2)}. ${dateObj.getMonth() + 1}. ${dateObj.getDate()}.`;
    setPortfolioAssets(prev => prev.map(a => {
      if (a.ticker !== sellTarget.ticker) return a;
      const newTx = { id: `tx_sell_${Date.now()}`, date: formattedDate, type: '매도' as const, buyPrice: sellTarget.price, qty: sellQty, profit: 0, profitPercent: 0, positive: true, total: sellTarget.price * sellQty };
      return { ...a, transactions: [newTx, ...a.transactions] };
    }));
    setSellModal(false);
    setSellTarget(null);
  };

  const handleDeleteTransaction = (ticker: string, txId: string) => {
    setPortfolioAssets(prev => prev.map(a => {
      if (a.ticker !== ticker) return a;
      return { ...a, transactions: a.transactions.filter(tx => tx.id !== txId) };
    }));
  };
  const chartApiRef = useRef<any>(null);
  const seriesApiRef = useRef<any>(null);
  const lineToolsRef = useRef<any>(null);
  const [drawingLocked, setDrawingLocked] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const lineToolsInited = useRef(false);

  useEffect(() => {
    if (footerQuestion) {
      setActiveTab("research");
    }
  }, [footerQuestion]);

  const initLineTools = useCallback(async () => {
    if (!chartApiRef.current || !seriesApiRef.current?.api || lineToolsInited.current) return;
    try {
      const [mod, linesMod, fibMod, freehandMod, rectMod, circleMod, triangleMod, pathMod, channelMod, priceMod, posMod, textMod, depthMod] = await Promise.all([
        import('lightweight-charts-line-tools-core'),
        import('lightweight-charts-line-tools-lines'),
        import('lightweight-charts-line-tools-fib-retracement'),
        import('lightweight-charts-line-tools-freehand'),
        import('lightweight-charts-line-tools-rectangle'),
        import('lightweight-charts-line-tools-circle'),
        import('lightweight-charts-line-tools-triangle'),
        import('lightweight-charts-line-tools-path'),
        import('lightweight-charts-line-tools-parallel-channel'),
        import('lightweight-charts-line-tools-price-range'),
        import('lightweight-charts-line-tools-long-short-position'),
        import('lightweight-charts-line-tools-text'),
        import('lightweight-charts-line-tools-market-depth'),
      ]);
      const createPlugin = mod.createLineToolsPlugin;
      if (!createPlugin) return;
      const series = seriesApiRef.current.api();
      if (!series) return;
      const plugin: any = createPlugin(chartApiRef.current, series);
      linesMod.registerLinesPlugin(plugin);
      fibMod.registerFibRetracementPlugin(plugin);
      freehandMod.registerFreehandPlugin(plugin);
      plugin.registerLineTool('Rectangle', rectMod.LineToolRectangle);
      plugin.registerLineTool('Circle', circleMod.LineToolCircle);
      triangleMod.registerTrianglePlugin(plugin);
      pathMod.registerPathPlugin(plugin);
      channelMod.registerParallelChannelPlugin(plugin);
      priceMod.registerPriceRangePlugin(plugin);
      posMod.registerLongShortPositionPlugin(plugin);
      textMod.registerTextPlugin(plugin);
      depthMod.registerMarketDepthPlugin(plugin);
      lineToolsRef.current = plugin;
      lineToolsInited.current = true;
      const saved = localStorage.getItem('prism_chart_drawings');
      if (saved) try { plugin.importLineTools(saved); } catch (e) {}
      plugin.subscribeLineToolsAfterEdit(() => {
        try { localStorage.setItem('prism_chart_drawings', plugin.exportLineTools()); } catch (e) {}
      });
    } catch (e) { console.warn('Line tools:', e); }
  }, []);

  useEffect(() => {
    if (chartReady && seriesApiRef.current?.api) initLineTools();
  }, [chartReady, initLineTools]);

  const portfolioData = useDeterministicSparkline(19653380);
  const portfolioColor = "hsl(var(--primary))";

  const holdings = useMemo(() => [
    { ticker: "329180", name: "HD현대중공업", price: "₩667,000", change: "-2.49%", positive: false, qty: 10, total: "₩6,670,000" },
    { ticker: "005930", name: "삼성전자", price: "₩354,000", change: "-2.34%", positive: false, qty: 5, total: "₩1,770,000" },
    { ticker: "000660", name: "SK하이닉스", price: "₩2,764,000", change: "+2.94%", positive: true, qty: 3, total: "₩8,292,000" },
    { ticker: "006800", name: "미래에셋증권", price: "₩48,750", change: "-3.85%", positive: false, qty: 20, total: "₩975,000" },
    { ticker: "009150", name: "삼성전기", price: "₩2,270,000", change: "+3.18%", positive: true, qty: 1, total: "₩2,270,000" },
  ], []);

  const enhancedHoldings = useMemo(() => [
    { ticker: "329180", name: "HD현대중공업", badgeBg: "bg-foreground", price: 667000, qty: 10, dailyProfit: -16675, dailyProfitPercent: -2.49, positive: false, totalAmount: 6670000, transactions: [{ id: "tx1", date: "26. 6. 10.", type: "매수", buyPrice: 683500, qty: 10, profit: -16500, profitPercent: -2.41, positive: false, total: 6670000 }] },
    { ticker: "005930", name: "삼성전자", badgeBg: "bg-primary", price: 354000, qty: 5, dailyProfit: -8284, dailyProfitPercent: -2.34, positive: false, totalAmount: 1770000, transactions: [{ id: "tx2", date: "26. 6. 12.", type: "매수", buyPrice: 362500, qty: 5, profit: -4250, profitPercent: -2.34, positive: false, total: 1770000 }] },
    { ticker: "000660", name: "SK하이닉스", badgeBg: "bg-orange-500", price: 2764000, qty: 3, dailyProfit: 81216, dailyProfitPercent: 2.94, positive: true, totalAmount: 8292000, transactions: [
      { id: "tx3a", date: "26. 6. 1.", type: "매수", buyPrice: 2685000, qty: 2, profit: 15800, profitPercent: 2.94, positive: true, total: 5528000 },
      { id: "tx3b", date: "26. 6. 8.", type: "매수", buyPrice: 2710000, qty: 1, profit: 5400, profitPercent: 1.99, positive: true, total: 2764000 },
    ]},
    { ticker: "006800", name: "미래에셋증권", badgeBg: "bg-green-700", price: 48750, qty: 20, dailyProfit: -1877, dailyProfitPercent: -3.85, positive: false, totalAmount: 975000, transactions: [{ id: "tx4", date: "26. 6. 5.", type: "매수", buyPrice: 50700, qty: 20, profit: -390, profitPercent: -3.85, positive: false, total: 975000 }] },
    { ticker: "009150", name: "삼성전기", badgeBg: "bg-purple-800", price: 2270000, qty: 1, dailyProfit: 72186, dailyProfitPercent: 3.18, positive: true, totalAmount: 2270000, transactions: [{ id: "tx5", date: "26. 6. 3.", type: "매수", buyPrice: 2200000, qty: 1, profit: 70000, profitPercent: 3.18, positive: true, total: 2270000 }] },
  ], []);

  const allAssetData = useMemo(() => {
    const data: Record<string, number[]> = { portfolio: portfolioData };
    for (const asset of compareAssets) {
      data[asset.id] = getComparisonSparkline(asset.id);
    }
    return data;
  }, [portfolioData, compareAssets]);

  const mainAsset = useMemo(() => ({
    data: portfolioData,
    color: portfolioColor,
    label: "투자중",
  }), [portfolioData, portfolioColor]);

  const tickerSuggestions = [
    { id: "005930", label: "삼성전자", price: "₩72,100", change: "+1.42%", positive: true },
    { id: "SPY", label: "S&P 500", price: "$542.50", change: "-0.35%", positive: false },
    { id: "000660", label: "SK하이닉스", price: "₩2,764,000", change: "+2.94%", positive: true },
    { id: "NVDA", label: "NVIDIA", price: "$210.69", change: "+2.95%", positive: true },
  ];

  const assetColorMap: Record<string, string> = {
    "005930": "#0E9E4B", "SPY": "hsl(var(--primary))", "000660": "#FF9500", "NVDA": "#FF4B4B",
    "329180": "hsl(var(--primary))", "006800": "bg-purple-800", "009150": "bg-red-700",
  };

  const filteredSuggestions = searchQuery.trim()
    ? tickerSuggestions.filter(s => s.id.includes(searchQuery) || s.label.includes(searchQuery))
    : tickerSuggestions;

  const allCompareData = useMemo(() => {
    const items = [
      { id: 'portfolio', ticker: '투자중', name: '내 자산 포트폴리오', price: '$19,653,380', changeValue: '+453,120', changePercent: '+2.36%', positive: true, color: '#FF9500' },
      ...compareAssets.map(a => {
        const s = tickerSuggestions.find(t => t.id === a.id);
        return { id: a.id, ticker: a.id, name: s?.label || a.id, price: s?.price || '—', changeValue: s?.change || '—', changePercent: s?.change || '—', positive: s?.positive ?? true, color: a.color };
      }),
    ];
    return items;
  }, [compareAssets]);

  return (<>
    <div className="flex flex-col flex-1 min-h-0">
      {vp >= BREAKPOINTS.MOBILE && (
      <div className="flex border-b border-border">
        <button onClick={() => setActiveTab("portfolio")} className={`flex-1 py-3 text-[14px] font-medium text-center border-b-2 transition-colors ${activeTab === "portfolio" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>포트폴리오</button>
        {rightW <= 0 && <button onClick={() => setActiveTab("research")} className={`flex-1 py-3 text-[14px] font-medium text-center border-b-2 transition-colors ${activeTab === "research" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>조사</button>}
      </div>
      )}

      {activeTab === "portfolio" ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex items-center gap-1 px-4 py-3 border-b border-border">
            <Button variant="link" onClick={onBack} className="flex items-center gap-1 text-[14px] text-primary hover:underline p-0 h-auto"><ArrowLeft className="w-4 h-4" />홈</Button>
            <span className="text-muted-foreground">|</span>
            <span className="text-[14px] text-foreground font-medium">투자중</span>
          </div>

          <div className="px-4 pt-4 pb-2">
            <div className="text-[16px] font-semibold text-foreground mb-1">투자중</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[28px] font-bold text-foreground tabular-nums whitespace-nowrap">$19,653,380.00</span>
              <div className="flex items-center gap-1 text-[14px] text-[#0E9E4B] font-medium whitespace-nowrap">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+2.36%</span>
              </div>
              <span className="text-[14px] text-muted-foreground whitespace-nowrap">(+$453,120.00) {period}</span>
            </div>
            <div className="text-[12px] text-muted-foreground mt-1">6월 20일, 오전 9시 0분 0초 UTC · KRW</div>
          </div>

          {/* Controls row: comparison add + chart type toggle */}
          <div className="flex items-center gap-2 px-4 py-1.5">
            <Button variant="outline" onClick={() => setShowSearch(!showSearch)} className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-muted-foreground border border-border rounded-full hover:bg-muted transition-colors h-auto">
              <Plus className="w-3 h-3" /> 비교
            </Button>
            <Button variant="outline" onClick={() => setStyleOpen(!styleOpen)} className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-muted-foreground border border-border rounded-full hover:bg-muted transition-colors h-auto">
              {chartType === 'linear' ? '선형' : '영역'} <ChevronDown className="w-3 h-3" />
            </Button>
          </div>

          {/* Asset tokens row */}
          <div className="flex items-center gap-2 px-4 py-1.5 overflow-x-auto scroll-hide">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full flex-shrink-0">
              <AssetSymbol shape="circle" color="#FF9500" size={12} />
              <span className="text-[12px] text-foreground font-medium">투자중</span>
            </div>
            {compareAssets.map(asset => (
              <div key={asset.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full flex-shrink-0">
                <AssetSymbol shape={getAssetShape(asset.id)} color={asset.color} size={12} />
                <span className="text-[12px] text-foreground">{asset.label}</span>
                <Button variant="ghost" size="icon" onClick={() => setCompareAssets(prev => prev.filter(a => a.id !== asset.id))} className="p-0.5 hover:bg-border rounded-full transition-colors h-auto w-auto">
                  <X className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>

          {/* Chart type modal */}
          {styleOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setStyleOpen(false)}>
              <div className="bg-white rounded-2xl shadow-xl p-3 w-44" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setChartType('linear'); setStyleOpen(false); }} className={`w-full text-left px-4 py-3 text-[16px] rounded-xl ${chartType === 'linear' ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}>선형</button>
                <button onClick={() => { setChartType('area'); setStyleOpen(false); }} className={`w-full text-left px-4 py-3 text-[16px] rounded-xl ${chartType === 'area' ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}>영역</button>
              </div>
            </div>
          )}

          {/* Comparison search modal */}
          {showSearch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowSearch(false)}>
              <div className="bg-white rounded-2xl shadow-xl w-[90vw] max-w-md p-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="종목 이름이나 티커를 입력하세요" className="h-12 pl-12 pr-4 bg-muted rounded-full text-[16px] placeholder-muted-foreground border-none focus-visible:ring-2 focus-visible:ring-primary/20" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowSearch(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></Button>
                </div>
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border max-h-64 overflow-y-auto">
                  {filteredSuggestions.map(s => (
                    <div key={s.id} onClick={() => { if (!compareAssets.some(a => a.id === s.id)) { setCompareAssets(prev => [...prev, { id: s.id, label: s.label, color: assetColorMap[s.id] || '#FF9500', markerType: 'circle' }]); } setShowSearch(false); setSearchQuery(''); }} className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-muted transition-colors">
                      <div>
                        <div className="text-[16px] font-semibold text-foreground">{s.id}</div>
                        <div className="text-[13px] text-muted-foreground">{s.label}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[15px] text-foreground tabular-nums">{s.price}</div>
                        <div className={`text-[14px] font-medium ${s.positive ? 'text-[#0E9E4B]' : 'text-[#FF4B4B]'}`}>{s.change}</div>
                      </div>
                    </div>
                  ))}
                  {filteredSuggestions.length === 0 && <div className="px-4 py-4 text-[14px] text-muted-foreground">검색 결과 없음</div>}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-0 px-2">
            <div className="flex-1 min-w-0">
              <PortfolioChart
                mainAsset={mainAsset}
                compareAssets={compareAssets}
                period={period}
                allAssetData={allAssetData}
                chartType={chartType}
                onChartReady={(chart) => { chartApiRef.current = chart; setChartReady(true); }}
                seriesRef={seriesApiRef}
              />
            </div>
          </div>

          {/* Drawing toolbar — accordion sections */}
          <div className="flex items-center justify-center gap-0 px-3 py-1.5 overflow-x-auto scroll-hide border-t border-border">
            {/* Section: Lines */}
            <div className="flex items-center gap-0.5 mr-1">
              <button onClick={() => setOpenSection(openSection === 'lines' ? null : 'lines')}
                className={`px-1.5 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${openSection === 'lines' ? 'bg-muted text-foreground' : 'text-muted-foreground/75 hover:text-muted-foreground hover:bg-muted'}`}>선</button>
              {openSection === 'lines' && <>
                {[
                  { key: 'trend', icon: '╱', type: 'TrendLine' },
                  { key: 'horiz', icon: '―', type: 'HorizontalLine' },
                  { key: 'vert', icon: '│', type: 'VerticalLine' },
                  { key: 'ray', icon: '→', type: 'Ray' },
                  { key: 'arrow', icon: '↑', type: 'Arrow' },
                  { key: 'ext', icon: '↔', type: 'ExtendedLine' },
                  { key: 'cross', icon: '+', type: 'CrossLine' },
                  { key: 'horizray', icon: '⇀', type: 'HorizontalRay' },
                  { key: 'callout', icon: '💬', type: 'Callout' },
                ].map(t => (
                  <button key={t.key}
                    onClick={() => { setCurrentTool(currentTool === t.key ? null : t.key); if (lineToolsRef.current) lineToolsRef.current.addLineTool(t.type, []); }}
                    className={`w-7 h-7 flex items-center justify-center rounded text-[11px] transition-colors ${currentTool === t.key ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                    title={t.key}>{t.icon}</button>
                ))}
              </>}
            </div>
            <div className="w-px h-5 bg-border mx-1" />
            {/* Section: Shapes */}
            <div className="flex items-center gap-0.5 mr-1">
              <button onClick={() => setOpenSection(openSection === 'shapes' ? null : 'shapes')}
                className={`px-1.5 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${openSection === 'shapes' ? 'bg-muted text-foreground' : 'text-muted-foreground/75 hover:text-muted-foreground hover:bg-muted'}`}>도형</button>
              {openSection === 'shapes' && <>
                {[
                  { key: 'rect', icon: '▭', type: 'Rectangle' },
                  { key: 'circle', icon: '○', type: 'Circle' },
                  { key: 'tri', icon: '△', type: 'Triangle' },
                  { key: 'channel', icon: '‖', type: 'ParallelChannel' },
                ].map(t => (
                  <button key={t.key}
                    onClick={() => { setCurrentTool(currentTool === t.key ? null : t.key); if (lineToolsRef.current) lineToolsRef.current.addLineTool(t.type, []); }}
                    className={`w-7 h-7 flex items-center justify-center rounded text-[11px] transition-colors ${currentTool === t.key ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                    title={t.key}>{t.icon}</button>
                ))}
              </>}
            </div>
            <div className="w-px h-5 bg-border mx-1" />
            {/* Section: Freehand */}
            <div className="flex items-center gap-0.5 mr-1">
              <button onClick={() => setOpenSection(openSection === 'drawing' ? null : 'drawing')}
                className={`px-1.5 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${openSection === 'drawing' ? 'bg-muted text-foreground' : 'text-muted-foreground/75 hover:text-muted-foreground hover:bg-muted'}`}>드로잉</button>
              {openSection === 'drawing' && <>
                {[
                  { key: 'brush', icon: '🖌', type: 'Brush' },
                  { key: 'highlighter', icon: '🖍', type: 'Highlighter' },
                  { key: 'path', icon: '~', type: 'Path' },
                ].map(t => (
                  <button key={t.key}
                    onClick={() => { setCurrentTool(currentTool === t.key ? null : t.key); if (lineToolsRef.current) lineToolsRef.current.addLineTool(t.type, []); }}
                    className={`w-7 h-7 flex items-center justify-center rounded text-[11px] transition-colors ${currentTool === t.key ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                    title={t.key}>{t.icon}</button>
                ))}
              </>}
            </div>
            <div className="w-px h-5 bg-border mx-1" />
            {/* Section: Analysis */}
            <div className="flex items-center gap-0.5 mr-1">
              <button onClick={() => setOpenSection(openSection === 'analysis' ? null : 'analysis')}
                className={`px-1.5 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${openSection === 'analysis' ? 'bg-muted text-foreground' : 'text-muted-foreground/75 hover:text-muted-foreground hover:bg-muted'}`}>분석</button>
              {openSection === 'analysis' && <>
                {[
                  { key: 'fib', icon: 'Fib', type: 'FibRetracement', cls: 'text-[9px]' },
                  { key: 'price', icon: '$', type: 'PriceRange' },
                  { key: 'position', icon: '↕', type: 'LongShortPosition' },
                  { key: 'text', icon: 'T', type: 'Text', cls: 'font-bold text-[12px]' },
                  { key: 'depth', icon: '📊', type: 'MarketDepth' },
                ].map(t => (
                  <button key={t.key}
                    onClick={() => { setCurrentTool(currentTool === t.key ? null : t.key); if (lineToolsRef.current) lineToolsRef.current.addLineTool(t.type, []); }}
                    className={`w-7 h-7 flex items-center justify-center rounded text-[11px] transition-colors ${(t as any).cls || ''} ${currentTool === t.key ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                    title={t.key}>{t.icon}</button>
                ))}
              </>}
            </div>
            <div className="w-px h-5 bg-border mx-1" />
            {/* Controls — always visible */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => { setCurrentTool(null); if (lineToolsRef.current) { lineToolsRef.current.removeAllLineTools(); localStorage.removeItem('prism_chart_drawings'); } }} className="w-7 h-7 flex items-center justify-center rounded text-[11px] text-destructive hover:bg-destructive/10 transition-colors" title="전체 삭제">✕</button>
              <button onClick={() => { if (lineToolsRef.current) lineToolsRef.current.removeSelectedLineTools(); }} className="w-7 h-7 flex items-center justify-center rounded text-[11px] text-muted-foreground hover:bg-muted transition-colors" title="선택 삭제">🗑</button>
              <button onClick={() => { setDrawingLocked(!drawingLocked); if (lineToolsRef.current) lineToolsRef.current.setLocked(!drawingLocked); }} className={`w-7 h-7 flex items-center justify-center rounded text-[11px] transition-colors ${drawingLocked ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'}`} title={drawingLocked ? '잠금 해제' : '잠금'}>🔒</button>
            </div>
          </div>

          {/* Period filter bar */}
          <ToggleGroup
            value={[period]}
            onValueChange={(v: string[]) => { const next = v[0] as PeriodFilter; if (next) setPeriod(next); }}
            className="flex items-center justify-center gap-0 px-4 py-2 overflow-x-auto scroll-hide"
          >
            {(['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', '최대'] as PeriodFilter[]).map(p => (
              <ToggleGroupItem key={p} value={p} className="px-3 py-1.5 text-[12px] rounded-full whitespace-nowrap flex-shrink-0 text-muted-foreground data-[pressed]:bg-muted data-[pressed]:text-foreground data-[pressed]:font-medium">{p}</ToggleGroupItem>
            ))}
          </ToggleGroup>

          {/* Comparison data table */}
          {compareAssets.length > 0 && (
            <div className="px-4 pt-2 pb-4">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="w-8 py-2 pr-1" />
                    <th className="text-left py-2 pr-2 font-medium whitespace-nowrap">종목</th>
                    <th className="text-right py-2 px-2 font-medium whitespace-nowrap">가격</th>
                    <th className="text-right py-2 px-2 font-medium whitespace-nowrap">변동</th>
                    <th className="text-right py-2 pl-2 font-medium whitespace-nowrap">변동률(%)</th>
                  </tr>
                </thead>
                <tbody>
                  {allCompareData.map(item => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-3 pr-1">
                        <AssetSymbol shape={item.id === 'portfolio' ? 'circle' : getAssetShape(item.id)} color={item.color} size={14} />
                      </td>
                      <td className="py-3 pr-2">
                        <div>
                          <div className="text-[14px] font-semibold text-foreground">{item.ticker}</div>
                          <div className="text-[11px] text-muted-foreground">{item.name}</div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 tabular-nums text-foreground whitespace-nowrap">{item.price}</td>
                      <td className={`text-right py-3 px-2 tabular-nums whitespace-nowrap ${item.positive ? 'text-[#0E9E4B]' : 'text-[#FF4B4B]'}`}>{item.changeValue}</td>
                      <td className={`text-right py-3 pl-2 tabular-nums whitespace-nowrap ${item.positive ? 'text-[#0E9E4B]' : 'text-[#FF4B4B]'}`}>{item.changePercent}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Bottom sections: button groups + sort */}
          <div className="px-4 pt-3 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {["구성", "활동", "뉴스 및 이벤트"].map(btn => (
                  <button key={btn} onClick={() => setBottomTab(btn)}
                    className={`px-2.5 py-1 text-[12px] font-medium rounded-full transition-colors ${bottomTab === btn ? 'bg-foreground text-white' : 'text-muted-foreground hover:bg-muted'}`}>{btn}</button>
                ))}
                {bottomTab === "구성" && (
                  <div className="relative ml-1">
                    <button onClick={() => setSortMenuOpen(!sortMenuOpen)}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted rounded-full transition-colors">
                      <span>{sortAsc ? '↑' : '↓'}</span>
                      <span>{sortOption === 'name' ? '이름순' : sortOption === 'price' ? '가격순' : sortOption === 'profit' ? '수익순' : '수량순'}</span>
                    </button>
                    {sortMenuOpen && (
                      <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-border rounded-xl shadow-xl z-30 p-1.5">
                        <div className="text-[10px] text-muted-foreground/75 font-semibold px-2 pb-1.5 border-b border-border mb-1">정렬 기준</div>
                        {[
                          { key: 'name', label: '이름' },
                          { key: 'price', label: '가격' },
                          { key: 'profit', label: '수익' },
                          { key: 'qty', label: '수량' },
                        ].map(opt => (
                          <button key={opt.key} onClick={() => { setSortOption(opt.key); setSortMenuOpen(false); }}
                            className="w-full text-left px-2.5 py-1.5 text-[12px] hover:bg-muted rounded-lg flex items-center justify-between text-foreground">
                            <span>{opt.label}</span>
                            {sortOption === opt.key && <span className="text-primary text-[11px]">✓</span>}
                          </button>
                        ))}
                        <div className="border-t border-border my-1 pt-1">
                          <button onClick={() => { setSortAsc(!sortAsc); setSortMenuOpen(false); }}
                            className="w-full text-left px-2.5 py-1.5 text-[12px] hover:bg-muted rounded-lg text-muted-foreground">
                            {sortAsc ? '↑ 오름차순' : '↓ 내림차순'}
                          </button>
                        </div>
                      </div>
      )}
    </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant={showViz ? "default" : "ghost"} size="sm" className={`flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium rounded-full h-auto ${!showViz && 'hover:bg-muted text-muted-foreground'}`}>{showViz ? '𝌝 목록' : '📊 시각화'}</Button>
                <Button size="sm" onClick={() => { setTradeType('buy'); setTradeTicker(portfolioAssets[0]?.ticker || ''); setTradeQty(0); setTradePrice(0); setTradeTickerLocked(false); setTradeModal(true); }} className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-full h-auto">+ 투자</Button>
              </div>
            </div>
            {bottomTab === "구성" && !showViz && (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 pr-2 font-medium whitespace-nowrap">종목</th>
                      <th className="text-right py-2 px-2 font-medium whitespace-nowrap">가격</th>
                      <th className="text-right py-2 px-2 font-medium whitespace-nowrap">수량</th>
                      <th className="text-right py-2 px-2 font-medium whitespace-nowrap">변동</th>
                      <th className="text-right py-2 px-2 font-medium whitespace-nowrap">변동률(%)</th>
                      <th className="text-right py-2 pl-2 font-medium whitespace-nowrap">값</th>
                      <th className="text-center py-2 pl-2 font-medium whitespace-nowrap w-10"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...portfolioAssets]
                      .sort((a, b) => {
                        const dir = sortAsc ? 1 : -1;
                        if (sortOption === 'price') return dir * (a.price - b.price);
                        if (sortOption === 'profit') return dir * (a.dailyProfitPercent - b.dailyProfitPercent);
                        if (sortOption === 'qty') return dir * (a.qty - b.qty);
                        return dir * a.name.localeCompare(b.name);
                      })
                      .map(asset => {
                        const isExpanded = !!expandedTickers[asset.ticker];
                        return (
                          <Fragment key={asset.ticker}>
                            <tr className="border-b border-border hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => setExpandedTickers(prev => ({ ...prev, [asset.ticker]: !prev[asset.ticker] }))}>
                              <td className="py-2 pr-2">
                                <div>
                                  <div className="text-[14px] font-semibold text-foreground">{asset.ticker}</div>
                                  <div className="text-[12px] text-muted-foreground">{asset.name}</div>
                                </div>
                              </td>
                              <td className="text-right py-2 px-2 tabular-nums text-foreground whitespace-nowrap">₩{asset.price.toLocaleString()}</td>
                              <td className="text-right py-2 px-2 tabular-nums text-foreground whitespace-nowrap">{asset.qty}</td>
                              <td className={`text-right py-2 px-2 tabular-nums whitespace-nowrap font-medium ${asset.positive ? 'text-destructive' : 'text-primary'}`}>
                                {asset.positive ? '+' : ''}₩{asset.dailyProfit.toLocaleString()}
                              </td>
                              <td className="text-right py-2 px-2 tabular-nums whitespace-nowrap text-muted-foreground">{asset.dailyProfitPercent}%</td>
                              <td className="text-right py-2 pl-2 tabular-nums text-foreground whitespace-nowrap">₩{asset.totalAmount.toLocaleString()}</td>
                              <td className="text-center py-2 pl-2">
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.ticker, asset.name); }}
                                  className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors text-[11px]" title="삭제">🗑</button>
                              </td>
                            </tr>
                            {/* Transaction detail sub-rows */}
                            {isExpanded && (
                              <tr key={`${asset.ticker}-detail`}>
                                <td colSpan={7} className="p-0">
                                  <div className="bg-muted/50 border-b border-border px-4 py-3">
                                    <div className="grid grid-cols-12 text-[10px] font-semibold text-muted-foreground/75 text-right pb-1.5 mb-1.5 border-b border-border/60">
                                      <div className="col-span-2 text-left cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => setTxSortAsc(prev => ({ ...prev, [asset.ticker]: prev[asset.ticker] === false ? true : false }))}
                                      >매매일자 {txSortAsc[asset.ticker] === false ? '↑' : '↓'}</div>
                                      <div className="col-span-1">구분</div>
                                      <div className="col-span-2">거래 단가</div>
                                      <div className="col-span-1">수량</div>
                                      <div className="col-span-2">총수익</div>
                                      <div className="col-span-2">총 금액</div>
                                      <div className="col-span-2 text-center"> </div>
                                    </div>
                                    {[...asset.transactions].sort((a, b) => {
                                      const parseDate = (d: string) => {
                                        const parts = d.replace(/\.$/g, '').split('. ');
                                        return new Date(2000 + parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                      };
                                      const dateA = parseDate(a.date);
                                      const dateB = parseDate(b.date);
                                      return txSortAsc[asset.ticker] === false ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
                                    }).map(tx => {
                                      const isBuy = tx.type === '매수';
                                      const isQtyZero = isBuy && tx.qty === 0;
                                      return (
                                        <div key={tx.id} className={`${isQtyZero ? 'opacity-40' : ''}`}>
                                          <div className="grid grid-cols-12 text-[12px] text-right py-1.5 items-center text-foreground">
                                            <div className="col-span-2 text-left font-medium text-muted-foreground">{tx.date}</div>
                                            <div className="col-span-1">
                                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${isBuy ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{tx.type}</span>
                                            </div>
                                            <div className="col-span-2 tabular-nums">₩{tx.buyPrice.toLocaleString()}</div>
                                            <div className="col-span-1 text-muted-foreground">{tx.qty}</div>
                                            <div className={`col-span-2 tabular-nums font-semibold ${tx.positive ? 'text-destructive' : 'text-primary'}`}>
                                              {tx.positive ? '+' : ''}₩{tx.profit.toLocaleString()} ({tx.profitPercent}%)
                                            </div>
                                            <div className="col-span-2 tabular-nums font-medium">₩{tx.total.toLocaleString()}</div>
                                            <div className="col-span-2 flex justify-center">
                                              <button onClick={(e) => { e.stopPropagation(); if (window.confirm('이 거래내역을 삭제하시겠습니까?')) { handleDeleteTransaction(asset.ticker, tx.id); } }} className="text-[10px] font-bold text-muted-foreground hover:text-destructive" title="삭제">🗑️</button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <div className="mt-1.5 pt-1.5 border-t border-dashed border-border flex gap-2">
                                      <Button variant="link" onClick={() => { setTradeType('buy'); setTradeTicker(asset.ticker); setTradeQty(0); setTradePrice(0); setTradeTickerLocked(true); setTradeModal(true); }} className="text-[11px] font-semibold p-0 h-auto text-destructive hover:text-destructive/80 underline-offset-2">+ 매수 기록하기</Button>
                                      <Button variant="link" onClick={() => { setTradeType('sell'); setTradeTicker(asset.ticker); setTradeQty(0); setTradePrice(0); setTradeTickerLocked(true); setTradeModal(true); }} className="text-[11px] font-semibold p-0 h-auto text-primary hover:text-primary/80 underline-offset-2">+ 매도 기록하기</Button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })
                    }
                  </tbody>
                </table>
            )}
            {bottomTab === "구성" && showViz && (
              <div className="w-full">
                {/* Treemap header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground">투자 시각화</h3>
                    <p className="text-[11px] text-muted-foreground">각 상자의 크기는 포트폴리오에서 투자의 총 가치를 나타냅니다. 색상은 오늘 수익을 나타냅니다.</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">일일 변동률(%)</span>
                    <div className="flex gap-0.5">
                      {[['≤ -3','bg-[#5B92E5]'],['-2','bg-[#84B0F2]'],['-1','bg-[#D2E3FC]'],['0','bg-[#E0E0E0]'],['+1','bg-[#F9B7B1]'],['+2','bg-[#F28B82]'],['≥ 3','bg-[#EA4335]']].map(([label,color],i)=>(
                        <div key={i} className="flex flex-col items-center w-7">
                          <div className={`w-full h-3 rounded-sm ${color}`} />
                          <span className="text-[8px] font-semibold text-muted-foreground/75 mt-0.5">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Treemap grid */}
                <VizTreemap data={portfolioAssets} />
              </div>
            )}
            {bottomTab === "활동" && (
              <div className="px-4 py-3">
                <div className="text-[15px] font-bold text-foreground mb-3">활동 내역</div>
                <div className="flex flex-col gap-3">
                  {[...portfolioAssets.flatMap(a => 
                    a.transactions.map(tx => ({
                      ...tx,
                      ticker: a.ticker,
                      name: a.name,
                      currentPrice: a.price,
                    }))
                  )].sort((a, b) => {
                    const parseDate = (d: string) => {
                      const parts = d.replace(/\.$/g, '').split('. ');
                      return new Date(2000 + parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    };
                    return parseDate(b.date).getTime() - parseDate(a.date).getTime();
                  }).map((item, idx) => {
                    const isSell = item.type === '매도';
                    const profitAmount = isSell ? (item.currentPrice - item.buyPrice) * item.qty : 0;
                    const profitPercent = isSell && item.buyPrice > 0 ? ((item.currentPrice - item.buyPrice) / item.buyPrice * 100) : 0;
                    return (
                      <div key={`${item.ticker}-${item.id}-${idx}`} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isSell ? 'bg-primary' : 'bg-destructive'}`}>
                          {isSell ? '매도' : '매수'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-bold text-foreground">{item.ticker}</span>
                              <span className={`text-[11px] font-semibold ${isSell ? 'text-primary' : 'text-destructive'}`}>{item.type}</span>
                            </div>
                            <span className="text-[14px] font-bold text-foreground">₩{item.total.toLocaleString()}</span>
                          </div>
                          <div className="text-[12px] text-muted-foreground mt-1">
                            {item.date} · ₩{item.buyPrice.toLocaleString()}에 {item.qty}주
                          </div>
                          {isSell && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[11px] text-muted-foreground">수익률</span>
                              <span className={`text-[12px] font-bold ${profitPercent >= 0 ? 'text-destructive' : 'text-primary'}`}>
                                {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                              </span>
                              <span className={`text-[12px] font-semibold ${profitAmount >= 0 ? 'text-destructive' : 'text-primary'}`}>
                                {profitAmount >= 0 ? '+' : ''}₩{profitAmount.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {bottomTab === "뉴스 및 이벤트" && (
              <div className="px-4 py-3">
                <div className="text-[15px] font-bold text-foreground mb-3">뉴스 및 이벤트</div>
                <div className="text-[12px] text-muted-foreground mb-3">내 포트폴리오 관련 뉴스</div>
                {filteredSources.length > 0 && (
                  <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                    <div className="text-[10px] text-muted-foreground mb-1">숨긴 매체 ({filteredSources.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {filteredSources.map(source => (
                        <span key={source} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-border rounded-full text-[10px] text-muted-foreground">
                          {source}
                          <button onClick={() => setFilteredSources(prev => prev.filter(s => s !== source))} className="hover:text-destructive">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {[
                    { source: '헤럴드경제', time: '1일 전', title: "'주식으로 1억' 날린 미자, 또?…\"SK하닉 재입성\" 소식에 \"큰일 났다\" 반응", index: null },
                    { source: '뉴데일리', time: '2시간 전', title: "반도체 쏠림 심화 … ETF도 독식하며 수익률 상위 휩쓸었다", index: null },
                    { source: '매일경제', time: '1일 전', title: "[단독] 현대車, 보스턴다이내믹스 100% 품다…美증시 상장 속도낼듯", index: null },
                    { source: '한국경제', time: '2일 전', title: "\"삼성·SK하이닉스에 '이것' 더해라\"…수익률 78% 낸 1위의 승부수", index: null },
                    { source: '매일경제', time: '3일 전', title: "'삼전닉스' 수익률 별 거 아니다...700% 급등한 이 종목", index: { name: 'KOSPI', change: '0.13%' } },
                    { source: '매일경제', time: '2일 전', title: "[단독] 현대차그룹, 보스턴다이내믹스 지분 더 산다…100% 소유 자회사로", index: null },
                    { source: 'Daum', time: '1일 전', title: "'반도체 포모'에 삼전닉스 계좌 트는 개미들…주식활동계좌도 올들어 1000만개 늘었다", index: { name: 'KOSPI', change: '0.13%' } },
                    { source: '지디넷코리아', time: '1일 전', title: "현대차 \"농업용 로봇 투자·협업 계획 중\"", index: null },
                  ].filter(news => !filteredSources.includes(news.source)).map((news, idx) => (
                    <div key={idx} className="group p-3 bg-muted/50 rounded-xl cursor-pointer hover:bg-border transition-colors relative">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-muted-foreground">{news.source}</span>
                        <span className="text-[10px] text-muted-foreground/75">·</span>
                        <span className="text-[10px] text-muted-foreground/75">{news.time}</span>
                        {news.index && (
                          <span className="text-[10px] font-semibold text-primary">{news.index.name} {news.index.change}</span>
                        )}
                        <div className="ml-auto relative">
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-border rounded-full" title="더보기">
                                                      <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                                      </svg>
                                                    </Button>
                          <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-10 py-1 min-w-[140px]">
                            <button onClick={(e) => { e.stopPropagation(); setFilteredSources(prev => [...prev, news.source]); }} className="w-full text-left px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors">
                              {news.source} 보이지 않기
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-[13px] font-semibold text-foreground leading-tight">{news.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <ResearchPanel collapsedWidth={800} expanded={false} embedded initialQuestion={footerQuestion} initialQuestionId={footerQuestionId} />
        </div>
      )}
    </div>

    {/* Trade modal */}
    {tradeModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setTradeModal(false)}>
        <div className="bg-white rounded-2xl shadow-xl w-[90vw] max-w-sm p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-foreground">{tradeType === 'buy' ? '매수' : '매도'} 기록</h3>
<Button variant="ghost" size="icon" onClick={() => setTradeModal(false)} className="p-1 hover:bg-muted rounded-full transition-colors"><X className="w-4 h-4 text-muted-foreground" /></Button>
          </div>
          <form onSubmit={handleTradeSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">종목</label>
              <select value={tradeType} onChange={e => setTradeType(e.target.value as 'buy' | 'sell')}
                className="w-full p-2.5 bg-muted/50 border border-border rounded-xl text-[13px] focus:outline-none focus:border-primary">
                <option value="buy">매수</option>
                <option value="sell">매도</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">종목</label>
              {tradeTickerLocked ? (
                <div className="w-full p-2.5 bg-muted border border-border rounded-xl text-[13px] text-muted-foreground">
                  {portfolioAssets.find(a => a.ticker === tradeTicker)?.name} ({tradeTicker})
                </div>
              ) : (
                <select value={tradeTicker} onChange={e => setTradeTicker(e.target.value)}
                  className="w-full p-2.5 bg-muted/50 border border-border rounded-xl text-[13px] focus:outline-none focus:border-primary">
                  {portfolioAssets.map(a => <option key={a.ticker} value={a.ticker}>{a.name} ({a.ticker})</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">날짜</label>
              <Input type="date" value={tradeDate} onChange={e => setTradeDate(e.target.value)}
                className="p-2.5 border border-border rounded-xl text-[13px] focus-visible:ring-0 focus-visible:border-primary h-auto" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">수량</label>
              <Input type="number" min="1" value={tradeQty || ''} onChange={e => setTradeQty(Number(e.target.value))} placeholder="주수 입력"
                className="p-2.5 border border-border rounded-xl text-[13px] font-mono focus-visible:ring-0 focus-visible:border-primary h-auto" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">단가 (₩)</label>
              <Input type="number" min="1" value={tradePrice || ''} onChange={e => setTradePrice(Number(e.target.value))} placeholder="1주당 금액"
                className="p-2.5 border border-border rounded-xl text-[13px] font-mono focus-visible:ring-0 focus-visible:border-primary h-auto" />
            </div>
            <div className="flex justify-end gap-2 mt-1">
               <Button type="button" variant="ghost" onClick={() => setTradeModal(false)} className="px-4 py-2 text-[12px] font-semibold bg-muted rounded-xl hover:bg-border">취소</Button>
               <Button type="submit" className={`px-5 py-2 text-[12px] font-bold text-white rounded-xl transition-colors h-auto ${tradeType === 'buy' ? 'bg-destructive hover:bg-destructive/80' : 'bg-primary hover:bg-primary/80'}`}>저장</Button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Sell modal */}
    {sellModal && sellTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => { setSellModal(false); setSellTarget(null); }}>
        <div className="bg-white rounded-2xl shadow-xl w-[90vw] max-w-sm p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-foreground">매도 기록</h3>
            <Button variant="ghost" size="icon" onClick={() => { setSellModal(false); setSellTarget(null); }} className="p-1 hover:bg-muted rounded-full transition-colors"><X className="w-4 h-4 text-muted-foreground" /></Button>
          </div>
          <form onSubmit={handleSellSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">종목</label>
              <div className="p-2.5 bg-muted border border-border rounded-xl text-[13px] text-muted-foreground">
                {portfolioAssets.find(a => a.ticker === sellTarget.ticker)?.name} ({sellTarget.ticker})
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">날짜</label>
              <input type="date" value={sellDate} onChange={e => setSellDate(e.target.value)}
                className="w-full p-2.5 border border-border rounded-xl text-[13px] focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">매도 수량 (최대 {sellTarget.maxQty}주)</label>
              <input type="number" min="1" max={sellTarget.maxQty} value={sellQty || ''} onChange={e => setSellQty(Number(e.target.value))} placeholder="주수 입력"
                className="w-full p-2.5 border border-border rounded-xl text-[13px] font-mono focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">단가 (₩)</label>
              <div className="p-2.5 bg-muted/50 border border-border rounded-xl text-[13px] font-mono">₩{sellTarget.price.toLocaleString()}</div>
            </div>
           <div className="flex justify-end gap-2 mt-1">
               <Button type="button" variant="ghost" onClick={() => { setSellModal(false); setSellTarget(null); }} className="px-4 py-2 text-[12px] font-semibold bg-muted rounded-xl hover:bg-border">취소</Button>
               <Button type="submit" className="px-5 py-2 text-[12px] font-bold text-white rounded-xl transition-colors h-auto bg-primary hover:bg-primary/80">매도</Button>
             </div>
          </form>
        </div>
      </div>
    )}
  </>);
}

export function MobilePortfolio({ vp, onViewPortfolio }: { vp: number; onViewPortfolio?: () => void }) {
  const watchlistSparkData = watchlistStocks.map(s => ({
    name: s.name, data: useDeterministicSparkline(s.basePrice),
    color: s.positive ? "#0E9E4B" : "#FF4B4B",
  }));

  if (vp >= BREAKPOINTS.MOBILE) return null;

  return (<>
    <div className="mb-5">
      <div className="text-[20px] font-medium text-foreground mb-1">포트폴리오</div>
      <div className="flex items-center px-1 py-1.5 text-[12px] text-muted-foreground border-b border-border">
        <div className="flex-1">이름</div>
        <div className="w-[100px] text-right">가격</div>
        <div className="w-[90px] text-right">변동</div>
      </div>
      <div className="flex items-center px-1 py-2.5 cursor-pointer hover:bg-muted transition-colors rounded" role="button" onClick={onViewPortfolio}>
        <div className="flex-1">
          <div className="text-[14px] text-foreground font-medium">투자중</div>
        </div>
        <div className="w-[100px] text-right text-[14px] text-foreground tabular-nums">$19,653,380.00</div>
        <div className="w-[90px] text-right flex items-center justify-end gap-0.5 text-[14px] text-[#0E9E4B] font-medium">
          <span>+2.36%</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>

    <div className="mb-5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[20px] font-medium text-foreground">목록의 최대 변동 항목</span>
        <div className="flex items-center gap-0.5 text-[14px] text-muted-foreground cursor-pointer px-2 py-1 rounded hover:bg-muted transition-colors">
          <span>통계</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 pr-2 font-medium whitespace-nowrap">종목 코드</th>
                <th className="text-right py-2 px-2 font-medium whitespace-nowrap">가격</th>
                <th className="text-right py-2 px-2 font-medium whitespace-nowrap">변동</th>
                <th className="text-right py-2 pl-2 font-medium whitespace-nowrap">변동률(%)</th>
              </tr>
          </thead>
          <tbody>
            {watchlistStocks.map((s, idx) => (
              <tr key={s.name} className="border-b border-border last:border-b-0 hover:bg-muted cursor-pointer transition-colors">
                <td className="py-2 pr-2">
                  <div className="text-[14px] font-semibold text-foreground">{s.name}</div>
                  <div className="text-[12px] text-muted-foreground">{s.fullName}</div>
                </td>
                <td className="text-right py-2 px-2 tabular-nums text-foreground text-[14px] whitespace-nowrap">{formatPrice(s.price)}</td>
                <td className={`text-right py-2 px-2 tabular-nums whitespace-nowrap ${s.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>{s.positive ? "+" : ""}{s.change}</td>
                <td className="text-right py-2 px-2 tabular-nums text-muted-foreground whitespace-nowrap">{s.change}</td>
              </tr>
            ))}
          </tbody>
            </table>
          </div>
      <div className="flex items-center gap-2 pt-3">
        <Button variant="ghost" className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] text-primary hover:bg-muted rounded-lg transition-colors">모든 목록 보기</Button>
        <Button variant="ghost" className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] text-primary hover:bg-muted rounded-lg transition-colors">관심 목록</Button>
      </div>
    </div>
    </>
  );
}

export function StockDetail({
  stock,
  onBack,
  vp,
}: {
  stock: {
    ticker: string;
    name: string;
    price: number;
    qty: number;
    dailyProfit: number;
    dailyProfitPercent: number;
    positive: boolean;
    totalAmount: number;
    transactions: Array<{
      id: string;
      date: string;
      type: "매수" | "매도";
      buyPrice: number;
      qty: number;
      profit: number;
      profitPercent: number;
      positive: boolean;
      total: number;
    }>;
  };
  onBack: () => void;
  vp: number;
}) {
  const [chartType, setChartType] = useState<"area" | "line" | "candle" | "bar">("area");
  const [chartPeriod, setChartPeriod] = useState<"1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "최대">("1M");
  const [activeContentTab, setActiveContentTab] = useState<"개요" | "실적" | "금융" | "조사">("개요");
  const [tradeModal, setTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [tradeQty, setTradeQty] = useState(0);
  const [tradePrice, setTradePrice] = useState(0);
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split("T")[0]);
  const [localStock, setLocalStock] = useState(stock);

  useEffect(() => {
    setLocalStock(stock);
  }, [stock]);

  const handleDeleteTransaction = (txId: string) => {
    if (window.confirm("이 거래내역을 삭제하시겠습니까?")) {
      setLocalStock((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((tx) => tx.id !== txId),
      }));
    }
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tradeQty <= 0 || tradePrice <= 0) {
      alert("올바른 수량과 단가를 입력해주세요.");
      return;
    }
    const dateObj = new Date(tradeDate);
    const formattedDate = `${String(dateObj.getFullYear()).slice(2)}. ${dateObj.getMonth() + 1}. ${dateObj.getDate()}.`;

    setLocalStock((prev) => {
      const newTx = {
        id: `tx_${Date.now()}`,
        date: formattedDate,
        type: tradeType as "매수" | "매도",
        buyPrice: tradePrice,
        qty: tradeQty,
        profit: 0,
        profitPercent: 0,
        positive: true,
        total: tradePrice * tradeQty,
      };

      if (tradeType === "buy") {
        return {
          ...prev,
          qty: prev.qty + tradeQty,
          totalAmount: (prev.qty + tradeQty) * prev.price,
          transactions: [newTx, ...prev.transactions],
        };
      } else {
        return {
          ...prev,
          qty: prev.qty - tradeQty,
          totalAmount: (prev.qty - tradeQty) * prev.price,
          transactions: [newTx, ...prev.transactions],
        };
      }
    });
    setTradeModal(false);
    setTradeQty(0);
    setTradePrice(0);
  };

  const isPositive = localStock.positive;
  const priceChange = localStock.dailyProfit;
  const priceChangePercent = localStock.dailyProfitPercent;
  const sparklineData = useMemo(() => generateSparklineData(localStock.price, 60, 0.015, localStock.price), [localStock.price]);
  const prevClose = useMemo(
    () => Math.round((localStock.price / (1 + localStock.dailyProfitPercent / 100)) / 100) * 100,
    [localStock.price, localStock.dailyProfitPercent],
  );
  const chartColor = isPositive ? "#0E9E4B" : "#FF4B4B";

  // SVG chart placeholder with gradient
  const renderChart = () => {
    const w = 800, h = 200, pad = 20;
    const data = chartPeriod === "1D" ? sparklineData.slice(-24) : chartPeriod === "5D" ? sparklineData.slice(-40) : chartPeriod === "1M" ? sparklineData.slice(-30) : sparklineData.slice(-90);
    if (data.length < 2) return null;
    const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const pts = data.map((v, i) => ({
      x: pad + (i / (data.length - 1)) * (w - pad * 2),
      y: pad + (1 - (v - min) / range) * (h - pad * 2),
    }));
    const linePath = `M${pts.map(p => `${p.x},${p.y}`).join(" L")}`;
    const areaPath = `${linePath} L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;
    const gradientId = `chart-grad-${stock.ticker}-${chartPeriod}`;

    if (chartType === "line") {
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke={chartColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (chartType === "area") {
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke={chartColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    // candlestick placeholder
    if (chartType === "candle") {
      const candleW = Math.max(3, (w - pad * 2) / data.length - 2);
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {data.map((v, i) => {
            const cx = pad + (i / (data.length - 1)) * (w - pad * 2);
            const bodyTop = pad + (1 - (v - min) / range) * (h - pad * 2);
            const bodyBot = bodyTop + Math.max(4, (h - pad * 2) * 0.05);
            const isUp = i === 0 || v >= (data[i - 1] ?? v);
            const bodyColor = isUp ? "#0E9E4B" : "#FF4B4B";
            return (
              <g key={i}>
                <line x1={cx} y1={pad} x2={cx} y2={h - pad} stroke={bodyColor} strokeWidth="1" opacity="0.3" />
                <rect x={cx - candleW / 2} y={bodyTop} width={candleW} height={bodyBot - bodyTop} fill={bodyColor} rx="0.5" />
              </g>
            );
          })}
        </svg>
      );
    }

    // bar placeholder
    if (chartType === "bar") {
      const barW = Math.max(4, (w - pad * 2) / data.length - 2);
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
          {data.map((v, i) => {
            const cx = pad + (i / (data.length - 1)) * (w - pad * 2);
            const barTop = pad + (1 - (v - min) / range) * (h - pad * 2);
            const barBot = h - pad;
            const isUp = i === 0 || v >= (data[i - 1] ?? v);
            const barColor = isUp ? "#0E9E4B" : "#FF4B4B";
            return (
              <rect key={i} x={cx - barW / 2} y={barTop} width={barW} height={barBot - barTop} fill={barColor} rx="0.5" opacity="0.7" />
            );
          })}
        </svg>
      );
    }
  };

  const relatedStocks = useMemo(() => [
    { ticker: "005930", name: "삼성전자", price: 354000, change: -2.34, positive: false },
    { ticker: "000660", name: "SK하이닉스", price: 2764000, change: 2.94, positive: true },
    { ticker: "009150", name: "삼성전기", price: 2270000, change: 3.18, positive: true },
  ], []);

  const newsItems = useMemo(() => [
    { source: "연합뉴스", time: "1시간 전", title: `${localStock.name}, 분기 실적 시장 기대 상회...주가 부양 기대` },
    { source: "한국경제", time: "3시간 전", title: `${localStock.name} 관련주 급등세...수요 회복세 지속` },
    { source: "매일경제", time: "5시간 전", title: `"${localStock.name} 주가 목표가 상향" ...증권가 컨센서스 +15%` },
  ], [localStock.name]);

  const formatPrice = (p: number) => {
    if (p >= 10000) return `₩${Math.round(p).toLocaleString()}`;
    return `₩${p.toLocaleString()}`;
  };

  const changeStr = priceChange >= 0 ? `+${priceChange.toLocaleString()}` : `-${Math.abs(priceChange).toLocaleString()}`;
  const changePctStr = priceChangePercent >= 0 ? `+${priceChangePercent.toFixed(2)}%` : `${priceChangePercent.toFixed(2)}%`;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="link" onClick={onBack} className="flex items-center gap-1 text-[14px] p-0 h-auto flex-shrink-0 text-primary hover:text-primary/80 underline-offset-2">
             <ArrowLeft className="w-4 h-4" />
             포트폴리오
           </Button>
          <span className="text-muted-foreground flex-shrink-0">|</span>
          <span className="text-[12px] text-muted-foreground font-medium flex-shrink-0">{localStock.ticker}:KRX</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
         <Button variant="outline" onClick={() => setTradeModal(true)} size="sm" className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-primary border-border rounded-full h-auto hover:bg-muted">
             <ScrollText className="w-3.5 h-3.5" />
             매매 기록
           </Button>
           <Button variant="outline" size="sm" className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-primary border-border rounded-full h-auto hover:bg-muted">
             <Plus className="w-3.5 h-3.5" />
             목록에 추가
           </Button>
        </div>
      </div>

      {/* Top Tabs — visible at MOBILE/TABLET (vp < DESKTOP), hidden at DESKTOP+ */}
      {vp < BREAKPOINTS.DESKTOP && (
        <div className="flex items-center border-b border-border flex-shrink-0 bg-white">
          <button
            onClick={() => setActiveContentTab("개요")}
            className={`px-5 py-3 text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeContentTab === "개요" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {localStock.ticker}
          </button>
          <button
            onClick={() => setActiveContentTab("조사")}
            className={`px-5 py-3 text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeContentTab === "조사" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            조사
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto scroll-hide">
        <div className={`${vp >= BREAKPOINTS.TABLET ? "max-w-4xl mx-auto px-4" : "px-3"}`}>

          {/* Price Section */}
          <div className="py-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[16px] font-semibold text-foreground">{localStock.name}</span>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
              <span className="text-[32px] font-bold text-foreground tabular-nums">{formatPrice(localStock.price)}</span>
              <div className="flex items-center gap-1.5">
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-[#0E9E4B]" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-[#FF4B4B]" />
                )}
                <span className={`text-[14px] font-medium tabular-nums ${isPositive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>
                  {changeStr} ({changePctStr})
                </span>
              </div>
            </div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              6월 20일 장 마감
            </div>
          </div>

         {/* Chart Controls */}
           <div className="flex items-center gap-1.5 py-1.5 flex-wrap">
             <div className="relative group">
               <button
                 onClick={() => setChartType(chartType === "area" ? "line" : "area")}
                 className={`flex items-center gap-1 px-3 py-1.5 text-[12px] border rounded-full transition-all ${chartType === "area" || chartType === "candle" || chartType === "bar" ? "" : ""}`}
               >
                 {chartType === "area" ? (
                   <>
                     <span className={chartType === "area" ? "text-primary" : "text-muted-foreground"}>영역</span>
                     <ChevronDown className={`w-3 h-3 ${chartType === "area" ? "text-primary" : "text-muted-foreground"}`} />
                   </>
                 ) : chartType === "line" ? (
                   <>
                     <span className="text-primary">선형</span>
                     <ChevronDown className="w-3 h-3 text-primary" />
                   </>
                 ) : chartType === "candle" ? (
                   <>
                     <span className="text-primary">캔들</span>
                     <ChevronDown className="w-3 h-3 text-primary" />
                   </>
                 ) : (
                   <>
                     <span className="text-primary">막대</span>
                     <ChevronDown className="w-3 h-3 text-primary" />
                   </>
                 )}
               </button>
               {chartType !== "area" && (
                 <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-30 py-1 min-w-[100px]">
                   {[
                     { key: "area" as const, label: "영역" },
                     { key: "line" as const, label: "선형" },
                     { key: "candle" as const, label: "캔들" },
                     { key: "bar" as const, label: "막대" },
                   ].map(opt => (
                     <button key={opt.key} onClick={() => setChartType(opt.key)}
                       className={`w-full text-left px-3 py-2 text-[12px] hover:bg-muted transition-colors ${chartType === opt.key ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                       {opt.label}
                     </button>
                   ))}
                 </div>
               )}
             </div>
             <Button variant="outline" size="sm" className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border-border rounded-full h-auto hover:bg-muted">
                <Plus className="w-4 h-4" />
                금융 기관과 비교
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border-border rounded-full h-auto hover:bg-muted">
                기술 지표 선택
                <ChevronDown className="w-3 h-3" />
              </Button>
           </div>

          {/* Chart Area */}
          <div className="py-1">
            {renderChart()}
          </div>

          <div className="flex items-center justify-end py-0.5 pr-1">
            <span className="text-[12px] text-muted-foreground">
              전일 종가 ₩{prevClose.toLocaleString()}.00
            </span>
          </div>

          {/* Period Tabs */}
          <ToggleGroup
            value={[chartPeriod]}
            onValueChange={(v: string[]) => { const next = v[0]; if (next) setChartPeriod(next as typeof chartPeriod); }}
            className="flex items-center gap-0.5 py-2 overflow-x-auto scroll-hide"
          >
            {(["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "최대"] as const).map(p => (
              <ToggleGroupItem key={p} value={p} className="px-3 py-1 text-[12px] rounded-full whitespace-nowrap flex-shrink-0 text-muted-foreground data-[pressed]:bg-muted data-[pressed]:text-foreground data-[pressed]:font-medium">{p}</ToggleGroupItem>
            ))}
          </ToggleGroup>

          {/* Comparison Table */}
          <div className="py-2">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left py-2 pr-2 font-medium whitespace-nowrap">종목</th>
                  <th className="text-right py-2 px-2 font-medium whitespace-nowrap">가격</th>
                  <th className="text-right py-2 px-2 font-medium whitespace-nowrap">변동</th>
                  <th className="text-right py-2 pl-2 font-medium whitespace-nowrap">변동률(%)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="py-2.5 pr-2">
                    <div>
                      <div className="text-[14px] font-semibold text-foreground">{localStock.ticker}</div>
                      <div className="text-[11px] text-muted-foreground">{localStock.name}</div>
                    </div>
                  </td>
                  <td className="text-right py-2.5 px-2 tabular-nums text-foreground whitespace-nowrap font-medium">{formatPrice(localStock.price)}</td>
                  <td className={`text-right py-2.5 px-2 tabular-nums whitespace-nowrap font-medium ${isPositive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>{changeStr}</td>
                  <td className={`text-right py-2.5 pl-2 tabular-nums whitespace-nowrap font-medium ${isPositive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>{changePctStr}</td>
                </tr>
                {relatedStocks.map(rs => (
                  <tr key={rs.ticker} className="border-t border-border hover:bg-muted transition-colors">
                    <td className="py-2.5 pr-2 cursor-pointer">
                      <div>
                        <div className="text-[14px] font-semibold text-foreground">{rs.ticker}</div>
                        <div className="text-[11px] text-muted-foreground">{rs.name}</div>
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-2 tabular-nums text-foreground whitespace-nowrap">{formatPrice(rs.price)}</td>
                    <td className={`text-right py-2.5 px-2 tabular-nums whitespace-nowrap font-medium ${rs.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>{rs.positive ? "+" : ""}{rs.change}%</td>
                    <td className={`text-right py-2.5 pl-2 tabular-nums whitespace-nowrap font-medium ${rs.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>{rs.positive ? "+" : ""}{rs.change}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Tabs value={activeContentTab} onValueChange={(v) => setActiveContentTab(v as "개요" | "실적" | "금융" | "조사")} className="gap-0">
          {/* Content Tabs */}
          <TabsList variant="line" className="h-auto w-full justify-start gap-1 rounded-none border-b border-border p-0">
            {(["개요", "실적", "금융"] as const).map(tab => (
              <TabsTrigger key={tab} value={tab} className="flex-none rounded-none px-4 py-2.5 text-[14px] after:bg-primary">{tab}</TabsTrigger>
            ))}
            {vp >= BREAKPOINTS.TABLET && (
              <TabsTrigger value="조사" className="flex-none rounded-none px-4 py-2.5 text-[14px] after:bg-primary">조사</TabsTrigger>
            )}
          </TabsList>

          {/* Content Area */}
          <div className="py-4 pb-8">
            <TabsContent value="개요">
              <div className="space-y-6">
                {/* AI Insights Card */}
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-[#0E9E4B] flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">AI</span>
                    </div>
                    <span className="text-[13px] font-semibold text-foreground">AI 전망</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <ArrowUpRight className="w-4 h-4 text-[#0E9E4B] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[13px] font-medium text-foreground">상승세 전망</span>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {localStock.name}은 최근 AI 반도체 수요 증가와 메모리 가격 상승으로 인한 실적 개선 기대감이 작용하며 중기 상승세가 유지될 것으로 전망됩니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowDownRight className="w-4 h-4 text-[#FF4B4B] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[13px] font-medium text-foreground">하락세 전망</span>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          단기 과매수 구간 진입 가능성과 해외 시장 변동성 확대 시 조정 압력이 예상됩니다. 52주 최저가 부근에서 지지받는 모습입니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div>
                  <h3 className="text-[15px] font-bold text-foreground mb-3">핵심 지표</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden ring-1 ring-border/20">
                    {[
                      { label: "시가", value: `₩${formatPrice(localStock.price)}` },
                      { label: "고가", value: "₩362,500" },
                      { label: "저가", value: "₩352,000" },
                      { label: "시가총액", value: "₩427조" },
                      { label: "평균 거래량", value: "1,823만" },
                      { label: "거래량", value: "1,823만" },
                      { label: "배당금", value: "1.2%" },
                      { label: "분기 배당금", value: "₩350" },
                      { label: "배당락일", value: "2026. 5. 28." },
                      { label: "주가수익률", value: "28.4x" },
                      { label: "52주 최고가", value: "₩362,500" },
                      { label: "52주 최저가", value: "₩285,000" },
                      { label: "EPS", value: "₩12,450" },
                      { label: "유통 주식수", value: "12억" },
                      { label: "직원 수", value: "1만 8천명" },
                    ].map(m => (
                      <div key={m.label} className="bg-white p-3">
                        <div className="text-[11px] text-muted-foreground mb-0.5">{m.label}</div>
                        <div className="text-[14px] font-semibold text-foreground tabular-nums">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                 {/* Related Stocks */}
                <div>
                  <h3 className="text-[15px] font-bold text-foreground mb-3">관련 주식</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {relatedStocks.map(rs => (
                      <div key={rs.ticker} className="bg-white rounded-lg p-3 border border-border hover:bg-muted transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-medium text-foreground truncate">{rs.name}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{rs.ticker}</div>
                          </div>
                          <MiniChart data={generateSparklineData(rs.price, 20, 0.02, rs.price)} color={rs.positive ? "#0E9E4B" : "#FF4B4B"} small />
                        </div>
                        <div className="flex items-end justify-between mt-2 pt-2 border-t border-border/50">
                          <span className="text-[14px] font-medium text-foreground tabular-nums">{formatPrice(rs.price)}</span>
                          <span className={`text-[12px] font-medium tabular-nums ${rs.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>
                            {rs.positive ? "+" : ""}{rs.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* News Section */}
                <div>
                  <h3 className="text-[15px] font-bold text-foreground mb-3">뉴스</h3>
                  <ItemGroup className="divide-y divide-border">
                    {newsItems.map((item, idx) => (
                      <Item key={idx} className="cursor-pointer rounded-none px-3 hover:bg-muted">
                        <ItemMedia variant="icon" className="border border-border bg-white">
                          <Newspaper className="w-4 h-4 text-muted-foreground" />
                        </ItemMedia>
                        <ItemContent className="gap-1">
                          <ItemTitle className="text-[13px] leading-snug line-clamp-2">{item.title}</ItemTitle>
                          <ItemDescription className="text-[11px]">{item.source} · {item.time}</ItemDescription>
                        </ItemContent>
                      </Item>
                    ))}
                  </ItemGroup>
                </div>

                {/* Profile Section */}
                <div>
                  <h3 className="text-[15px] font-bold text-foreground mb-3">프로필</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    {localStock.name}은 반도체 메모리 및 시스템 LSI 사업을 영위하는 대한민국의 대표 반도체 기업입니다.
                    DDR, LPDDR, NAND 플래시 메모리 등 다양한 메모리 반도체를 생산하며, AI 시대에 핵심적인 데이터센터 및 HBM 시장에서도 주도적 입지를 확보하고 있습니다.
                    본사는 경기도 화성시에 위치하며, 전 세계적으로 50개 이상의 영업소를 운영하고 있습니다.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-0.5 text-[11px] bg-primary/10 text-primary rounded-full">반도체</span>
                    <span className="px-2 py-0.5 text-[11px] bg-primary/10 text-primary rounded-full">메모리</span>
                    <span className="px-2 py-0.5 text-[11px] bg-primary/10 text-primary rounded-full">KOSPI</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="실적">
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <span className="text-[20px]">📊</span>
                </div>
                <div className="text-[15px] font-semibold text-foreground mb-1">실적 데이터</div>
                <p className="text-[13px] text-muted-foreground">
                  {localStock.name}의 재무 제표 및 실적 정보가 여기에 표시됩니다.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  {[
                    { period: "2026 Q1", revenue: "₩6.8조", profit: "₩1.2조" },
                    { period: "2025 Q4", revenue: "₩6.5조", profit: "₩1.1조" },
                    { period: "2025 Q3", revenue: "₩6.2조", profit: "₩9,800억" },
                    { period: "2025 Q2", revenue: "₩5.9조", profit: "₩8,500억" },
                  ].map(q => (
                    <div key={q.period} className="bg-muted/50 rounded-lg p-3 text-left">
                      <div className="text-[12px] font-semibold text-foreground mb-1">{q.period}</div>
                      <div className="text-[11px] text-muted-foreground">매출 <span className="text-foreground font-medium">{q.revenue}</span></div>
                      <div className="text-[11px] text-muted-foreground">이익 <span className="text-[#0E9E4B] font-medium">{q.profit}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="금융">
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <span className="text-[20px]">🏦</span>
                </div>
                <div className="text-[15px] font-semibold text-foreground mb-1">금융 데이터</div>
                <p className="text-[13px] text-muted-foreground">
                  {localStock.name}의 기관/외인 동향 및 금융 정보가 여기에 표시됩니다.
                </p>
                <div className="mt-4 max-w-sm mx-auto space-y-2">
                  {[
                    { label: "기관 순매수", value: "₩1,250억", positive: true },
                    { label: "외인 순매수", value: "₩890억", positive: true },
                    { label: "개인 순매수", value: "₩-2,140억", positive: false },
                    { label: "거시경제 지표", value: "금리 3.5%", positive: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-[13px] text-muted-foreground">{item.label}</span>
                      <span className={`text-[13px] font-semibold tabular-nums ${item.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
          </Tabs>
        </div>
      </div>

      {/* Trade Modal — accessible via "매매 기록" button in header */}
      {tradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setTradeModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-[90vw] max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-foreground">
                {tradeType === "buy" ? "매수" : "매도"} 기록
              </h3>
              <button onClick={() => setTradeModal(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleTradeSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">종목</label>
                <div className="w-full p-2.5 bg-muted border border-border rounded-xl text-[13px] text-muted-foreground">
                  {localStock.name} ({localStock.ticker})
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">날짜</label>
                <input
                  type="date"
                  value={tradeDate}
                  onChange={(e) => setTradeDate(e.target.value)}
                  className="w-full p-2.5 border border-border rounded-xl text-[13px] focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">수량</label>
                <input
                  type="number"
                  min="1"
                  value={tradeQty || ""}
                  onChange={(e) => setTradeQty(Number(e.target.value))}
                  placeholder="주수 입력"
                  className="w-full p-2.5 border border-border rounded-xl text-[13px] font-mono focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">단가 (₩)</label>
                <input
                  type="number"
                  min="1"
                  value={tradePrice || ""}
                  onChange={(e) => setTradePrice(Number(e.target.value))}
                  placeholder="1주당 금액"
                  className="w-full p-2.5 border border-border rounded-xl text-[13px] font-mono focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setTradeModal(false)}
                  className="px-4 py-2 text-[12px] font-semibold text-muted-foreground bg-muted rounded-xl hover:bg-border transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-[12px] font-bold text-white rounded-xl transition-colors ${
                    tradeType === "buy" ? "bg-destructive hover:bg-destructive/80" : "bg-primary hover:bg-primary/80"
                  }`}
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export function NavigationPanel({ mobile, open, onClose, centerBounds, sidebarMode: sidebarModeProp, setSidebarMode: setSidebarModeProp, sidebarWidth, onPortfolioClick, onStockClick, wrapperMargin }: { mobile?: boolean; open?: boolean; onClose?: () => void; centerBounds?: { left: number; right: number }; sidebarMode?: "minimized" | "hover" | "normal" | "expanded"; setSidebarMode?: (mode: "minimized" | "hover" | "normal" | "expanded") => void; sidebarWidth?: number; onPortfolioClick?: () => void; onStockClick?: (stock: { ticker: string; name: string; price: number; qty: number; dailyProfit: number; dailyProfitPercent: number; positive: boolean; totalAmount: number; transactions: Array<{ id: string; date: string; type: "매수" | "매도"; buyPrice: number; qty: number; profit: number; profitPercent: number; positive: boolean; total: number }> }) => void; wrapperMargin?: number }) {
  type Mode = "minimized" | "hover" | "normal" | "expanded";
  const [sidebarModeInternal, setSidebarModeInternal] = useState<Mode>(mobile ? "normal" : "minimized");
  const sidebarMode = sidebarModeProp ?? sidebarModeInternal;
  const setSidebarMode = setSidebarModeProp ?? setSidebarModeInternal;
  const [isWide, setIsWide] = useState(false);
  const isWideRef = useRef(false);
  isWideRef.current = isWide;
  const wasTabletRef = useRef(false);
  const [sectorsOpen, setSectorsOpen] = useState(true);
  const [portfolioOpen, setPortfolioOpen] = useState(true);
  const [watchlistOpen, setWatchlistOpen] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const sectorSparkData = sectorIndices.map(s => ({
    name: s.name, data: useDeterministicSparkline(s.basePrice),
    color: s.positive ? "#0E9E4B" : "#FF4B4B",
  }));
  const watchlistSparkData = watchlistStocks.map(s => ({
    name: s.name, data: useDeterministicSparkline(s.basePrice),
    color: s.positive ? "#0E9E4B" : "#FF4B4B",
  }));
  const portfolioSummary = { invested: "$19,653,380", dailyChangePercent: "+2.36%", positive: true };
  const portfolioSparkData = useDeterministicSparkline(19653380);

  const sidebarRef = useRef(sidebarMode);
  sidebarRef.current = sidebarMode;

  useEffect(() => {
    const vp = window.innerWidth;
    setIsWide(vp >= BREAKPOINTS.WIDE);
    wasTabletRef.current = vp >= BREAKPOINTS.TABLET;
    if (!mobile && vp >= BREAKPOINTS.TABLET && sidebarMode === "minimized") {
      setSidebarMode("normal");
    }
    const handleResize = () => {
      const vp = window.innerWidth;
      const nowWide = vp >= BREAKPOINTS.WIDE;
      const prevWide = isWideRef.current;
      setIsWide(nowWide);
      const prevTablet = wasTabletRef.current;
      const nowTablet = vp >= BREAKPOINTS.TABLET;
      wasTabletRef.current = nowTablet;
      if (!mobile) {
        if (nowWide !== prevWide && nowWide && (sidebarRef.current === "minimized" || sidebarRef.current === "hover")) {
          setSidebarMode("normal");
        }
        if (nowTablet !== prevTablet) {
          if (nowTablet && (sidebarRef.current === "minimized" || sidebarRef.current === "hover")) setSidebarMode("normal");
          else if (!nowTablet && sidebarRef.current === "normal") setSidebarMode("minimized");
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobile]);

  const isExpandedMode = sidebarMode === "expanded";
  const isOpen = sidebarMode === "hover" || sidebarMode === "normal" || sidebarMode === "expanded";

  let sidebarClasses = "";
   let sidebarStyle: React.CSSProperties = {};
   if (sidebarMode === "expanded") {
     sidebarClasses = "z-50 shadow-xl fixed top-[64px] bottom-0";
     if (mobile) {
       sidebarStyle = { width: "80vw", maxWidth: "1100px", left: 0 };
     } else {
       const margin = wrapperMargin ?? 0;
       const expandedWidth = sidebarWidth && sidebarWidth > 0 ? sidebarWidth : 232;
       sidebarStyle = { width: expandedWidth, maxWidth: "1100px", left: margin };
     }
    } else if (sidebarMode === "hover") {
      sidebarClasses = "z-40 shadow-xl fixed top-[64px] left-0 bottom-0";
      sidebarStyle = { width: 340 };
    } else if (sidebarMode === "minimized") {
      sidebarClasses = "z-40 shadow-xl fixed top-[64px] left-0 bottom-0";
      sidebarStyle = { width: 80 };
    } else {
      sidebarStyle = { width: sidebarWidth ?? 272 };
    }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) setOptionsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMouseEnter = () => {
    if (mobile) return;
    if (hoverTimeoutRef.current) { clearTimeout(hoverTimeoutRef.current); hoverTimeoutRef.current = null; }
    if (sidebarMode === "minimized") setSidebarMode("hover");
  };

  const handleMouseLeave = () => {
    if (mobile) return;
    if (sidebarMode === "hover") {
      hoverTimeoutRef.current = setTimeout(() => { setSidebarMode("minimized"); hoverTimeoutRef.current = null; }, 300);
    }
  };

  const cycleMode = () => {
    if (mobile) return;
    if (hoverTimeoutRef.current) { clearTimeout(hoverTimeoutRef.current); hoverTimeoutRef.current = null; }
    if (sidebarMode === "expanded") setSidebarMode("normal");
    else if (sidebarMode === "normal") setSidebarMode("minimized");
    else setSidebarMode("normal");
  };

  return (<>{mobile && open && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} />}
<aside className={`${mobile ? "fixed md:hidden top-[64px] bottom-0 left-0 z-50 transition-all duration-200" : ""} ${sidebarClasses} flex-col border-r border-border bg-white overflow-y-auto scroll-hide flex-shrink-0 lg:pb-0 pb-[80px]`}
  onMouseEnter={mobile ? undefined : handleMouseEnter}
  onMouseLeave={mobile ? undefined : handleMouseLeave}
  style={mobile ? { transform: open ? "translateX(0)" : "translateX(-100%)" } : sidebarStyle}
>
  {/* Navigation Panel Header */}
  {!isOpen ? (
    <>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <span
          className="text-[20px] font-semibold text-foreground cursor-pointer"
          onClick={cycleMode}
          role="heading"
          aria-level={1}
        >
          목록
        </span>
      </div>
      <div className="flex flex-col items-stretch py-4 px-2 gap-4">
        {/* Portfolio summary in collapsed mode */}
        <div className="text-center cursor-pointer" onClick={onPortfolioClick}>
          <div className="text-[12px] text-muted-foreground font-medium mb-1">투자중</div>
          <div className="text-[14px] text-foreground font-bold mb-0.5">$19.6M</div>
          <div className={`flex items-center justify-center gap-0.5 text-[14px] font-semibold ${portfolioSummary.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>
            {portfolioSummary.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}{portfolioSummary.dailyChangePercent}
          </div>
        </div>
        <div className="border-t border-border pt-2.5 space-y-2">
          {watchlistStocks.map(s => (
            <SimpleStockNav
              key={s.name}
              item={{ ...s, fullName: s.fullName }}
              index={watchlistStocks.indexOf(s)}
              sparkData={watchlistSparkData}
              onStockClick={() => onStockClick?.({
                ticker: s.name, name: s.fullName, price: s.basePrice, qty: 0,
                dailyProfit: 0, dailyProfitPercent: parseFloat(s.change),
                positive: s.positive, totalAmount: 0, transactions: [],
              })}
            />
          ))}
        </div>
        <div className="border-t border-border pt-2.5 space-y-1.5">
          {sectorIndices.slice(0, 5).map(s => (
            <SimpleStockNav
              key={s.name}
              item={{ ...s, fullName: s.fullName }}
              index={sectorIndices.indexOf(s)}
              sparkData={sectorSparkData}
              onStockClick={() => onStockClick?.({
                ticker: s.name, name: s.fullName, price: s.basePrice, qty: 0,
                dailyProfit: 0, dailyProfitPercent: parseFloat(s.change),
                positive: s.positive, totalAmount: 0, transactions: [],
              })}
            />
          ))}
        </div>
      </div>
    </>
  ) : (
    <>
      <SectionHeader
        title="목록"
        rightButtons={[
          <Button key="dropdown" variant="ghost" size="icon" aria-label="목록 선택">
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>,
          <Button key="newList" variant="ghost" size="icon" className="p-2" aria-label="새 목록"><Plus className="w-4 h-4 text-muted-foreground" /></Button>,
          <Button key="expand" variant="ghost" size="icon" className="p-2" onClick={cycleMode} aria-label={sidebarMode === "expanded" ? "축소" : sidebarMode === "normal" ? "접기" : "펼치기"}>
            {sidebarMode === "expanded" ? <Minimize2 className="w-4 h-4 text-muted-foreground" /> : <Maximize2 className="w-4 h-4 text-muted-foreground" />}
          </Button>
        ]}
      />


  {/* Content */}
      {/* Portfolio Section */}
      <ListNavigation title="포트폴리오" isOpen={portfolioOpen} onToggleOpen={() => setPortfolioOpen(!portfolioOpen)}>
        <div className="cursor-pointer hover:bg-muted transition-colors rounded" aria-label="투자중" onClick={onPortfolioClick}>
          <div className="text-[12px] text-muted-foreground mb-0.5">투자중</div>
          <div className="text-[16px] font-bold text-foreground mb-0.5">$19,653,380.00</div>
          <div className="flex items-center gap-0.5 text-[14px] text-[#0E9E4B]">
            <ArrowUpRight className="w-3.5 h-3.5" />+$453,120.00 (+2.36%)
          </div>
        </div>
      </ListNavigation>

      {/* Watchlist Section */}
      <ListNavigation 
        title="관심 목록" 
        isOpen={watchlistOpen} 
        onToggleOpen={() => setWatchlistOpen(!watchlistOpen)}
        rightButtons={[
          <Button key="info" variant="ghost" size="icon" className="transition duration-200 opacity-0 group-hover:opacity-100" aria-label="info" onMouseEnter={() => setInfoVisible(true)} onMouseLeave={() => setInfoVisible(false)}>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>,
          <Button key="edit" variant="ghost" size="icon" className="transition duration-200 opacity-0 group-hover:opacity-100" aria-label="관심 목록 목록 옵션" onClick={() => setOptionsOpen(!optionsOpen)}>
            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>,
          <Button key="add" variant="ghost" size="icon" aria-label="관심 목록 목록에 종목 코드 추가">
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        ]}
      >
        {isExpandedMode ? (
          watchlistOpen && (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] min-w-[500px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-[12px]">
                    <th className="text-left py-1.5 pl-4 pr-1 font-medium whitespace-nowrap"><span className="text-[9px] mr-0.5">▲</span>종목 코드</th>
                    <th className="py-1.5 px-1 font-medium text-center whitespace-nowrap">추세</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">가격</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">변동</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">변동률(%)</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">전일 종가</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">시가</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">고가</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">저가</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">거래량</th>
                    <th className="text-right py-1.5 pr-4 pl-1 font-medium whitespace-nowrap">시가총액</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistStocks.map((s, idx) => (
                    <tr key={s.name} onClick={() => onStockClick?.({
                      ticker: s.name, name: s.fullName, price: s.basePrice, qty: 0,
                      dailyProfit: 0, dailyProfitPercent: parseFloat(s.change),
                      positive: s.positive, totalAmount: 0, transactions: [],
                    })}
                    className="border-b border-border hover:bg-muted cursor-pointer transition-colors">
                      <td className="py-1.5 pl-4 pr-1"><div className="text-[14px] font-semibold text-foreground">{s.name}</div><div className="text-[9px] text-muted-foreground leading-tight truncate">{s.fullName}</div></td>
                      <td className="py-1.5 px-1 align-middle"><MiniChart data={watchlistSparkData[idx].data} color={watchlistSparkData[idx].color} prevClose={watchlistSparkData[idx].data[0]} /></td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-foreground text-[14px] whitespace-nowrap">{formatPrice(s.price)}</td>
                      <td className={`text-right py-1.5 px-1 tabular-nums whitespace-nowrap ${s.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>{s.positive ? "+" : ""}{s.change}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground whitespace-nowrap">{s.change}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.prevClose || "—"}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.open || "—"}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.high || "—"}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.low || "—"}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.volume || "—"}</td>
                      <td className="text-right py-1.5 pr-4 pl-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.mktCap || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          watchlistOpen && (
            <>
              {watchlistStocks.map((s, idx) => (
                <SimpleStockNav 
                  key={s.name} 
                  item={{ ...s, fullName: s.fullName }} 
                  index={idx} 
                  sparkData={watchlistSparkData} 
                  onStockClick={() => onStockClick?.({
                    ticker: s.name, name: s.fullName, price: s.basePrice, qty: 0,
                    dailyProfit: 0, dailyProfitPercent: parseFloat(s.change),
                    positive: s.positive, totalAmount: 0, transactions: [],
                  })} 
                />
              ))}
            </>
          )
        )}
      </ListNavigation>

      {/* Sector Section */}
      <ListNavigation title="주식 업종" isOpen={sectorsOpen} onToggleOpen={() => setSectorsOpen(!sectorsOpen)}>
        {isExpandedMode ? (
          sectorsOpen && (
              <table className="w-full text-[12px] min-w-[500px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-[12px]">
                    <th className="text-left py-1.5 pl-4 pr-1 font-medium whitespace-nowrap"><span className="text-[9px] mr-0.5">▲</span>종목 코드</th>
                    <th className="py-1.5 px-1 font-medium text-center whitespace-nowrap">추세</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">가격</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">변동</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">변동률(%)</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">전일 종가</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">시가</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">고가</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">저가</th>
                    <th className="text-right py-1.5 px-1 font-medium whitespace-nowrap">거래량</th>
                    <th className="text-right py-1.5 pr-4 pl-1 font-medium whitespace-nowrap">시가총액</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorIndices.map((s, idx) => (
                    <tr key={s.name} onClick={() => onStockClick?.({
                      ticker: s.name, name: s.fullName, price: s.basePrice, qty: 0,
                      dailyProfit: 0, dailyProfitPercent: parseFloat(s.change),
                      positive: s.positive, totalAmount: 0, transactions: [],
                    })}
                    className="border-b border-border hover:bg-muted cursor-pointer transition-colors" aria-label={s.fullName}>
                      <td className="py-1.5 pl-4 pr-1"><div className="text-[14px] font-semibold text-foreground">{s.name}</div><div className="text-[9px] text-muted-foreground leading-tight">{s.fullName}</div></td>
                      <td className="py-1.5 px-1 align-middle"><MiniChart data={sectorSparkData[idx].data} color={sectorSparkData[idx].color} prevClose={sectorSparkData[idx].data[0]} /></td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-foreground text-[14px] whitespace-nowrap">{formatPrice(s.price)}</td>
                      <td className={`text-right py-1.5 px-1 tabular-nums whitespace-nowrap ${s.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>{s.changeVal}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground whitespace-nowrap">{s.change}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.prevClose || "—"}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.open || "—"}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.high || "—"}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.low || "—"}</td>
                      <td className="text-right py-1.5 px-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.volume || "—"}</td>
                      <td className="text-right py-1.5 pr-4 pl-1 tabular-nums text-muted-foreground text-[12px] whitespace-nowrap">{s.mktCap || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )
        ) : (
          sectorsOpen && (
            <>
              {sectorIndices.map((s, idx) => (
                <SimpleStockNav 
                  key={s.name} 
                  item={{ ...s, fullName: s.fullName }} 
                  index={idx} 
                  sparkData={sectorSparkData} 
                  onStockClick={() => onStockClick?.({
                    ticker: s.name, name: s.fullName, price: s.basePrice, qty: 0,
                    dailyProfit: 0, dailyProfitPercent: parseFloat(s.change),
                    positive: s.positive, totalAmount: 0, transactions: [],
                  })} 
                />
              ))}
            </>
          )
        )}
      </ListNavigation>
    </>
  )}
</aside>
  </>
);
}

const posColor = "#D32F2F";
const negColor = "#1976D2";


export function ResearchPanel({ centerBounds, expanded, setExpanded, collapsedWidth, embedded, initialQuestion, initialQuestionId, wrapperMargin, rightW, onClose }: { centerBounds?: { left: number; right: number }; expanded?: boolean; setExpanded?: (v: boolean) => void; collapsedWidth?: number; embedded?: boolean; initialQuestion?: string; initialQuestionId?: number; wrapperMargin?: number; rightW?: number; onClose?: () => void }) {
  const [showHistory, setShowHistory] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; time: string }[]>([]);
  const [expandedMsgs, setExpandedMsgs] = useState<Set<number>>(new Set());
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
    <div ref={panelRef} className="flex flex-col flex-1 min-h-0 bg-white">
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
            <h2 className="text-[20px] font-semibold text-foreground" role="heading" aria-label="조사">조사</h2>
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
              <div className="text-[14px] text-foreground mb-5 leading-relaxed"><span className="font-medium">JIHOON</span>님, 안녕하세요. 금융 관련 질문을 해 보세요.</div>
              <div className="space-y-2 mb-6">
                {["오늘 시장 현황이 어떤가요?", "왜 한국 KOSPI 지수가 9,000포인트를 돌파했나요?", "일본은행의 금리 인상이 Nikkei 225에 미치는 영향은 무엇인가요?"].map((q, i) => (
                  <div key={i} onClick={() => handleSend(q)} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:bg-muted cursor-pointer transition-colors">
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
              <style>{`.chat-scrollbar::-webkit-scrollbar { width: 15px; } .chat-scrollbar::-webkit-scrollbar-track { background: transparent; } .chat-scrollbar::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 8px; border: 3px solid transparent; background-clip: content-box; } .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #bdc1c6; background-clip: content-box; }`}</style>
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

          {/* Input area */}
          {/* Input area — hidden in embedded mode (floating bar provides input) */}
          {!showHistory && !isEmbedded && (
            <div className="border-t border-border px-4 py-3 flex-shrink-0">
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
    <aside ref={panelRef} className={`${isExpanded ? "fixed top-[64px] bottom-0 z-[100] shadow-2xl" : "hidden min-[936px]:flex flex-shrink-0 self-stretch h-full"} flex-col border-l border-border bg-white transition-all duration-300`}
        style={isExpanded ? { width: rightW ?? 235, right: wrapperMargin ?? 0 } : { width: collapsedWidth ?? 344 }}>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between pl-6 pr-5 py-3 border-b border-border flex-shrink-0">
          <h2 className="text-[20px] font-semibold text-foreground" role="heading" aria-label="조사">조사</h2>
          <div className="flex items-center gap-0.5">
            <button onClick={() => { setMessages([]); setExpandedMsgs(new Set()); setShowHistory(false); }} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="새 대화목록"><PenSquare className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={() => setShowHistory(!showHistory)} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="대화목록 기록"><ScrollText className="w-4 h-4 text-muted-foreground" /></button>
            {isExpanded ? (
              <button onClick={() => setIsExpanded(false)} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="접기"><X className="w-4 h-4 text-muted-foreground" /></button>
            ) : (
              <>
                <button onClick={() => onClose?.()} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="닫기"><X className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => setIsExpanded(true)} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="펼치기"><Maximize2 className="w-4 h-4 text-muted-foreground" /></button>
              </>
            )}
          </div>
        </div>

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
            <div className="text-[14px] text-foreground mb-5 leading-relaxed"><span className="font-medium">JIHOON</span>님, 안녕하세요. 금융 관련 질문을 해 보세요.</div>
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
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <style>{`.chat-scrollbar::-webkit-scrollbar { width: 15px; } .chat-scrollbar::-webkit-scrollbar-track { background: transparent; } .chat-scrollbar::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 8px; border: 3px solid transparent; background-clip: content-box; } .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #bdc1c6; background-clip: content-box; }`}</style>
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

      <div className="border-t border-border pl-6 pr-4 py-3 flex-shrink-0">
           <div className="bg-muted rounded-3xl pl-5 pr-4 pt-4 pb-2 focus-within:ring-1 focus-within:ring-ring/50 transition-shadow">
            <Textarea placeholder="질문하기" aria-label="질문하기" value={queryText} onChange={(e) => setQueryText(e.target.value)} onKeyDown={handleKeyDown} className="min-h-0 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground text-[14px]" style={{ fieldSizing: "fixed", overflow: "hidden", resize: "none" }} rows={4} />
            <div className="flex items-center justify-between mt-3">
              <Button variant="ghost" size="icon" aria-label="도구 추가"><Plus className="w-4 h-4 text-muted-foreground" /></Button>
              <Button size="icon" aria-label="AI에 질문하기" disabled={!queryText.trim()} onClick={() => { handleSend(); }} className={queryText.trim() ? "bg-foreground text-white hover:bg-foreground/80 hover:text-white" : ""}><span className="text-lg leading-none">↑</span></Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Search Dropdown Data ─────────────────────────────────────────────────────
export const searchStockSuggestions = [
  { ticker: "005930", name: "삼성전자", price: "₩354,000", change: "-2.34%", positive: false },
  { ticker: "000660", name: "SK하이닉스", price: "₩2,764,000", change: "+2.94%", positive: true },
  { ticker: "329180", name: "HD현대중공업", price: "₩667,000", change: "-2.49%", positive: false },
  { ticker: "006800", name: "미래에셋증권", price: "₩48,750", change: "-3.85%", positive: false },
  { ticker: "009150", name: "삼성전기", price: "₩2,270,000", change: "+3.18%", positive: true },
  { ticker: "AAPL", name: "Apple Inc.", price: "$218.45", change: "+1.23%", positive: true },
  { ticker: "NVDA", name: "NVIDIA", price: "$210.69", change: "+2.95%", positive: true },
  { ticker: "TSLA", name: "Tesla", price: "$412.50", change: "-1.82%", positive: false },
  { ticker: "MSFT", name: "Microsoft", price: "$542.30", change: "+0.87%", positive: true },
  { ticker: "GOOGL", name: "Alphabet", price: "$178.92", change: "+1.45%", positive: true },
];

export const searchAiPrompts = [
  { icon: "Globe", label: "Deep Search", description: "웹 검색으로 시장 분석" },
  { icon: "Brain", label: "AI 리포트 생성", description: "종목 AI 분석 리포트" },
  { icon: "TrendingUp", label: "시장 현황 분석", description: "오늘 시장 동향 요약" },
  { icon: "BarChart3", label: "포트폴리오 분석", description: "내 투자 포트폴리오 점검" },
];


export const footerTickerSuggestions = [
  { id: "005930", label: "삼성전자", exchange: "KRX", price: "₩354,000.00", change: "-2.34%", positive: false, type: "stock" },
  { id: "000660", label: "SK하이닉스", exchange: "KRX", price: "₩2,764,000.00", change: "+2.94%", positive: true, type: "stock" },
  { id: "SPY", label: "S&P 500", exchange: "NYSE", price: "$542.50", change: "-0.35%", positive: false, type: "index" },
  { id: "NVDA", label: "NVIDIA", exchange: "NASDAQ", price: "$210.69", change: "+2.95%", positive: true, type: "stock" },
  { id: "QQQ", label: "Invesco QQQ", exchange: "NASDAQ", price: "$485.20", change: "+1.12%", positive: true, type: "index" },
  { id: "KOSPI", label: "코스피", exchange: "KRX", price: "2,745.83", change: "-0.45%", positive: false, type: "index" },
  { id: "TSLA", label: "Tesla", exchange: "NASDAQ", price: "$348.50", change: "+4.23%", positive: true, type: "stock" },
  { id: "005380", label: "현대차", exchange: "KRX", price: "₩245,000", change: "+1.03%", positive: true, type: "stock" },
];

export function FooterInput({ searchQuery, setSearchQuery, onSubmit }: { searchQuery: string; setSearchQuery: (v: string) => void; onSubmit?: (text: string) => void }) {
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [stockFilter, setStockFilter] = useState<"all" | "stock" | "index">("all");
  const hasValue = inputText.trim().length > 0;

  const filtered = inputText.trim()
    ? footerTickerSuggestions
        .filter(s => s.id.includes(inputText) || s.label.includes(inputText))
        .slice(0, 5)
    : [];
  const displayResults = stockFilter === "all" ? filtered : filtered.filter(s => s.type === stockFilter);

  const stockList = footerTickerSuggestions
    .filter(s => stockFilter === "all" ? true : s.type === stockFilter)
    .slice(0, 2);

  const handleSelectQuestion = (q: string) => {
    setInputText(q);
    setIsFocused(false);
  };

  return (
    <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white to-transparent px-4 pt-6 pb-4">
      <div className="max-w-[560px] mx-auto relative">
        {isFocused && (
          <div className="absolute bottom-full left-0 right-0 mb-3 bg-white border border-border rounded-2xl shadow-xl max-h-[70vh] overflow-y-auto p-4 flex flex-col gap-4">
            {!hasValue ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[11px] font-bold text-muted-foreground/75 px-1">인기 질문</h3>
                  {["오늘 시장 현황이 어떤가요?", "S&P 500과 다우존스 산업평균지수 비교"].map((q, i) => (
                    <button key={i} onClick={() => handleSelectQuestion(q)}
                      className="w-full text-left px-3 py-2 text-[13px] text-foreground hover:bg-muted rounded-xl flex items-center gap-2 transition-colors">
                      <span className="text-muted-foreground">💡</span> {q}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[11px] font-bold text-muted-foreground/75 px-1">AI로 자세히 알아보기</h3>
                  <div className="w-full text-left px-3 py-2 text-[13px] text-primary bg-primary/10/50 rounded-xl flex items-center gap-2">
                    <span>✨</span> 관심 목록에 대한 최신 통계
                  </div>
                </div>
                {/* Stock list section */}
                <div className="flex flex-col gap-2 border-t border-border pt-3">
                  <div className="flex gap-1.5 overflow-x-auto">
                    {(["all", "stock", "index"] as const).map(tab => (
                      <button key={tab} onClick={() => setStockFilter(tab)}
                        className={`px-3 py-1 text-[12px] font-medium rounded-full cursor-pointer whitespace-nowrap transition-colors ${stockFilter === tab ? 'bg-foreground text-white' : 'bg-muted text-muted-foreground hover:bg-border'}`}>
                        {tab === "all" ? "모두" : tab === "stock" ? "주식" : "인덱스"}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col divide-y divide-border">
                    {stockList.map(s => (
                      <div key={s.id} className="py-2 flex justify-between items-center cursor-pointer hover:bg-muted px-2 rounded-lg transition-colors">
                        <div className="text-left">
                          <span className="block text-[13px] font-bold text-foreground">{s.id}</span>
                          <span className="block text-[11px] text-muted-foreground">{s.label} · {s.exchange}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[13px] font-medium text-foreground">{s.price}</span>
                          <span className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${s.positive ? 'text-destructive' : 'text-primary'}`}>
                            {s.positive ? '▲' : '▼'} {s.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5 overflow-x-auto">
                  {(["all", "stock", "index"] as const).map(tab => (
                    <button key={tab} onClick={() => setStockFilter(tab)}
                      className={`px-3 py-1 text-[12px] font-medium rounded-full cursor-pointer whitespace-nowrap transition-colors ${stockFilter === tab ? 'bg-foreground text-white' : 'bg-muted text-muted-foreground hover:bg-border'}`}>
                      {tab === "all" ? "모두" : tab === "stock" ? "주식" : "인덱스"}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col divide-y divide-border">
                  {displayResults.length > 0
                    ? displayResults.map(s => (
                      <div key={s.id} className="py-2.5 flex justify-between items-center cursor-pointer hover:bg-muted px-2 rounded-lg transition-colors">
                        <div className="text-left">
                          <span className="block text-[13px] font-bold text-foreground">{s.id}</span>
                          <span className="block text-[11px] text-muted-foreground">{s.label} · {s.exchange}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[13px] font-medium text-foreground">{s.price}</span>
                          <span className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${s.positive ? 'text-destructive' : 'text-primary'}`}>
                            {s.positive ? '▲' : '▼'} {s.change}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="py-4 text-center text-[13px] text-muted-foreground">검색 결과가 없습니다</div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="w-full bg-muted/80 border border-border rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
          <span className="text-lg text-primary shrink-0">✨</span>
          <Textarea value={inputText} onChange={e => setInputText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && hasValue && onSubmit) { e.preventDefault(); onSubmit(inputText); setInputText(''); setIsFocused(false); } }}
            rows={1} placeholder="이 내용에 관해 질문하거나 검색하세요"
            className="bg-transparent text-[14px] text-foreground outline-none resize-none max-h-32 leading-relaxed placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-[14px] border transition-colors ${isDeepSearch ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border text-muted-foreground'}`}
              title="도구 추가">{isDeepSearch ? '🔍' : '+'}</button>
            {isMenuOpen && (
              <div className="absolute bottom-full right-0 mb-10 w-48 bg-white border border-border rounded-xl shadow-xl p-1 z-50">
                <button onClick={() => { setIsDeepSearch(!isDeepSearch); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[13px] rounded-lg hover:bg-muted flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">🌐 Deep Search 모드</span>
                  <span className="text-[10px] text-muted-foreground">8~10분 내 리서치 보고서 생성</span>
                </button>
              </div>
            )}
            <button disabled={!hasValue} onClick={() => { if (hasValue && onSubmit) { onSubmit(inputText); setInputText(''); setIsFocused(false); } }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold transition-all ${hasValue ? 'bg-primary shadow-sm' : 'bg-muted cursor-not-allowed'}`}
              title="AI에 질문하기">➔</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Treemap visualization component */
function VizTreemap({ data }: { data: Array<{ ticker: string; name: string; price: number; qty: number; totalAmount: number; dailyProfit: number; dailyProfitPercent: number; positive: boolean }> }) {
  const [hovered, setHovered] = useState<any>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const total = data.reduce((s: number, a: any) => s + a.totalAmount, 0);

  const colorClass = (pct: number, pos: boolean) => {
    if (pct <= -3) return 'bg-[#5B92E5]';
    if (pct <= -2) return 'bg-[#84B0F2]';
    if (pct <= -1) return 'bg-[#D2E3FC]';
    if (pct < 0) return 'bg-[#E0E0E0]';
    if (pct === 0) return 'bg-[#E0E0E0]';
    if (pct < 1) return 'bg-[#F9B7B1]';
    if (pct < 2) return 'bg-[#F28B82]';
    return 'bg-[#EA4335]';
  };

  // Sort by totalAmount descending for treemap layout
  const sorted = [...data].sort((a, b) => b.totalAmount - a.totalAmount);
  const main = sorted[0];
  const rest = sorted.slice(1);
  const restTotal = rest.reduce((s, a) => s + a.totalAmount, 0);

  return (
    <div className="relative">
      <div className="w-full flex gap-1.5" style={{ height: 360 }}>
        {/* Main tile */}
        <div style={{ flex: main.totalAmount / total * 100 }}
          onMouseEnter={(e) => { setHovered(main); setPos({ x: e.clientX + 12, y: e.clientY + 12 }); }}
          onMouseMove={(e) => setPos({ x: e.clientX + 12, y: e.clientY + 12 })}
          onMouseLeave={() => setHovered(null)}
          className={`h-full ${colorClass(main.dailyProfitPercent, main.positive)} rounded-xl flex flex-col items-center justify-center cursor-pointer hover:brightness-95 transition-all`}>
          <span className="text-3xl font-bold text-white/90 drop-shadow-sm">{main.ticker}</span>
          <span className="text-sm font-bold text-white/70 mt-0.5">{main.positive ? '+' : ''}{main.dailyProfitPercent}%</span>
        </div>
        {/* Side tiles */}
        <div style={{ flex: (total - main.totalAmount) / total * 100 }} className="h-full flex flex-col gap-1.5">
          {rest.length <= 2 ? (
            <div className="flex flex-col h-full gap-1.5">
              {rest.map(a => (
                <div key={a.ticker} style={{ flex: a.totalAmount / restTotal * 100 }}
                  onMouseEnter={(e) => { setHovered(a); setPos({ x: e.clientX + 12, y: e.clientY + 12 }); }}
                  onMouseMove={(e) => setPos({ x: e.clientX + 12, y: e.clientY + 12 })}
                  onMouseLeave={() => setHovered(null)}
                  className={`${colorClass(a.dailyProfitPercent, a.positive)} rounded-xl flex flex-col items-center justify-center cursor-pointer hover:brightness-95 transition-all`}>
                  <span className="text-lg font-bold text-white/90">{a.ticker}</span>
                  <span className="text-[11px] font-bold text-white/70">{a.positive ? '+' : ''}{a.dailyProfitPercent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full gap-1.5">
              <div className="flex-1 flex flex-col gap-1.5">
                {rest.slice(0, 2).map(a => (
                  <div key={a.ticker} style={{ flex: a.totalAmount / restTotal * 100 }}
                    onMouseEnter={(e) => { setHovered(a); setPos({ x: e.clientX + 12, y: e.clientY + 12 }); }}
                    onMouseMove={(e) => setPos({ x: e.clientX + 12, y: e.clientY + 12 })}
                    onMouseLeave={() => setHovered(null)}
                    className={`${colorClass(a.dailyProfitPercent, a.positive)} rounded-xl flex flex-col items-center justify-center cursor-pointer hover:brightness-95 transition-all`}>
                    <span className="text-lg font-bold text-white/90">{a.ticker}</span>
                    <span className="text-[10px] font-bold text-white/70">{a.positive ? '+' : ''}{a.dailyProfitPercent}%</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                {rest.slice(2, 4).map(a => (
                  <div key={a.ticker} style={{ flex: a.totalAmount / restTotal * 100 }}
                    onMouseEnter={(e) => { setHovered(a); setPos({ x: e.clientX + 12, y: e.clientY + 12 }); }}
                    onMouseMove={(e) => setPos({ x: e.clientX + 12, y: e.clientY + 12 })}
                    onMouseLeave={() => setHovered(null)}
                    className={`${colorClass(a.dailyProfitPercent, a.positive)} rounded-xl flex flex-col items-center justify-center cursor-pointer hover:brightness-95 transition-all`}>
                    <span className="text-base font-bold text-white/90">{a.ticker}</span>
                    <span className="text-[10px] font-bold text-white/70">{a.positive ? '+' : ''}{a.dailyProfitPercent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating tooltip */}
      {hovered && (
        <div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999 }}
          className="w-56 bg-white border border-border rounded-xl shadow-2xl p-3.5 pointer-events-none">
          <div className="flex items-center gap-2 pb-2 border-b border-border mb-2.5">
            <span className="text-[13px] font-bold text-foreground">{hovered.ticker}</span>
            <span className="text-[11px] text-muted-foreground">{hovered.name}</span>
          </div>
          <div className="flex flex-col gap-1.5 text-[12px]">
            <div className="flex justify-between"><span className="text-muted-foreground/75">현재가</span><span className="font-bold text-foreground">₩{hovered.price.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground/75">보유 수량</span><span className="font-bold text-foreground">{hovered.qty}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground/75">평가 금액</span><span className="font-bold text-foreground">₩{hovered.totalAmount.toLocaleString()}</span></div>
            <div className="flex justify-between pt-1.5 border-t border-dashed border-border mt-1">
              <span className="text-muted-foreground/75">일일 수익률</span>
              <span className={`font-bold ${hovered.positive ? 'text-destructive' : 'text-primary'}`}>
                {hovered.positive ? '▲' : '▼'} {Math.abs(hovered.dailyProfitPercent)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
