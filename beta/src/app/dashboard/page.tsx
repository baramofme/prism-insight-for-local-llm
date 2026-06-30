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
  const [footerQuestion, setFooterQuestion] = useState("");
  const [footerQuestionId, setFooterQuestionId] = useState(0);
  // Below the research-panel breakpoint GF shows 홈/조사 tabs in the center.
  const [centerTab, setCenterTab] = useState<"home" | "research">("home");
  // Mobile (<=766): hide the header + collapse the research sheet on scroll down.
  const [chromeHidden, setChromeHidden] = useState(false);

  const handleFooterSubmit = useCallback((text: string) => {
    setFooterQuestion(text);
    setFooterQuestionId(id => id + 1);
    setMobileView("portfolio");
  }, []);

  const handleStockClick = useCallback((stock: Stock) => {
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
    <><div id="gf-root" className="gf-root min-h-screen bg-white text-[#1f1f1f]" style={{ colorScheme: "light" }}>
      <style>{`.scroll-hide::-webkit-scrollbar { display: none; } .scroll-hide { scrollbar-width: none; -ms-overflow-style: none; }`}</style>
      <div className="flex flex-col min-h-screen md:h-screen">
        <FinanceHeader
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          showSearchDropdown={showSearchDropdown} setShowSearchDropdown={setShowSearchDropdown}
          showSettingsDropdown={showSettingsDropdown} setShowSettingsDropdown={setShowSettingsDropdown}
          tooltip={tooltip} setTooltip={setTooltip} tooltipPos={tooltipPos} setTooltipPos={setTooltipPos}
          handleStockClick={handleStockClick}
          collapsed={chromeHidden}
        />

        <div className={`flex flex-1 md:overflow-hidden lg:pb-0 md:pb-[80px] pb-0 ${vp >= BREAKPOINTS.WIDE ? "items-start" : ""} max-w-[1820px] mx-auto w-full`} style={vp >= BREAKPOINTS.WIDE ? { width: Math.min(vp, 1820), marginInline: 'auto' } : undefined}>
          <NavigationPanel id="" mobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} centerBounds={centerBounds} onPortfolioClick={() => { setSidebarOpen(false); setMobileView("portfolio"); }} onStockClick={handleStockClick} wrapperMargin={wrapperMargin} />
          {vp >= BREAKPOINTS.MOBILE && <NavigationPanel id="gf-left-nav" centerBounds={centerBounds} sidebarMode={sidebarMode} setSidebarMode={handleSidebarModeChange} sidebarWidth={sidebarMode === "expanded" ? 0 : leftW} onPortfolioClick={() => setMobileView("portfolio")} onStockClick={handleStockClick} wrapperMargin={wrapperMargin} />}
          {(sidebarMode === "minimized" || sidebarMode === "hover") && vp >= BREAKPOINTS.MOBILE && <div className="flex-shrink-0" style={{ width: 80 }} />}

          {mobileView === "portfolio" ? (
            <div className="flex flex-col flex-1 min-h-0" style={{ maxWidth: centerW, marginLeft: sidebarMode === "expanded" ? leftW + centerLeftMargin : centerLeftMargin }}>
              <MobilePortfolioDetail onBack={() => setMobileView("default")} vp={vp} rightW={rightW} footerQuestion={footerQuestion} footerQuestionId={footerQuestionId} onFooterQuestionConsumed={() => setFooterQuestion("")} />
            </div>
          ) : mobileView === "stockDetail" && selectedStock ? (
            <div className="flex flex-col flex-1 min-h-0" style={{ maxWidth: centerW, marginLeft: sidebarMode === "expanded" ? leftW + centerLeftMargin : centerLeftMargin }}>
              <StockDetail stock={selectedStock} onBack={() => { setMobileView("portfolio"); setSelectedStock(null); }} vp={vp} />
            </div>
          ) : (
            <div className="flex flex-col flex-1 md:min-h-0 md:self-stretch" style={{ maxWidth: centerW, marginLeft: sidebarMode === "expanded" ? leftW + centerLeftMargin : centerLeftMargin }}>
              {/* GF: in the tablet range (768–1040) the research panel folds into a
                  홈/조사 tab at the top of the center column. Below MOBILE the tabs
                  drop and research is reached via the bottom chat bar instead. */}
              {vp >= BREAKPOINTS.MOBILE && vp < BREAKPOINTS.RIGHT_PANEL_MIN && (
                <div className="flex items-center gap-6 border-b border-border px-4 flex-shrink-0">
                  {([["home", "홈"], ["research", "조사"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setCenterTab(key)}
                      className={`relative py-3 text-[14px] transition-colors ${centerTab === key ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                      {label}
                      {centerTab === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
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
                />
              )}
            </div>
          )}

          {vp >= BREAKPOINTS.RIGHT_PANEL_MIN && researchPanelVisible && <ResearchPanel centerBounds={centerBounds} collapsedWidth={rightW} expanded={researchPanelExpanded} setExpanded={handleResearchPanelToggle} wrapperMargin={wrapperMargin} rightW={rightW} onClose={() => setResearchPanelVisible(false)} />}
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

        <footer id="gf-footer" className="gf-footer border-t border-border bg-white py-2.5 px-4 lg:pb-2.5 md:pb-[80px] pb-[134px] max-w-[1820px] mx-auto w-full">
          {/* GF footer: single 32px line — disclaimer left, links right, no wrap. */}
          <div className="flex items-center justify-between gap-x-4 text-xs text-muted-foreground whitespace-nowrap">
            <div id="gf-footer-disclaimer" className="gf-footer__disclaimer flex items-center gap-1 min-w-0">
              <Info className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">AI 콘텐츠에는 오류가 있을 수 있습니다.</span>
              <a href="#" className="gf-footer__disclaimer-link text-primary underline-offset-4 hover:underline shrink-0">자세히 알아보기</a>
            </div>
            <nav id="gf-footer-links" className="gf-footer__links flex items-center gap-x-2 shrink-0 [&>span:last-child]:hidden">
              <Button variant="link" className="gf-footer__link h-auto p-0 text-xs text-muted-foreground hover:text-foreground">도움말</Button>
              <span className="gf-footer__link-separator text-muted-foreground/50">·</span>
              <Button variant="link" className="gf-footer__link h-auto p-0 text-xs text-muted-foreground hover:text-foreground">의견 보내기</Button>
              <span className="gf-footer__link-separator text-muted-foreground/50">·</span>
              <Button variant="link" className="gf-footer__link h-auto p-0 text-xs text-muted-foreground hover:text-foreground">개인 정보 보호</Button>
              <span className="gf-footer__link-separator text-muted-foreground/50">·</span>
              <Button variant="link" className="gf-footer__link h-auto p-0 text-xs text-muted-foreground hover:text-foreground">약관</Button>
              <span className="gf-footer__link-separator text-muted-foreground/50">·</span>
              <Button variant="link" className="gf-footer__link h-auto p-0 text-xs text-muted-foreground hover:text-foreground">면책 조항</Button>
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
