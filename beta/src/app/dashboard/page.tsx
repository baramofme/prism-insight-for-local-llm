"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Info } from "lucide-react";
import { NavigationPanel, ResearchPanel, ResearchBottomSheet, FooterInput, MobilePortfolioDetail, StockDetail } from "./components/main-content";
import { DebugOverlay } from "@/components/dev/debug-overlay";
import { FinanceHeader } from "./_components/header/finance-header";
import { OverviewContent } from "./_components/overview/overview-content";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { calcPanelWidths } from "./_lib/panel-layout";
import { type Stock } from "./_lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [activeRegion, setActiveRegion] = useState("아시아");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
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
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  // Where the stock detail was opened from, so the breadcrumb/back reflects the
  // previous page: watchlist/home → "홈", a portfolio holding → "포트폴리오".
  const [stockOrigin, setStockOrigin] = useState<"home" | "portfolio">("home");
  const [footerQuestion, setFooterQuestion] = useState("");
  const [footerQuestionId, setFooterQuestionId] = useState(0);
  // Below the research-panel breakpoint GF shows 홈/조사 tabs in the center.
  const [centerTab, setCenterTab] = useState<"home" | "research">("home");
  // Mobile (<=766): hide the header + collapse the research sheet on scroll down.
  const [chromeHidden, setChromeHidden] = useState(false);
  // Price color system (settings menu): 현지 시장 = 상승 red/하락 blue (default),
  // 국제 = 상승 green/하락 red. Drives --gf-up/--gf-down via a class on #gf-root.
  const [priceColor, setPriceColor] = useState<"local" | "intl">("local");
  // Theme: system (follow OS) / dark / light. Toggles the `dark` class on <html>
  // so the .dark token overrides (globals.css) apply across the app.
  const [theme, setTheme] = useState<"system" | "dark" | "light">("system");
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      setIsDark(dark);
    };
    apply();
    if (theme === "system") { mq.addEventListener("change", apply); return () => mq.removeEventListener("change", apply); }
  }, [theme]);

  const handleFooterSubmit = useCallback((text: string) => {
    setFooterQuestion(text);
    setFooterQuestionId(id => id + 1);
    setMobileView("portfolio");
  }, []);

  const handleStockClick = useCallback((stock: Stock, origin: "home" | "portfolio" = "home") => {
    setSelectedStock(stock);
    setStockOrigin(origin);
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
    // Match GF: expanded sidebar at >= WIDE, collapsed rail below.
    if (vp >= BREAKPOINTS.WIDE && sidebarMode === "minimized") setSidebarMode("normal");
    else if (vp < BREAKPOINTS.WIDE && sidebarMode === "normal") setSidebarMode("minimized");
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

  const vp = viewportWidth || 1200;
  const { leftW, centerW, rightW, wrapperMargin } = calcPanelWidths(vp, sidebarMode);

  // Mobile only: track document scroll direction to hide/show the header and
  // collapse/restore the research bottom sheet (GF mobile chrome behaviour).
  useEffect(() => {
    if (vp >= BREAKPOINTS.MOBILE) { setChromeHidden(false); return; }
    let lastY = window.scrollY;
    // Near the top → always show. Any upward move → show immediately. Hiding
    // needs a deliberate downward move past a small threshold.
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      lastY = y;
      if (y <= 8) setChromeHidden(false);
      else if (dy < -3) setChromeHidden(false);
      else if (dy > 6) setChromeHidden(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [vp]);

  const centerLeftMargin = 0;

  return (
    <><div id="gf-root" className="gf-root min-h-screen bg-background text-foreground" style={{ colorScheme: isDark ? "dark" : "light", ["--gf-up" as string]: priceColor === "intl" ? "#0E9E4B" : "#FF4B4B", ["--gf-down" as string]: priceColor === "intl" ? "#FF4B4B" : "#1a73e8" } as React.CSSProperties}>
      <style>{`.scroll-hide::-webkit-scrollbar { display: none; } .scroll-hide { scrollbar-width: none; -ms-overflow-style: none; }`}</style>
      <div id="gf-shell" className="gf-shell flex flex-col min-h-screen md:h-screen">
        <FinanceHeader
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          showSearchDropdown={showSearchDropdown} setShowSearchDropdown={setShowSearchDropdown}
          showSettingsDropdown={showSettingsDropdown} setShowSettingsDropdown={setShowSettingsDropdown}
          tooltip={tooltip} setTooltip={setTooltip} tooltipPos={tooltipPos} setTooltipPos={setTooltipPos}
          handleStockClick={handleStockClick}
          collapsed={chromeHidden}
          onMenuClick={() => setSidebarOpen(true)}
          priceColor={priceColor}
          setPriceColor={setPriceColor}
          theme={theme}
          setTheme={setTheme}
        />

        <div id="gf-body" className={`gf-body flex flex-1 md:overflow-hidden lg:pb-0 md:pb-[80px] pb-0 ${vp >= BREAKPOINTS.WIDE ? "items-start" : ""} max-w-[1820px] mx-auto w-full`} style={vp >= BREAKPOINTS.WIDE ? { width: Math.min(vp, 1820), marginInline: 'auto' } : undefined}>
          <NavigationPanel id="gf-left-nav-mobile" mobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} centerBounds={centerBounds} onPortfolioClick={() => { setSidebarOpen(false); setMobileView("portfolio"); }} onStockClick={handleStockClick} wrapperMargin={wrapperMargin} />
          {vp >= BREAKPOINTS.MOBILE && <NavigationPanel id="gf-left-nav" centerBounds={centerBounds} sidebarMode={sidebarMode} setSidebarMode={handleSidebarModeChange} sidebarWidth={sidebarMode === "expanded" ? 0 : leftW} onPortfolioClick={() => setMobileView("portfolio")} onStockClick={handleStockClick} wrapperMargin={wrapperMargin} />}
          {(sidebarMode === "minimized" || sidebarMode === "hover") && vp >= BREAKPOINTS.MOBILE && <div className="gf-left-spacer flex-shrink-0" style={{ width: 80 }} />}

          {mobileView === "portfolio" ? (
            <div id="gf-center-col" className="gf-center-col flex flex-col flex-1 min-h-0 md:self-stretch" style={{ maxWidth: centerW, marginLeft: sidebarMode === "expanded" ? leftW + centerLeftMargin : centerLeftMargin }}>
              <MobilePortfolioDetail onBack={() => setMobileView("default")} onStockClick={handleStockClick} vp={vp} rightW={rightW} footerQuestion={footerQuestion} footerQuestionId={footerQuestionId} onFooterQuestionConsumed={() => setFooterQuestion("")} />
            </div>
          ) : mobileView === "stockDetail" && selectedStock ? (
            <div id="gf-center-col" className="gf-center-col flex flex-col flex-1 min-h-0 md:self-stretch" style={{ maxWidth: centerW, marginLeft: sidebarMode === "expanded" ? leftW + centerLeftMargin : centerLeftMargin }}>
              <StockDetail stock={selectedStock} backLabel={stockOrigin === "portfolio" ? "포트폴리오" : "홈"} onBack={() => { setMobileView(stockOrigin === "portfolio" ? "portfolio" : "default"); setSelectedStock(null); }} vp={vp} />
            </div>
          ) : (
            <div id="gf-center-col" className="gf-center-col flex flex-col flex-1 md:min-h-0 md:self-stretch" style={{ maxWidth: centerW, marginLeft: sidebarMode === "expanded" ? leftW + centerLeftMargin : centerLeftMargin }}>
              {/* GF: in the tablet range (768–1040) the research panel folds into a
                  홈/조사 tab at the top of the center column. Below MOBILE the tabs
                  drop and research is reached via the bottom chat bar instead. */}
              {vp >= BREAKPOINTS.MOBILE && vp < BREAKPOINTS.RIGHT_PANEL_MIN && (
                <div id="gf-center-tabs" className="gf-center-tabs flex items-center gap-6 border-b border-border px-4 flex-shrink-0">
                  {([["home", "홈"], ["research", "조사"]] as const).map(([key, label]) => (
                    <button key={key} id={`gf-center-tab-${key}`} data-active={centerTab === key} onClick={() => setCenterTab(key)}
                      className={`gf-center-tabs__tab relative py-3 text-[14px] transition-colors ${centerTab === key ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                      {label}
                      {centerTab === key && <span className="gf-center-tabs__indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                    </button>
                  ))}
                </div>
              )}
              {vp >= BREAKPOINTS.MOBILE && vp < BREAKPOINTS.RIGHT_PANEL_MIN && centerTab === "research" ? (
                <ResearchPanel embedded />
              ) : (
                <OverviewContent
                  activeRegion={activeRegion} setActiveRegionAction={setActiveRegion}
                  vp={vp} showMoreNews={showMoreNews} setShowMoreNewsAction={setShowMoreNews}
                  _sidebarMode={sidebarMode} _leftW={leftW} _centerLeftMargin={centerLeftMargin}
                  onStockClick={handleStockClick}
                />
              )}
            </div>
          )}

          {vp >= BREAKPOINTS.RIGHT_PANEL_MIN && researchPanelVisible && <ResearchPanel centerBounds={centerBounds} collapsedWidth={rightW} expanded={researchPanelExpanded} setExpanded={handleResearchPanelToggle} wrapperMargin={wrapperMargin} rightW={rightW} onClose={() => setResearchPanelVisible(false)} />}
          {rightW > 0 && !researchPanelVisible && (
            <div className="flex-shrink-0 self-stretch flex flex-col border-l border-[var(--border)] bg-card">
              <button
                onClick={() => setResearchPanelVisible(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                aria-label="조사 패널 열기"
                title="조사 패널 열기"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>조사</span>
              </button>
            </div>
          )}
        </div>

        <footer id="gf-footer" className="gf-footer border-t border-border bg-card py-2.5 px-4 lg:pb-2.5 md:pb-[80px] pb-[134px] max-w-[1820px] mx-auto w-full">
          {/* GF footer: single 32px line — disclaimer left, links right, no wrap. */}
          <div className="flex items-center justify-between gap-x-4 text-xs text-muted-foreground whitespace-nowrap">
            <div id="gf-footer-disclaimer" className="gf-footer__disclaimer flex items-center gap-1 min-w-0">
              <Info className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">AI 콘텐츠에는 오류가 있을 수 있습니다.</span>
              <a href="https://support.google.com/websearch?p=googlefinancebeta" target="_blank" rel="noopener noreferrer" className="gf-footer__disclaimer-link text-primary underline-offset-4 hover:underline shrink-0">자세히 알아보기</a>
            </div>
            <nav id="gf-footer-links" className="gf-footer__links flex items-center gap-x-2 shrink-0 [&>span:last-child]:hidden">
              <a href="https://support.google.com/websearch?p=googlefinancebeta" target="_blank" rel="noopener noreferrer" className="gf-footer__link text-xs text-muted-foreground hover:text-foreground hover:underline">도움말</a>
              <span className="gf-footer__link-separator text-muted-foreground/50">·</span>
              <button type="button" className="gf-footer__link text-xs text-muted-foreground hover:text-foreground hover:underline">의견 보내기</button>
              <span className="gf-footer__link-separator text-muted-foreground/50">·</span>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="gf-footer__link text-xs text-muted-foreground hover:text-foreground hover:underline">개인 정보 보호</a>
              <span className="gf-footer__link-separator text-muted-foreground/50">·</span>
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="gf-footer__link text-xs text-muted-foreground hover:text-foreground hover:underline">약관</a>
              <span className="gf-footer__link-separator text-muted-foreground/50">·</span>
              <a href="https://www.google.com/googlefinance/disclaimer/" target="_blank" rel="noopener noreferrer" className="gf-footer__link text-xs text-muted-foreground hover:text-foreground hover:underline">면책 조항</a>
            </nav>
          </div>
        </footer>
                {/* <=766px: GF's draggable 조사 bottom sheet (its input is typeable
                    and raises the search popover). 767–1023px (tablet): the compact
                    chat bar. >=1024px: the docked research side panel. */}
                <ResearchBottomSheet collapsed={chromeHidden} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSubmit={handleFooterSubmit} />
                <div className="hidden md:block lg:hidden">
                  <FooterInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSubmit={handleFooterSubmit} />
                </div>
      </div>
    </div>
    <DebugOverlay />
  </>
  );
}
