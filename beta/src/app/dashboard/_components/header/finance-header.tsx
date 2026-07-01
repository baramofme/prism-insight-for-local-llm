"use client";

import { useRef, useCallback, useState } from "react";
import { Menu, Search, Globe, Brain, TrendingUp, BarChart3, Settings, Monitor, Moon, Sun, Check, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchStockSuggestions, searchAiPrompts } from "../../_data/search";
import { type Stock } from "../../_lib/types";

export function FinanceHeader({
  searchQuery,
  setSearchQuery,
  showSearchDropdown,
  setShowSearchDropdown,
  showSettingsDropdown,
  setShowSettingsDropdown,
  tooltip,
  setTooltip,
  tooltipPos,
  setTooltipPos,
  handleStockClick,
  collapsed = false,
  onMenuClick,
  priceColor,
  setPriceColor,
  theme,
  setTheme,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  showSearchDropdown: boolean;
  setShowSearchDropdown: (v: boolean) => void;
  showSettingsDropdown: boolean;
  setShowSettingsDropdown: (v: boolean) => void;
  tooltip: string | null;
  setTooltip: (v: string | null) => void;
  tooltipPos: { x: number; y: number };
  setTooltipPos: (v: { x: number; y: number }) => void;
  handleStockClick: (stock: Stock) => void;
  collapsed?: boolean;
  onMenuClick?: () => void;
  priceColor: "local" | "intl";
  setPriceColor: (v: "local" | "intl") => void;
  theme: "system" | "dark" | "light";
  setTheme: (v: "system" | "dark" | "light") => void;
}) {
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSuggestionClick = useCallback(
    (s: { ticker: string; name: string; price: string; change: string; positive: boolean }) => {
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
    },
    [handleStockClick, setSearchQuery, setShowSearchDropdown],
  );

  return (
    <header id="gf-header" className="gf-header sticky top-0 z-30 bg-card border-b border-[var(--border)] max-w-[1820px] mx-auto w-full transition-transform duration-300 ease-out will-change-transform" style={collapsed ? { transform: "translateY(-100%)" } : undefined}>
      <div className="grid items-center px-4 min-h-[60px] md:min-h-[80px]" style={{ gridTemplateColumns: '324px 1fr auto' }}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="메뉴 열기" className="md:hidden p-2 hover:bg-[var(--muted)] rounded-full transition-colors">
            <Menu className="w-5 h-5 text-[var(--muted-foreground)]" />
          </Button>
          <a id="gf-header-logo" href="/dashboard" aria-label="Finance 홈" className="gf-header__logo flex items-center gap-1.5 rounded-md hover:bg-[var(--muted)] px-1 -mx-1 py-0.5 transition-colors">
            <span className="gf-header__logo-text text-[24px] font-bold text-[var(--foreground)]">Finance</span>
            <span className="gf-header__beta-badge text-[12px] text-[var(--muted-foreground)] bg-[var(--border)] px-1.5 py-0.5 rounded-md font-medium">Beta</span>
          </a>
        </div>

        <div id="gf-header-marketnav" className="gf-header__nav hidden min-[1040px]:flex justify-start">
          <div className="relative w-full max-w-xl" ref={searchDropdownRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              ref={searchInputRef}
              type="text"
              aria-label="주식, ETF 등을 검색하세요"
              placeholder="주식, ETF 등을 검색하세요"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full pl-11 pr-4 py-2.5 bg-[var(--muted)] rounded-full text-[14px] text-[var(--foreground)] placeholder-[var(--muted-foreground)] border-none focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20"
            />

            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-[var(--border)] rounded-2xl shadow-xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
                {searchQuery.trim() ? (
                  <div className="p-3">
                    <div className="text-[11px] font-semibold text-[var(--muted-foreground)] px-2 mb-2">종목 이동 및 필터링</div>
                    <div className="space-y-0.5">
                      {searchStockSuggestions
                        .filter(s => s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, 5)
                        .map(s => (
                          <div
                            key={s.ticker}
                            onClick={() => handleSuggestionClick(s)}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--muted)] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center text-[11px] font-bold text-[var(--muted-foreground)]">
                                {s.ticker.slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-[14px] font-semibold text-[var(--foreground)]">{s.name}</div>
                                <div className="text-[12px] text-[var(--muted-foreground)]">{s.ticker}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[14px] text-[var(--foreground)] tabular-nums">{s.price}</div>
                              <div className={`text-[12px] font-medium ${s.positive ? 'text-[var(--gf-up)]' : 'text-[var(--gf-down)]'}`}>{s.change}</div>
                            </div>
                          </div>
                        ))}
                      {searchStockSuggestions.filter(s => s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="px-3 py-4 text-center text-[14px] text-[var(--muted-foreground)]">검색 결과 없음</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="text-[11px] font-semibold text-[var(--muted-foreground)] px-2 mb-2">AI에게 물어보기</div>
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
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--muted)] cursor-pointer transition-colors"
                          >
                            <div className="w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center">
                              <Icon className="w-4 h-4 text-[var(--muted-foreground)]" />
                            </div>
                            <div>
                              <div className="text-[14px] font-semibold text-[var(--foreground)]">{prompt.label}</div>
                              <div className="text-[12px] text-[var(--muted-foreground)]">{prompt.description}</div>
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

        <div id="gf-header-controls" className="gf-header__controls relative flex items-center justify-end gap-0.5" ref={settingsDropdownRef}>
          <button
            onClick={() => { setShowSearchDropdown(true); searchInputRef.current?.focus(); }}
            onMouseEnter={(e) => { setTooltip("검색 또는 질문하기"); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
            onMouseLeave={() => setTooltip(null)}
            id="gf-header-search-btn"
            className="gf-header__icon-btn relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--muted)] active:bg-[var(--border)] transition-colors focus:outline-none"
            aria-label="검색 또는 질문하기"
          >
            <Search className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>

          {/* Settings menu — matches GF: 테마 + 가격 색상 시스템 (radio selections). */}
          {showSettingsDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-card border border-[var(--border)] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.15)] min-w-[248px] z-50 overflow-hidden py-2">
              <div className="px-4 pt-1 pb-1.5 text-[12px] font-semibold text-[var(--muted-foreground)]">테마</div>
              {([["system", "기기 기본값", Monitor], ["dark", "어두운 테마", Moon], ["light", "밝은 테마", Sun]] as const).map(([key, label, Icon]) => (
                <button key={key} onClick={() => setTheme(key)} className="w-full flex items-center gap-3 px-4 py-2 text-[14px] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors text-left">
                  <Icon className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="flex-1">{label}</span>
                  {theme === key && <Check className="w-4 h-4 text-[#1a73e8]" />}
                </button>
              ))}
              <div className="border-t border-[var(--border)] my-1" />
              <div className="px-4 pt-1 pb-1.5 text-[12px] font-semibold text-[var(--muted-foreground)]">가격 색상 시스템</div>
              {([["local", "현지 시장"], ["intl", "국제"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setPriceColor(key)} className="w-full flex items-center gap-3 px-4 py-2 text-[14px] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors text-left">
                  <span className="flex-1">{label}</span>
                  {priceColor === key && <Check className="w-4 h-4 text-[#1a73e8]" />}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => { setShowSettingsDropdown(!showSettingsDropdown); setShowFeedback(false); setShowProfile(false); }}
            onMouseEnter={(e) => { if (!showSettingsDropdown) setTooltip("설정"); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
            onMouseLeave={() => setTooltip(null)}
            id="gf-header-settings-btn"
            className="gf-header__icon-btn relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--muted)] active:bg-[var(--border)] transition-colors focus:outline-none"
            aria-label="설정"
          >
            <Settings className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>

          {/* Feedback — GF opens an external tool; a lightweight mock here. */}
          <button
            onClick={() => { setShowFeedback(!showFeedback); setShowSettingsDropdown(false); setShowProfile(false); }}
            id="gf-header-feedback-btn"
            onMouseEnter={(e) => { if (!showFeedback) setTooltip("의견 보내기"); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
            onMouseLeave={() => setTooltip(null)}
            className="gf-header__icon-btn relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--muted)] active:bg-[var(--border)] transition-colors focus:outline-none"
            aria-label="의견 보내기"
          >
            <MessageSquare className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
          {showFeedback && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-[var(--border)] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.15)] z-50 p-4">
              <div className="text-[14px] font-medium text-[var(--foreground)] mb-2">의견 보내기</div>
              <textarea rows={3} placeholder="의견이나 문제를 알려주세요" className="w-full text-[13px] border border-[var(--border)] rounded-lg p-2 outline-none focus:border-[#1a73e8] resize-none" />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" className="h-8 px-3 text-[13px]" onClick={() => setShowFeedback(false)}>취소</Button>
                <Button className="h-8 px-3 text-[13px] bg-[#1a73e8] text-white" onClick={() => setShowFeedback(false)}>보내기</Button>
              </div>
            </div>
          )}

          {/* Profile — Google account menu (mock). */}
          <button
            onClick={() => { setShowProfile(!showProfile); setShowSettingsDropdown(false); setShowFeedback(false); }}
            id="gf-header-profile"
            className="gf-header__profile w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-[14px] font-medium cursor-pointer hover:shadow-md transition-shadow ring-2 ring-transparent hover:ring-[var(--border)]"
            aria-label="Google 계정"
          >
            U
          </button>
          {showProfile && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-[var(--border)] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.15)] z-50 overflow-hidden">
              <div className="p-4 text-center border-b border-[var(--border)]">
                <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-[18px] font-medium mx-auto mb-2">U</div>
                <div className="text-[14px] font-medium text-[var(--foreground)]">사용자</div>
                <div className="text-[12px] text-[var(--muted-foreground)]">user@example.com</div>
              </div>
              <button onClick={() => setShowProfile(false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors text-left">
                <LogOut className="w-4 h-4 text-[var(--muted-foreground)]" /> 로그아웃
              </button>
            </div>
          )}

          {tooltip && (
            <div
              className="fixed z-[9999] pointer-events-none px-2 py-1 bg-foreground text-background text-[12px] rounded-md whitespace-nowrap shadow-lg"
              style={{ left: tooltipPos.x - 40, top: tooltipPos.y + 16 }}
            >
              {tooltip}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
