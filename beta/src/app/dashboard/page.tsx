"use client";

import { useState, useEffect, useLayoutEffect, useRef, useMemo, useId, useCallback, Fragment } from "react";
import { Menu, Search, Mic, Globe, Brain, TrendingUp, BarChart3, Settings, Info, ChevronDown, Maximize2, PenSquare, ScrollText, X, Edit3, MessageSquare } from "lucide-react";
import { 
  NavigationPanel, ResearchPanel, FooterInput,
  regionIndices, newsItems, sectorIndices, watchlistStocks,
  searchStockSuggestions, searchAiPrompts, footerTickerSuggestions,
  MobilePortfolioDetail, MobilePortfolio, StockDetail, IndexCard, MarketSummaryCard, NewsItem, StockTableRow,
  marketSummaries, mostActiveStocks, gainers, losers,
} from "./components/main-content";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
// ─── Responsive Breakpoints (Google Finance pattern) ───────────────────────
const BREAKPOINTS = {
  MOBILE: 760,      // <760px: Full-screen, no panels
  TABLET: 936,      // 760~935px: Left sidebar only
  RIGHT_PANEL: 936, // ≥936px: Right panel (조사) visible
  DESKTOP: 1371,    // 936~1370px: Left + right panels, tabs hidden
  WIDE: 1371,       // ≥1371px: Full layout, sidebar shifted
} as const;



