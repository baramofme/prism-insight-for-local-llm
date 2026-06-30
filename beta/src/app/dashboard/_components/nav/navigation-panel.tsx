"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUpRight, ArrowDownRight, ChevronDown, Plus, Info, Pencil, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeader, SimpleStockNav, ListNavigation } from "../../components/navigation-list";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { sectorIndices } from "../../_data/sectors";
import { watchlistStocks } from "../../_data/watchlist";
import { formatPrice, useDeterministicSparkline } from "../../_lib/format";
import { MiniChart } from "../../_components/overview/mini-chart";

export function NavigationPanel({ mobile, open, onClose, centerBounds, sidebarMode: sidebarModeProp, setSidebarMode: setSidebarModeProp, sidebarWidth, onPortfolioClick, onStockClick, wrapperMargin, id }: { mobile?: boolean; open?: boolean; onClose?: () => void; centerBounds?: { left: number; right: number }; sidebarMode?: "minimized" | "hover" | "normal" | "expanded"; setSidebarMode?: (mode: "minimized" | "hover" | "normal" | "expanded") => void; sidebarWidth?: number; onPortfolioClick?: () => void; onStockClick?: (stock: { ticker: string; name: string; price: number; qty: number; dailyProfit: number; dailyProfitPercent: number; positive: boolean; totalAmount: number; transactions: Array<{ id: string; date: string; type: "매수" | "매도"; buyPrice: number; qty: number; profit: number; profitPercent: number; positive: boolean; total: number }> }) => void; wrapperMargin?: number; id?: string }) {
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
    if (mobile) return;
    const vp = window.innerWidth;
    setIsWide(vp >= BREAKPOINTS.WIDE);
    wasTabletRef.current = vp >= BREAKPOINTS.TABLET;
    if (vp >= BREAKPOINTS.TABLET && sidebarMode === "minimized") {
      setSidebarMode("normal");
    }
    const handleResize = () => {
      const vp = window.innerWidth;
      const nowWide = vp >= BREAKPOINTS.WIDE;
      const prevWide = isWideRef.current;
      setIsWide(nowWide);
      if (nowWide !== prevWide) {
        if (nowWide && (sidebarRef.current === "minimized" || sidebarRef.current === "hover")) setSidebarMode("normal");
      }
      const nowTablet = vp >= BREAKPOINTS.TABLET;
      const prevTablet = wasTabletRef.current;
      wasTabletRef.current = nowTablet;
      if (nowTablet !== prevTablet) {
        if (nowTablet && (sidebarRef.current === "minimized" || sidebarRef.current === "hover")) setSidebarMode("normal");
        else if (!nowTablet && sidebarRef.current === "normal") setSidebarMode("minimized");
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
<aside {...(id ? { id } : {})} className={`${mobile ? "fixed md:hidden" : ""} ${mobile ? "inset-y-0 left-0 z-50 transition-all duration-200" : ""} ${mobile ? (open ? "translate-x-0" : "-translate-x-full") : ""} ${sidebarClasses} flex-col border-r border-border bg-white overflow-y-auto scroll-hide flex-shrink-0 self-stretch min-h-0 lg:pb-0 pb-[80px]`}
  onMouseEnter={mobile ? undefined : handleMouseEnter}
  onMouseLeave={mobile ? undefined : handleMouseLeave}
  style={mobile ? { transform: open ? "translateX(0)" : "translateX(-100%)" } : sidebarStyle}
>
  {!isOpen ? (
    <>
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 py-2.5 border-b border-border">
        <span
          id="gf-leftnav-title"
          className="gf-sidebar__title text-[24px] font-normal text-foreground cursor-pointer"
          onClick={cycleMode}
          role="heading"
          aria-level={1}
        >
          목록
        </span>
      </div>
      <div className="gf-sidebar__nav flex flex-col items-stretch py-4 px-2 gap-4">
        <div className="text-center cursor-pointer" onClick={onPortfolioClick}>
          <div className="text-[12px] text-muted-foreground font-medium mb-1">투자중</div>
          <div className="text-[14px] text-foreground font-bold mb-0.5">₩19.6M</div>
          <div className={`flex items-center justify-center gap-0.5 text-[14px] font-semibold ${portfolioSummary.positive ? "text-[#0E9E4B]" : "text-[#FF4B4B]"}`}>
            {portfolioSummary.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}{portfolioSummary.dailyChangePercent}
          </div>
        </div>
        <div className="gf-sidebar__section border-t border-border pt-2.5 space-y-2">
          {watchlistStocks.map(s => (
            <SimpleStockNav
              key={s.name}
              item={{ ...s, fullName: s.fullName }}
              index={watchlistStocks.indexOf(s)}
              sparkData={watchlistSparkData}
              compact
              onStockClick={() => onStockClick?.({
                ticker: s.name, name: s.fullName, price: s.basePrice, qty: 0,
                dailyProfit: 0, dailyProfitPercent: parseFloat(s.change),
                positive: s.positive, totalAmount: 0, transactions: [],
              })}
            />
          ))}
        </div>
        <div className="gf-sidebar__section border-t border-border pt-2.5 space-y-1.5">
          {sectorIndices.slice(0, 5).map(s => (
            <SimpleStockNav
              key={s.name}
              item={{ ...s, fullName: s.fullName }}
              index={sectorIndices.indexOf(s)}
              sparkData={sectorSparkData}
              compact
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
        className="sticky top-0 z-10 bg-white mx-6 border-b border-border"
        titleAfter={
          <Button variant="ghost" size="icon" aria-label="목록 선택" className="h-6 w-6">
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        }
        rightButtons={[
          <Button key="newList" variant="ghost" size="icon" className="h-6 w-6" aria-label="새 목록"><Plus className="w-4 h-4 text-muted-foreground" /></Button>,
          <Button key="expand" variant="ghost" size="icon" className="h-6 w-6" onClick={cycleMode} aria-label={sidebarMode === "expanded" ? "축소" : sidebarMode === "normal" ? "접기" : "펼치기"}>
            {sidebarMode === "expanded" ? <Minimize2 className="w-4 h-4 text-muted-foreground" /> : <Maximize2 className="w-4 h-4 text-muted-foreground" />}
          </Button>
        ]}
      />

      {/* One container holds all groups; the 24px L/R inset lives here, not on
          each ListNavigation, so everything aligns at once (GF .UHCxXe). */}
      <div className="px-6">
      <ListNavigation title="포트폴리오" isOpen={portfolioOpen} onToggleOpen={() => setPortfolioOpen(!portfolioOpen)}>
        <div id="gf-leftnav-investing" className="gf-sidebar__item py-3 cursor-pointer hover:bg-muted transition-colors rounded" aria-label="투자중" onClick={onPortfolioClick}>
          <div className="text-[12px] text-muted-foreground mb-0.5">투자중</div>
          {/* GF: amount + change on one line; KRW drops decimals via formatPrice. */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[14px] font-medium tabular-nums text-foreground">{formatPrice("₩19,653,380.00")}</span>
            <span className="flex items-center gap-0.5 text-[12px] text-[#0E9E4B] tabular-nums">
              <ArrowUpRight className="w-3 h-3" />{formatPrice("+₩453,120.00")} (+2.36%)
            </span>
          </div>
        </div>
      </ListNavigation>

      <ListNavigation 
        title="관심 목록" 
        isOpen={watchlistOpen} 
        onToggleOpen={() => setWatchlistOpen(!watchlistOpen)}
        rightButtons={[
          // GF: info (rich tooltip) + edit/옵션 + add, revealed on hover; add stays.
          <Button key="info" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition" aria-label="info" title="이 목록에는 다른 Google 서비스에서 팔로우하는 종목 코드가 포함됩니다." onMouseEnter={() => setInfoVisible(true)} onMouseLeave={() => setInfoVisible(false)}>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>,
          <Button key="edit" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition" aria-label="관심 목록 목록 옵션" title="옵션" onClick={() => setOptionsOpen(!optionsOpen)}>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>,
          <Button key="add" variant="ghost" size="icon" className="h-6 w-6" aria-label="관심 목록 목록에 종목 코드 추가" title="종목 코드 추가">
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
      </div>
    </>
  )}
</aside>
  </>
);
}

