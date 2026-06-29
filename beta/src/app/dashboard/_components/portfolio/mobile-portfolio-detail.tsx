"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Fragment } from "react";
import { ArrowLeft, Plus, X, ChevronDown, ArrowUpRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AssetSymbol, getAssetShape } from "../../_lib/shapes";
import { useDeterministicSparkline, generateSparklineData } from "../../_lib/format";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { ResearchPanel } from "../../components/research-panel";
import { Chart, AreaSeries, LineSeries } from 'lightweight-charts-react-components';
import { ColorType } from 'lightweight-charts';


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
    <div id="gf-mobile-portfolio-detail" className="gf-mobile-portfolio-detail flex flex-col flex-1 min-h-0">
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