export default function DashboardPage() {
  const [activeRegion, setActiveRegion] = useState("아시아");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showMoreNews, setShowMoreNews] = useState(false);
  const [centerBounds, setCenterBounds] = useState({ left: 80, right: 0 });
  const [sidebarMode, setSidebarMode] = useState<"minimized" | "hover" | "normal" | "expanded">("minimized");
  const [researchPanelExpanded, setResearchPanelExpanded] = useState(false);
  const [researchPanelVisible, setResearchPanelVisible] = useState(true);
  const prevSidebarModeRef = useRef<"minimized" | "hover" | "normal" | "expanded">("minimized");
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [mobileView, setMobileView] = useState<"default" | "portfolio" | "stockDetail">("default");
  const [selectedStock, setSelectedStock] = useState<{
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
  } | null>(null);
  const [footerQuestion, setFooterQuestion] = useState("");
  const [footerQuestionId, setFooterQuestionId] = useState(0);

  const handleFooterSubmit = useCallback((text: string) => {
    setFooterQuestion(text);
    setFooterQuestionId(id => id + 1);
    setMobileView("portfolio");
  }, []);

  const handleStockClick = useCallback((stock: {
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
  }) => {
    setSelectedStock(stock);
    setMobileView("stockDetail");
    setSidebarOpen(false);
  }, []);
  const centerRef = useRef<HTMLElement>(null);

  const handleSidebarModeChange = useCallback((mode: "minimized" | "hover" | "normal" | "expanded") => {
    if (mode === "expanded") setResearchPanelExpanded(false);
    setSidebarMode(mode);
  }, []);

  const handleResearchPanelToggle = useCallback((v: boolean) => {
    if (v) {
      prevSidebarModeRef.current = sidebarMode;
      setSidebarMode(window.innerWidth >= BREAKPOINTS.WIDE ? "normal" : "minimized");
    } else {
      setSidebarMode(prevSidebarModeRef.current);
    }
    setResearchPanelExpanded(v);
  }, [sidebarMode]);

  useEffect(() => {
    const el = centerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setCenterBounds({ left: Math.round(r.x), right: Math.round(r.x + r.width) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sidebarMode]);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const vp = window.innerWidth;
    if (vp >= BREAKPOINTS.TABLET && sidebarMode === "minimized") {
      setSidebarMode("normal");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayNews = showMoreNews ? newsItems : newsItems.slice(0, 4);
const lastUpdateTime = useMemo(() => { const d = new Date(); const h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0'); const ampm = h >= 12 ? '오후' : '오전'; const h12 = h % 12 || 12; return `${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}. ${ampm} ${h12}:${m} (KST)`; }, []);
  const currentIndices = regionIndices[activeRegion] || regionIndices["아시아"];

  const calcPanelWidths = (vp: number, mode: "minimized" | "hover" | "normal" | "expanded") => {
    // ── Expanded mode (overlay sidebar): Always show full layout ─────
    if (mode === "expanded") {
      if (vp >= BREAKPOINTS.WIDE) {
        const leftW = 272;
        const rightW = 597;
        const centerW = 792;
        const wrapperMargin = (vp - Math.min(1800, vp - 48)) / 2;
        return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin };
      }
      // DESKTOP (936–1370px): Linear interpolation from min to max widths
      if (vp >= BREAKPOINTS.TABLET) {
        const progress = Math.min(1, Math.max(0, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)));
        const leftW = 252 + progress * (272 - 252);
        const rightW = 283 + progress * (597 - 283);
        const centerW = Math.min(792, 644 + progress * (792 - 644));
        return { leftW, centerW, rightW, centerMaxW: Math.min(792, 644 + progress * (792 - 644)), wrapperMargin: 0 };
      }
      // TABLET (760–935px): Left sidebar only
      if (vp >= BREAKPOINTS.MOBILE) {
        const leftW = 232;
        const centerW = Math.min(800, vp - leftW - 48);
        return { leftW, centerW, rightW: 0, centerMaxW: Math.min(800, vp - leftW - 48), wrapperMargin: 0 };
      }
      return { leftW: 232, centerW: Math.min(800, vp - 232 - 48), rightW: 0, centerMaxW: Math.min(800, vp - 232 - 48), wrapperMargin: 0 };
    }

    // ── Normal mode: Full responsive layout ──────────────────────────
    if (mode === "normal") {
      if (vp >= BREAKPOINTS.WIDE) {
        const leftW = 272;
        const rightW = 597;
        const centerW = 792;
        const wrapperMargin = (vp - Math.min(1800, vp - 48)) / 2;
        return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin };
      }
      // DESKTOP (936–1370px): Linear interpolation from min to max widths
      if (vp >= BREAKPOINTS.TABLET) {
        const progress = Math.min(1, Math.max(0, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)));
        const leftW = 252 + progress * (272 - 252);
        const rightW = 283 + progress * (597 - 283);
        const centerW = Math.min(792, 644 + progress * (792 - 644));
        return { leftW, centerW, rightW, centerMaxW: Math.min(792, 644 + progress * (792 - 644)), wrapperMargin: 0 };
      }
      // TABLET (760–935px): Left sidebar only
      if (vp >= BREAKPOINTS.MOBILE) {
        const leftW = 232;
        const centerW = Math.min(800, vp - leftW - 48);
        return { leftW, centerW, rightW: 0, centerMaxW: Math.min(800, vp - leftW - 48), wrapperMargin: 0 };
      }
      return { leftW: 232, centerW: Math.min(800, vp - 232 - 48), rightW: 0, centerMaxW: Math.min(800, vp - 232 - 48), wrapperMargin: 0 };
    }

    // ── Hover mode: Partial sidebar + full layout ────────────────────
    if (mode === "hover") {
      if (vp >= BREAKPOINTS.WIDE) {
        const leftW = 80;
        const rightW = 597;
        const centerW = 792;
        const wrapperMargin = (vp - Math.min(1800, vp - 48)) / 2;
        return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin };
      }
      // DESKTOP (936–1370px): Linear interpolation from min to max widths
      if (vp >= BREAKPOINTS.TABLET) {
        const progress = Math.min(1, Math.max(0, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)));
        const leftW = 80;
        const rightW = 283 + progress * (597 - 283);
        const centerW = Math.min(792, 644 + progress * (792 - 644));
        return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin: 0 };
      }
      // TABLET (760–935px): Left sidebar only
      if (vp >= BREAKPOINTS.MOBILE) {
        const leftW = 80;
        const centerW = vp - 80;
        return { leftW, centerW, rightW: 0, centerMaxW: 800, wrapperMargin: 0 };
      }
      return { leftW: 80, centerW: vp - 80, rightW: 0, centerMaxW: 800, wrapperMargin: 0 };
    }

    // ── Collapsed mode (default): Minimal sidebar ────────────────────
    if (vp >= BREAKPOINTS.WIDE) {
      const leftW = 80;
      const rightW = 597;
      const centerW = 792;
      // collapsed: narrower left panel → larger wrapper margin for centering
      const wrapperMargin = (vp - Math.min(1800, vp - 48)) / 2 + 96;
      return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin };
    }
    // DESKTOP (936–1370px): Linear interpolation from min to max widths
    if (vp >= BREAKPOINTS.TABLET) {
      const progress = Math.min(1, Math.max(0, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)));
      const leftW = 80;
      const rightW = 283 + progress * (597 - 283);
      const centerW = Math.min(792, 644 + progress * (792 - 644));
      return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin: 0 };
    }
    // TABLET (760–935px): Left sidebar only
    if (vp >= BREAKPOINTS.MOBILE) {
      const leftW = 80;
      const centerW = vp - 80;
      return { leftW, centerW, rightW: 0, centerMaxW: 800, wrapperMargin: 0 };
    }
    // MOBILE (<760px): No sidebar
    return { leftW: 80, centerW: vp - 80, rightW: 0, centerMaxW: 800, wrapperMargin: 0 };
  };

  const vp = viewportWidth || 1200;
  const { leftW, centerW, rightW, wrapperMargin } = calcPanelWidths(vp, sidebarMode);

  const centerProgress = BREAKPOINTS.WIDE > BREAKPOINTS.TABLET
    ? Math.max(0, Math.min(1, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)))
    : (vp >= BREAKPOINTS.WIDE ? 1 : 0);
  const centerLeftMargin = 0;

  return (
    <div style={{ colorScheme: "light" }} className="min-h-screen bg-white text-[#1f1f1f]">
      <style>{`.scroll-hide::-webkit-scrollbar { display: none; } .scroll-hide { scrollbar-width: none; -ms-overflow-style: none; }`}</style>
      <div className="flex flex-col h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-[#e8eaed] max-w-[1820px] mx-auto w-full">
          <div className="grid items-center px-4 py-2" style={{ gridTemplateColumns: '324px 1fr auto' }}>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden p-2 hover:bg-[#f8f9fa] rounded-full transition-colors">
                <Menu className="w-5 h-5 text-[#5f6368]" />
              </Button>
              <div className="flex items-center gap-1.5">
                <span className="text-[24px] font-bold text-[#1f1f1f]">Finance</span>
                <span className="text-[12px] text-[#5f6368] bg-[#e8eaed] px-1.5 py-0.5 rounded-md font-medium">Beta</span>
              </div>
            </div>
            <div className="hidden min-[1040px]:flex justify-start">
              <div className="relative w-full max-w-xl" ref={searchDropdownRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" />
                <input
                  type="text"
                  placeholder="검색 또는 질문하기"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="w-full pl-11 pr-12 py-2.5 bg-[#f1f3f4] rounded-full text-[14px] text-[#1f1f1f] placeholder-[#5f6368] border-none focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button variant="ghost" size="icon" className="p-1 hover:bg-[#e8eaed] rounded-full transition-colors"><Mic className="w-4 h-4 text-[#1a73e8]" /></Button>
                </div>

                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e8eaed] rounded-2xl shadow-xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
                    {searchQuery.trim() ? (
                      <div className="p-3">
                        <div className="text-[11px] font-semibold text-[#5f6368] px-2 mb-2">종목 이동 및 필터링</div>
                        <div className="space-y-0.5">
                          {searchStockSuggestions
                            .filter(s => s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .slice(0, 5)
                            .map(s => (
                              <div
                                key={s.ticker}
                                onClick={() => {
                                  handleStockClick({
                                    ticker: s.ticker,
                                    name: s.name,
                                    price: parseInt(s.price.replace(/[₩$,]/g, "")),
                                    qty: 0,
                                    dailyProfit: 0,
                                    dailyProfitPercent: parseFloat(s.change),
                                    positive: s.positive,
                                    totalAmount: 0,
                                    transactions: [],
                                  });
                                  setSearchQuery("");
                                  setShowSearchDropdown(false);
                                }}
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f8f9fa] cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-[#f1f3f4] rounded-full flex items-center justify-center text-[11px] font-bold text-[#5f6368]">
                                    {s.ticker.slice(0, 2)}
                                  </div>
                                  <div>
                                    <div className="text-[14px] font-semibold text-[#1f1f1f]">{s.name}</div>
                                    <div className="text-[12px] text-[#5f6368]">{s.ticker}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[14px] text-[#1f1f1f] tabular-nums">{s.price}</div>
                                  <div className={`text-[12px] font-medium ${s.positive ? 'text-[#0E9E4B]' : 'text-[#FF4B4B]'}`}>{s.change}</div>
                                </div>
                              </div>
                            ))}
                          {searchStockSuggestions.filter(s => s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                            <div className="px-3 py-4 text-center text-[14px] text-[#5f6368]">검색 결과 없음</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3">
                        <div className="text-[11px] font-semibold text-[#5f6368] px-2 mb-2">AI에게 물어보기</div>
                        <div className="space-y-0.5">
                          {searchAiPrompts.map((prompt, i) => {
                            const Icon = prompt.icon === "Globe" ? Globe : prompt.icon === "Brain" ? Brain : prompt.icon === "TrendingUp" ? TrendingUp : BarChart3;
                            return (
                              <div
                                key={i}
                                onClick={() => {
                                  setSearchQuery(prompt.label);
                                  setShowSearchDropdown(false);
                                }}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f8f9fa] cursor-pointer transition-colors"
                              >
                                <div className="w-8 h-8 bg-[#f1f3f4] rounded-full flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-[#5f6368]" />
                                </div>
                                <div>
                                  <div className="text-[14px] font-semibold text-[#1f1f1f]">{prompt.label}</div>
                                  <div className="text-[12px] text-[#5f6368]">{prompt.description}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="relative flex items-center justify-end gap-0.5" ref={settingsDropdownRef}>
              {/* Search Icon Button */}
              <button
                onMouseEnter={(e) => { setTooltip("검색 또는 질문하기"); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => setShowSearchDropdown(true)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f8f9fa] active:bg-[#e8eaed] transition-colors focus:outline-none"
                aria-label="검색"
              >
                <Search className="w-5 h-5 text-[#5f6368]" />
              </button>

              {/* Settings Dropdown Menu */}
              {showSettingsDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-[#dadce0] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.15)] min-w-[240px] z-50 overflow-hidden">
                  <div className="py-2">
                    <div className="px-4 py-2 text-[12px] font-semibold text-[#5f6368] uppercase tracking-wide">설정</div>
                    <Button variant="ghost" className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#1f1f1f] hover:bg-[#f8f9fa] transition-colors text-left justify-start h-auto">
                      <Globe className="w-4 h-4 text-[#5f6368]" />
                      <span>언어: 한국어</span>
                    </Button>
                    <Button variant="ghost" className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#1f1f1f] hover:bg-[#f8f9fa] transition-colors text-left justify-start h-auto">
                      <Settings className="w-4 h-4 text-[#5f6368]" />
                      <span>가격 색상 시스템</span>
                    </Button>
                    <div className="border-t border-[#e8eaed] my-1" />
                    <Button variant="ghost" className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#1f1f1f] hover:bg-[#f8f9fa] transition-colors text-left justify-start h-auto">
                      <Info className="w-4 h-4 text-[#5f6368]" />
                      <span>도움말 & 피드백</span>
                    </Button>
                    <Button variant="ghost" className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#1f1f1f] hover:bg-[#f8f9fa] transition-colors text-left justify-start h-auto">
                      <Edit3 className="w-4 h-4 text-[#5f6368]" />
                      <span>피드백 보내기</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Settings Icon Button */}
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                onMouseEnter={(e) => { if (!showSettingsDropdown) setTooltip("설정"); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                onMouseLeave={() => setTooltip(null)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f8f9fa] active:bg-[#e8eaed] transition-colors focus:outline-none"
                aria-label="설정"
              >
                <Settings className="w-5 h-5 text-[#5f6368]" />
              </button>

              {/* Feedback Icon Button */}
              <button
                onMouseEnter={(e) => { setTooltip("의견 보내기"); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                onMouseLeave={() => setTooltip(null)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f8f9fa] active:bg-[#e8eaed] transition-colors focus:outline-none"
                aria-label="피드백"
              >
                <MessageSquare className="w-5 h-5 text-[#5f6368]" />
              </button>

              {/* Profile Button */}
              <div
                className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-[14px] font-medium cursor-pointer hover:shadow-md transition-shadow ring-2 ring-transparent hover:ring-[#dadce0]"
                aria-label="사용자 프로필"
              >
                U
              </div>

              {/* Tooltip */}
              {tooltip && (
                <div
                  className="fixed z-[9999] pointer-events-none px-2 py-1 bg-[#1f1f1f] text-white text-[12px] rounded-md whitespace-nowrap shadow-lg"
                  style={{ left: tooltipPos.x - 40, top: tooltipPos.y + 16 }}
                >
                  {tooltip}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={`flex flex-1 overflow-hidden lg:pb-0 pb-[80px] ${vp >= BREAKPOINTS.WIDE ? "items-start" : ""} max-w-[1820px] mx-auto w-full`} style={vp >= BREAKPOINTS.WIDE ? { width: Math.min(Math.max(1661, vp + wrapperMargin * 2), 1820), marginInline: 'auto' } : undefined}>
          <NavigationPanel mobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} centerBounds={centerBounds} onPortfolioClick={() => { setSidebarOpen(false); setMobileView("portfolio"); }} onStockClick={handleStockClick} wrapperMargin={wrapperMargin} />
          {vp >= BREAKPOINTS.MOBILE && <NavigationPanel centerBounds={centerBounds} sidebarMode={sidebarMode} setSidebarMode={handleSidebarModeChange} sidebarWidth={sidebarMode === "expanded" ? 0 : leftW} onPortfolioClick={() => setMobileView("portfolio")} onStockClick={handleStockClick} wrapperMargin={wrapperMargin} />}
          {/* Spacer: when sidebar is fixed (overlay), keep center position stable */}
          {(sidebarMode === "minimized" || sidebarMode === "hover") && vp >= BREAKPOINTS.MOBILE && <div className="flex-shrink-0" style={{ width: 80 }} />}

          {mobileView === "portfolio" ? (
            <div className="flex flex-col flex-1 min-h-0" style={{ maxWidth: centerW, marginLeft: sidebarMode === "expanded" ? leftW + centerLeftMargin : centerLeftMargin }}>
              <MobilePortfolioDetail onBack={() => setMobileView("default")} vp={vp} rightW={rightW} footerQuestion={footerQuestion} footerQuestionId={footerQuestionId} onFooterQuestionConsumed={() => setFooterQuestion("")} />
            </div>
          ) : mobileView === "stockDetail" && selectedStock ? (
            <div className="flex flex-col flex-1 min-h-0" style={{ maxWidth: centerW, marginLeft: sidebarMode === "expanded" ? leftW + centerLeftMargin : centerLeftMargin }}>
              <StockDetail
                stock={selectedStock}
                onBack={() => {
                  setMobileView("portfolio");
                  setSelectedStock(null);
                }}
                vp={vp}
              />
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0" style={{ maxWidth: centerW, marginLeft: sidebarMode === "expanded" ? leftW + centerLeftMargin : centerLeftMargin }}>
            <main ref={centerRef} className="flex-1 overflow-y-auto scroll-hide min-h-0">
              <div className="px-3 py-4 max-w-4xl pb-4">
              <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [& scrollbar-width:none]">
                 {["미국", "유럽", "아시아", "중남미", "통화", "암호화폐", "선물"].map((tab) => (
                   <button key={tab} onClick={() => setActiveRegion(tab)}
                     className={`px-3 py-1.5 rounded-full text-[14px] whitespace-nowrap transition-colors ${activeRegion === tab ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/60"}`}>{tab}</button>
                 ))}
               </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#5f6368]">최신 업데이트: {lastUpdateTime}</span>
                <span className="text-[12px] text-[#5f6368]">준비 완료</span>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {currentIndices.slice(0, 5).map((item) => (
                  <IndexCard key={item.name} item={item} vp={vp} />
                ))}
              </div>

              <MobilePortfolio vp={vp} onViewPortfolio={() => setMobileView("portfolio")} />

              {["아시아", "미국", "유럽", "중남미"].includes(activeRegion) && (
                <div className="mb-6">
                  <h2 className="text-[20px] font-medium text-[#1f1f1f] mb-3">{activeRegion} 시장 요약</h2>
                  <div className="space-y-1">
                    {marketSummaries.slice(0, 4).map((summary) => (
                      <MarketSummaryCard key={summary.id} summary={summary} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-[20px] font-medium text-[#1f1f1f] mb-1">뉴스 기사 더보기</h2>
                <p className="text-[12px] text-[#5f6368] mb-3">웹 소스 기반</p>
                <div className={`grid gap-2 ${vp < BREAKPOINTS.MOBILE ? "grid-cols-1" : "grid-cols-2"}`}>
                  {(vp < BREAKPOINTS.MOBILE ? displayNews.slice(0, 4) : displayNews).map((item) => (<NewsItem key={item.id} item={item} />))}
                </div>
                {vp >= BREAKPOINTS.MOBILE && newsItems.length > 4 && !showMoreNews && (
                  <button onClick={() => setShowMoreNews(true)} className="mt-3 w-full py-2 text-[14px] text-[#1a73e8] hover:bg-[#f8f9fa] rounded-lg transition-colors">더보기</button>
                )}
              </div>

              <div className={`mb-6 ${vp < BREAKPOINTS.MOBILE ? "flex flex-col gap-4" : "flex gap-6 overflow-x-auto scroll-hide"}`} style={vp < BREAKPOINTS.MOBILE ? {} : { scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[
                  { title: "최다 거래 종목", stocks: mostActiveStocks, showVolume: true },
                  { title: "일 최대 상승 종목", stocks: gainers, showVolume: false },
                  { title: "일 최대 하락 종목", stocks: losers, showVolume: false },
                ].map((tbl) => (
                  <div key={tbl.title} className={vp < BREAKPOINTS.MOBILE ? "" : "flex-1 min-w-0"}>
                    <h3 className={`${vp < BREAKPOINTS.MOBILE ? "text-[20px]" : "text-[14px]"} font-medium text-[#1f1f1f] mb-2`}>{tbl.title}</h3>
                    <div className="space-y-0.5">
                      {tbl.stocks.map((stock) => (
                        <StockTableRow key={stock.rank} stock={stock} showVolume={tbl.showVolume} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
            </main>
          </div>
          )}

          {rightW > 0 && researchPanelVisible && <ResearchPanel centerBounds={centerBounds} collapsedWidth={rightW} expanded={researchPanelExpanded} setExpanded={handleResearchPanelToggle} wrapperMargin={wrapperMargin} rightW={rightW} onClose={() => setResearchPanelVisible(false)} />}
          {rightW > 0 && !researchPanelVisible && (
            <div className="flex-shrink-0 self-stretch flex flex-col border-l border-[#e8eaed] bg-white">
              <button
                onClick={() => setResearchPanelVisible(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-[#5f6368] hover:bg-[#f8f9fa] transition-colors"
                aria-label="조사 패널 열기"
                title="조사 패널 열기"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>조사</span>
              </button>
            </div>
          )}
        </div>

        <footer className="border-t border-border bg-white py-2.5 px-4 lg:pb-2.5 pb-[80px] max-w-[1820px] mx-auto w-full">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Alert variant="default" className="bg-muted/40 border-none px-3 py-1.5 rounded-md h-auto">
              <Info className="h-3 w-3 mr-1.5 text-primary" />
              <AlertDescription className="text-xs">AI 콘텐츠에는 오류가 있을 수 있습니다.</AlertDescription>
              <a href="#" className="ml-1 text-primary underline-offset-4 hover:underline">자세히</a>
            </Alert>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <nav className="flex flex-wrap items-center gap-x-2 [&>span:last-child]:hidden">
              <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">도움말</Button>
              <span className="text-muted-foreground/50">·</span>
              <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">의견 보내기</Button>
              <span className="text-muted-foreground/50">·</span>
              <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">개인 정보 보호</Button>
              <span className="text-muted-foreground/50">·</span>
              <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">약관</Button>
              <span className="text-muted-foreground/50">·</span>
              <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">면책 조항</Button>
            </nav>
          </div>
        </footer>
                {<FooterInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSubmit={handleFooterSubmit} />}
      </div>
    </div>
  );
}


