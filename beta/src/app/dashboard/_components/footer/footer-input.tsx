"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { footerTickerSuggestions } from "../../_data/search";

// GF cycles a suggested question inside the collapsed mobile chat bar.
const ROTATING_QUESTIONS = [
  "오늘 시장 현황이 어떤가요?",
  "S&P 500과 다우존스 산업평균지수 비교",
  "오늘 시장에서 가장 등락폭이 큰 종목은 무엇인가요?",
  "관심 목록에 대한 최신 통계는 어떤가요?",
];

export function FooterInput({ searchQuery, setSearchQuery, onSubmit }: { searchQuery: string; setSearchQuery: (v: string) => void; onSubmit?: (text: string) => void }) {
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setQuestionIdx((i) => (i + 1) % ROTATING_QUESTIONS.length), 4000);
    return () => clearInterval(t);
  }, []);
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
    <div id="gf-footer-search" className="gf-footer__search block lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white to-transparent px-4 pt-6 pb-4">
      <div className="max-w-[560px] mx-auto relative">
        {isFocused && (
          <div className="absolute bottom-full left-0 right-0 mb-3 bg-white border border-border rounded-2xl shadow-xl max-h-[70vh] overflow-y-auto p-4 flex flex-col gap-4">
            {!hasValue ? (
              <>
                <div id="gf-footer-popular-questions" className="gf-footer__popular-questions flex flex-col gap-1.5">
                  <h3 id="gf-footer-popular-title" className="gf-footer__popular-title text-[11px] font-bold text-muted-foreground/75 px-1">인기 질문</h3>
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
                <div className="flex flex-col gap-2 border-t border-border pt-3">
                  <div id="gf-footer-filter" className="gf-footer__filter flex gap-1.5 overflow-x-auto">
                    {(["all", "stock", "index"] as const).map(tab => (
                      <button key={tab} onClick={() => setStockFilter(tab)}
                        className={`gf-footer__filter-btn px-3 py-1 text-[12px] font-medium rounded-full cursor-pointer whitespace-nowrap transition-colors ${stockFilter === tab ? 'bg-foreground text-white gf-footer__filter-btn--active' : 'bg-muted text-muted-foreground hover:bg-border'}`}>
                        {tab === "all" ? "모두" : tab === "stock" ? "주식" : "인덱스"}
                      </button>
                    ))}
                  </div>
                  <div id="gf-footer-recommendations" className="gf-footer__recommendations flex flex-col divide-y divide-border">
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
            <Textarea id="gf-footer-search-input" value={inputText} onChange={e => setInputText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && hasValue && onSubmit) { e.preventDefault(); onSubmit(inputText); setInputText(''); setIsFocused(false); } }}
            rows={1} placeholder={isFocused || inputText ? "이 내용에 관해 질문하거나 검색하세요" : ROTATING_QUESTIONS[questionIdx]}
            className="gf-footer__search-input bg-transparent text-[14px] text-foreground outline-none resize-none max-h-32 leading-relaxed placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0" />
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
