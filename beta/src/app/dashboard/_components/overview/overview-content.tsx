"use client";

import { useMemo } from "react";
import { IndexCard, MarketSummaryCard, NewsItem, StockTableRow } from "../../components/main-content";
import { MobilePortfolio } from "../portfolio/mobile-portfolio";
import { regionIndices } from "../../_data/indices";
import { newsItems, marketSummaries } from "../../_data/news";
import { mostActiveStocks, gainers, losers } from "../../_data/stocks";
import { BREAKPOINTS } from "@/lib/breakpoints";

export function OverviewContent({
  activeRegion, setActiveRegionAction, vp, showMoreNews, setShowMoreNewsAction, _sidebarMode, _leftW, _centerLeftMargin, onStockClick,
}: {
  activeRegion: string;
  setActiveRegionAction: React.Dispatch<React.SetStateAction<string>>;
  vp: number;
  showMoreNews: boolean;
  setShowMoreNewsAction: React.Dispatch<React.SetStateAction<boolean>>;
  _sidebarMode: "minimized" | "hover" | "normal" | "expanded";
  _leftW: number;
  _centerLeftMargin: number;
  onStockClick?: (stock: import("../../_lib/types").Stock) => void;
}) {
  const lastUpdateTime = useMemo(() => {
    const d = new Date();
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? '오후' : '오전';
    const h12 = h % 12 || 12;
    return `${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}. ${ampm} ${h12}:${m} (KST)`;
  }, []);

  const currentIndices = regionIndices[activeRegion] || regionIndices["아시아"];
  const displayNews = showMoreNews ? newsItems : newsItems.slice(0, 4);

  return (
    <main id="gf-main" className="gf-main flex-1 md:overflow-y-auto scroll-hide md:min-h-0">
      <div className="px-4 sm:px-6 md:px-3 py-4 max-w-4xl pb-4">
        <div id="gf-main-regiontabs" className="gf-regiontabs flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [& scrollbar-width:none]">
          {["미국", "유럽", "아시아", "중남미", "통화", "암호화폐", "선물"].map((tab) => (
            <button key={tab} onClick={() => setActiveRegionAction(tab)}
              className={`gf-regiontabs__tab px-3 py-1.5 rounded-full text-[14px] whitespace-nowrap transition-colors ${activeRegion === tab ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/60"}`}>{tab}</button>
          ))}
        </div>

        {/* Mobile: GF-style horizontal scroll strip (fixed-width cards). Desktop: 5-col grid. */}
        <div id="gf-main-index-grid" className={`gf-index-grid mb-6 ${vp < BREAKPOINTS.MOBILE ? "flex gap-2 overflow-x-auto scroll-hide" : "grid grid-cols-5 gap-2"}`}>
          {currentIndices.slice(0, 5).map((item) => (
            <div key={item.name} className={vp < BREAKPOINTS.MOBILE ? "shrink-0 w-[104px] sm:w-[130px]" : ""}>
              <IndexCard item={item} vp={vp} onClick={onStockClick ? () => onStockClick({
                ticker: item.name, name: item.name,
                price: parseFloat(item.value.replace(/,/g, "")),
                qty: 0, dailyProfit: 0,
                dailyProfitPercent: parseFloat(item.change.replace("%", "")),
                positive: item.isPositive, totalAmount: 0, transactions: [],
              }) : undefined} />
            </div>
          ))}
        </div>

        <MobilePortfolio vp={vp} onViewPortfolio={() => {}} />

        {["아시아", "미국", "유럽", "중남미"].includes(activeRegion) && (
          <div id="gf-main-market-summary" className="gf-market-summary">
            <h2 className="gf-market-summary__title text-[20px] font-medium text-[var(--foreground)] mb-3">{activeRegion} 시장 요약</h2>
            <div className="space-y-1">
              {marketSummaries.slice(0, 4).map((summary) => (
                <MarketSummaryCard key={summary.id} summary={summary} />
              ))}
            </div>
          </div>
        )}

        <div id="gf-main-news" className="gf-news">
          <h2 className="gf-news__title text-[20px] font-medium text-[var(--foreground)] mb-1">뉴스 기사 더보기</h2>
          <p className="gf-news__source text-[12px] text-[var(--muted-foreground)] mb-3">웹 소스 기반</p>
          <div id="gf-news-list" className={`gf-news__grid grid gap-2 ${vp < BREAKPOINTS.MOBILE ? "grid-cols-1" : "grid-cols-2"}`}>
            {(vp < BREAKPOINTS.MOBILE ? displayNews.slice(0, 4) : displayNews).map((item) => (<NewsItem key={item.id} item={item} />))}
          </div>
          {vp >= BREAKPOINTS.MOBILE && newsItems.length > 4 && !showMoreNews && (
            <button id="gf-news-more" onClick={() => setShowMoreNewsAction(true)} className="gf-news__more-btn mt-3 w-full py-2 text-[14px] text-[#1a73e8] hover:bg-[var(--muted)] rounded-lg transition-colors">더보기</button>
          )}
        </div>

        {/* GF parity: horizontal scroll on every width (mobile included) instead of a vertical stack. */}
        <div id="gf-main-stock-tables" className="gf-stock-tables mb-6 flex gap-6 overflow-x-auto scroll-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { title: "최다 거래 종목", stocks: mostActiveStocks, showVolume: true },
            { title: "일 최대 상승 종목", stocks: gainers, showVolume: false },
            { title: "일 최대 하락 종목", stocks: losers, showVolume: false },
          ].map((tbl) => (
            <div key={tbl.title} className={vp < BREAKPOINTS.MOBILE ? "shrink-0 w-[300px]" : "flex-1 min-w-0"}>
              <h3 className={`${vp < BREAKPOINTS.MOBILE ? "text-[20px]" : "text-[14px]"} font-medium text-[var(--foreground)] mb-2`}>{tbl.title}</h3>
              <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 2px' }}>
                <tbody>
                  {tbl.stocks.map((stock) => (
                    <StockTableRow key={stock.rank} stock={stock} showVolume={tbl.showVolume} />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
