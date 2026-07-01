"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Plus, X, ChevronDown, ArrowUpRight, ArrowDownRight, Newspaper, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ItemGroup, ItemMedia, ItemTitle, ItemDescription, Item, ItemContent } from "@/components/ui/item";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { MiniChart } from "../overview/mini-chart";
import { generateSparklineData } from "../../_lib/format";

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
  const chartColor = isPositive ? "var(--gf-up)" : "var(--gf-down)";

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
            const bodyColor = isUp ? "var(--gf-up)" : "var(--gf-down)";
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
            const barColor = isUp ? "var(--gf-up)" : "var(--gf-down)";
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
    <div id="gf-main" className="gf-main flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div id="gf-main-breadcrumb" className="gf-breadcrumb flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="link" onClick={onBack} className="gf-breadcrumb__link flex items-center gap-1 text-[14px] p-0 h-auto flex-shrink-0 text-primary hover:text-primary/80 underline-offset-2">
             <ArrowLeft className="w-4 h-4" />
             포트폴리오
           </Button>
           <span id="gf-breadcrumb-separator" className="gf-breadcrumb__separator text-muted-foreground flex-shrink-0">|</span>
          <span id="gf-breadcrumb-current" className="gf-breadcrumb__current text-[12px] text-muted-foreground font-medium flex-shrink-0">{localStock.ticker}:KRX</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
         <Button variant="outline" onClick={() => setTradeModal(true)} size="sm" className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-primary border-border rounded-full h-auto hover:bg-muted">
             <ScrollText className="w-3.5 h-3.5" />
             매매 기록
           </Button>
            <Button id="gf-main-addtolist" variant="outline" size="sm" className="gf-addtolist__btn flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-primary border-border rounded-full h-auto hover:bg-muted">
              <Plus className="w-3.5 h-3.5" />
              목록에 추가
            </Button>
        </div>
      </div>

      {/* Top Tabs — visible at MOBILE/TABLET (vp < DESKTOP), hidden at DESKTOP+ */}
      {vp < BREAKPOINTS.DESKTOP && (
        <div id="gf-main-toptabs" className="gf-toptabs flex items-center border-b border-border flex-shrink-0 bg-white">
          <button
            onClick={() => setActiveContentTab("개요")}
            id="gf-toptabs-stock"
            className={`gf-toptabs__tab gf-toptabs__tab--active px-5 py-3 text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeContentTab === "개요" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {localStock.ticker}
          </button>
          <button
            onClick={() => setActiveContentTab("조사")}
            id="gf-toptabs-research"
            className={`gf-toptabs__tab px-5 py-3 text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap ${
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
          <div id="gf-main-stockheader" className="gf-stockheader py-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span id="gf-stockheader-name" className="gf-stockheader__name text-[16px] font-semibold text-foreground">{localStock.name}</span>
            </div>
            <div id="gf-stockheader-price" className="gf-stockheader__price-section flex items-baseline gap-2 flex-wrap mt-0.5">
              <span id="gf-stockheader-price-value" className="gf-stockheader__price text-[32px] font-bold text-foreground tabular-nums">{formatPrice(localStock.price)}</span>
              <div id="gf-stockheader-change-icon" className="gf-stockheader__change-icon flex items-center gap-1.5">
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-[var(--gf-up)]" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-[var(--gf-down)]" />
                )}
                <span id="gf-stockheader-change-rate" className={`gf-stockheader__change-rate text-[14px] font-medium tabular-nums ${isPositive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]"}`}>
                  {changeStr} ({changePctStr})
                </span>
              </div>
            </div>
            <div id="gf-stockheader-timestamp" className="gf-stockheader__timestamp text-[12px] text-muted-foreground mt-0.5">
              6월 20일 장 마감
            </div>
          </div>

         {/* Chart Controls */}
           <div id="gf-chart-controls" className="gf-chart__controls flex items-center gap-1.5 py-1.5 flex-wrap">
             <div id="gf-chart-type-btn" className="gf-chart__ctrl-btn relative group">
                <button
                  onClick={() => setChartType(chartType === "area" ? "line" : "area")}
                  className={`gf-chart__ctrl-btn flex items-center gap-1 px-3 py-1.5 text-[12px] border rounded-full transition-all ${chartType === "area" || chartType === "candle" || chartType === "bar" ? "" : ""}`}
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
              <Button variant="outline" size="sm" className="gf-chart__ctrl-btn flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border-border rounded-full h-auto hover:bg-muted">
                 <Plus className="w-4 h-4" />
                 금융 기관과 비교
               </Button>
               <Button variant="outline" size="sm" className="gf-chart__ctrl-btn flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border-border rounded-full h-auto hover:bg-muted">
                 기술 지표 선택
                 <ChevronDown className="w-3 h-3" />
               </Button>
           </div>

          {/* Chart Area */}
          <div id="gf-chart-svg" className="gf-chart__svg py-1">
            {renderChart()}
          </div>

          <div id="gf-chart-prevclose" className="gf-chart__prevclose flex items-center justify-end py-0.5 pr-1">
            <span className="text-[12px] text-muted-foreground">
              전일 종가 ₩{prevClose.toLocaleString()}.00
            </span>
          </div>

          {/* Period Tabs */}
           <ToggleGroup
             value={[chartPeriod]}
             onValueChange={(v: string[]) => { const next = v[0]; if (next) setChartPeriod(next as typeof chartPeriod); }}
             id="gf-chart-periodtabs"
             className="gf-periodtabs flex items-center gap-0.5 py-2 overflow-x-auto scroll-hide"
           >
            {(["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "최대"] as const).map(p => (
              <ToggleGroupItem key={p} value={p} className="gf-periodtabs__tab px-3 py-1 text-[12px] rounded-full whitespace-nowrap flex-shrink-0 text-muted-foreground data-[pressed]:bg-muted data-[pressed]:text-foreground data-[pressed]:font-medium">{p}</ToggleGroupItem>
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
                  <td className={`text-right py-2.5 px-2 tabular-nums whitespace-nowrap font-medium ${isPositive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]"}`}>{changeStr}</td>
                  <td className={`text-right py-2.5 pl-2 tabular-nums whitespace-nowrap font-medium ${isPositive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]"}`}>{changePctStr}</td>
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
                    <td className={`text-right py-2.5 px-2 tabular-nums whitespace-nowrap font-medium ${rs.positive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]"}`}>{rs.positive ? "+" : ""}{rs.change}%</td>
                    <td className={`text-right py-2.5 pl-2 tabular-nums whitespace-nowrap font-medium ${rs.positive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]"}`}>{rs.positive ? "+" : ""}{rs.change}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Tabs value={activeContentTab} onValueChange={(v) => setActiveContentTab(v as "개요" | "실적" | "금융" | "조사")} className="gap-0">
          {/* Content Tabs */}
          <TabsList id="gf-main-contenttabs" variant="line" className="gf-contenttabs h-auto w-full justify-start gap-1 rounded-none border-b border-border p-0">
            {(["개요", "실적", "금융"] as const).map(tab => (
              <TabsTrigger key={tab} value={tab} className="gf-contenttabs__tab flex-none rounded-none px-4 py-2.5 text-[14px] after:bg-primary">{tab}</TabsTrigger>
            ))}
            {vp >= BREAKPOINTS.TABLET && (
              <TabsTrigger id="gf-contenttabs-research" value="조사" className="gf-contenttabs__tab flex-none rounded-none px-4 py-2.5 text-[14px] after:bg-primary">조사</TabsTrigger>
            )}
          </TabsList>

          {/* Content Area */}
          <div id="gf-main-contentpanel" className="gf-contentpanel py-4 pb-8">
            <TabsContent value="개요">
              <div className="space-y-6">
                {/* AI Insights Card */}
                <div id="gf-contentpanel-ai" className="gf-ai bg-muted/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-[var(--gf-up)] flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">AI</span>
                    </div>
                    <span className="text-[13px] font-semibold text-foreground">AI 전망</span>
                  </div>
                  <div className="space-y-2">
                    <div className="gf-ai__card gf-ai__card--positive flex items-start gap-2">
                      <ArrowUpRight className="w-4 h-4 text-[var(--gf-up)] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[13px] font-medium text-foreground">상승세 전망</span>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {localStock.name}은 최근 AI 반도체 수요 증가와 메모리 가격 상승으로 인한 실적 개선 기대감이 작용하며 중기 상승세가 유지될 것으로 전망됩니다.
                        </p>
                      </div>
                    </div>
                    <div className="gf-ai__card gf-ai__card--negative flex items-start gap-2">
                      <ArrowDownRight className="w-4 h-4 text-[var(--gf-down)] mt-0.5 flex-shrink-0" />
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
                <div id="gf-main-metrics" className="gf-metrics">
                  <h3 className="gf-metrics__title text-[15px] font-bold text-foreground mb-3">핵심 지표</h3>
                  <div id="gf-metrics-grid" className="gf-metrics__grid grid grid-cols-2 sm:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden ring-1 ring-border/20">
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
                      <div key={m.label} className="gf-metrics__cell bg-white p-3">
                        <div className="gf-metrics__label text-[11px] text-muted-foreground mb-0.5">{m.label}</div>
                        <div className="gf-metrics__value text-[14px] font-semibold text-foreground tabular-nums">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                 {/* Related Stocks */}
                <div id="gf-main-related" className="gf-related">
                  <h3 className="gf-related__title text-[15px] font-bold text-foreground mb-3">관련 주식</h3>
                  <div id="gf-related-grid" className="gf-related__grid grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {relatedStocks.map(rs => (
                      <div key={rs.ticker} className="gf-related__card bg-white rounded-lg p-3 border border-border hover:bg-muted transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="min-w-0 flex-1">
                            <div className="gf-related__name text-[14px] font-medium text-foreground truncate">{rs.name}</div>
                            <div className="gf-related__ticker text-[11px] text-muted-foreground mt-0.5">{rs.ticker}</div>
                          </div>
                          <MiniChart data={generateSparklineData(rs.price, 20, 0.02, rs.price)} color={rs.positive ? "var(--gf-up)" : "var(--gf-down)"} small />
                        </div>
                         <div className="flex items-end justify-between mt-2 pt-2 border-t border-border/50">
                           <span className="gf-related__price text-[14px] font-medium text-foreground tabular-nums">{formatPrice(rs.price)}</span>
                           <span className={`gf-related__change text-[12px] font-medium tabular-nums ${rs.positive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]"}`}>
                             {rs.positive ? "+" : ""}{rs.change}%
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* News Section */}
                <div id="gf-main-news" className="gf-news">
                  <h3 className="gf-news__title text-[15px] font-bold text-foreground mb-3">뉴스</h3>
                  <ItemGroup id="gf-news-list" className="gf-news__list divide-y divide-border">
                    {newsItems.map((item, idx) => (
                      <Item key={idx} className="gf-news__item cursor-pointer rounded-none px-3 hover:bg-muted">
                        <ItemMedia variant="icon" className="gf-news__icon border border-border bg-white">
                          <Newspaper className="w-4 h-4 text-muted-foreground" />
                        </ItemMedia>
                        <ItemContent className="gf-news__content gap-1">
                          <ItemTitle className="gf-news__headline text-[13px] leading-snug line-clamp-2">{item.title}</ItemTitle>
                          <ItemDescription className="gf-news__meta text-[11px]">{item.source} · {item.time}</ItemDescription>
                        </ItemContent>
                      </Item>
                    ))}
                  </ItemGroup>
                </div>

                {/* Profile Section */}
                <div id="gf-main-profile" className="gf-profile">
                  <h3 className="gf-profile__title text-[15px] font-bold text-foreground mb-3">프로필</h3>
                  <p className="gf-profile__description text-[14px] text-muted-foreground leading-relaxed">
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

            <TabsContent id="gf-contentpanel-earnings" value="실적" className="gf-earnings">
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
                      <div className="text-[11px] text-muted-foreground">이익 <span className="text-[var(--gf-up)] font-medium">{q.profit}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent id="gf-contentpanel-financials" value="금융" className="gf-financials">
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
                      <span className={`text-[13px] font-semibold tabular-nums ${item.positive ? "text-[var(--gf-up)]" : "text-[var(--gf-down)]"}`}>{item.value}</span>
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
