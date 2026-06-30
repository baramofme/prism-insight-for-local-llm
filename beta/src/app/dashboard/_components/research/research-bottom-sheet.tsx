"use client";

import { useRef, useState } from "react";
import { PenSquare, ScrollText, X, Maximize2, Search, Globe, Plus } from "lucide-react";

const QUESTIONS = [
  "오늘 시장 현황이 어떤가요?",
  "삼성전자와 SK하이닉스의 최근 상승 원인은 무엇인가요?",
  "일본 엔화 가치가 계속 하락하는 이유는 무엇인가요?",
];

/**
 * GF mobile (<=766px) research surface: a draggable bottom sheet.
 *  - peek      : drag handle + 조사 header + input trigger
 *  - thin      : drag handle + input trigger only (when the page is scrolled down)
 *  - expanded  : full panel (greeting / suggested questions / actions) + input trigger
 * Drag the handle up/down (or tap) to expand/collapse. Tapping the input trigger
 * (in any state) opens the shared search modal rather than expanding the sheet.
 */
export function ResearchBottomSheet({
  collapsed = false,
  onOpenSearch,
  onSubmit,
}: {
  collapsed?: boolean; // page scrolled down → collapse to the thin input bar
  onOpenSearch?: () => void; // tap the input trigger → open the search modal
  onSubmit?: (text: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const startY = useRef(0);

  // Scrolled-down collapses to the thin bar unless the user expanded it.
  const thin = collapsed && !expanded;

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const dy = e.clientY - startY.current;
    if (dy < -30) setExpanded(true);
    else if (dy > 30) setExpanded(false);
    else setExpanded((v) => !v);
  };

  return (
    <div
      className={`gf-research-sheet block md:hidden fixed inset-x-0 bottom-0 z-50 bg-white border-t border-border rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.10)] flex flex-col transition-[height] duration-300 ease-out ${expanded ? "h-[88vh]" : "h-auto"}`}
    >
      {/* drag handle */}
      <div
        className="flex justify-center pt-2 pb-1 cursor-grab touch-none select-none shrink-0"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        aria-label={expanded ? "조사 접기" : "조사 펼치기"}
        role="button"
      >
        <div className="w-9 h-1 rounded-full bg-muted-foreground/30" />
      </div>

      {/* 조사 header — hidden when collapsed to the thin bar */}
      {!thin && (
        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <h2 className="text-[20px] font-semibold text-foreground" aria-label="조사">조사</h2>
          <div className="flex items-center gap-0.5">
            <button className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="새 대화목록"><PenSquare className="w-4 h-4 text-muted-foreground" /></button>
            <button className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="대화목록 및 작업"><ScrollText className="w-4 h-4 text-muted-foreground" /></button>
            {expanded ? (
              <button onClick={() => setExpanded(false)} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="접기"><X className="w-4 h-4 text-muted-foreground" /></button>
            ) : (
              <button onClick={() => setExpanded(true)} className="p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="펼치기"><Maximize2 className="w-4 h-4 text-muted-foreground" /></button>
            )}
          </div>
        </div>
      )}

      {/* expanded body */}
      {expanded && (
        <div className="flex-1 overflow-y-auto scroll-hide px-4 py-3 border-t border-border">
          <div className="text-[15px] text-foreground mb-5 leading-relaxed"><span className="font-medium">JIHOON</span>님, 안녕하세요. 금융 관련 질문을 해 보세요.</div>
          <div className="space-y-2 mb-6">
            {QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => onSubmit?.(q)} className="w-full flex items-center justify-between pl-5 pr-4 py-3 rounded-xl border border-border hover:bg-muted cursor-pointer transition-colors text-left">
                <span className="text-[14px] text-foreground">{q}</span>
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
          <div>
            <div className="text-[12px] font-medium text-muted-foreground mb-2">가능한 작업 알아보기</div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-[14px] text-foreground"><Plus className="w-4 h-4 text-muted-foreground" /> 포트폴리오 만들기</button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-[14px] text-foreground"><Globe className="w-4 h-4 text-muted-foreground" /> Deep Search</button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-[14px] text-foreground"><Search className="w-4 h-4 text-muted-foreground" /> 내 관심 목록 분석</button>
            </div>
          </div>
        </div>
      )}

      {/* input trigger — tapping opens the search modal (never just expands) */}
      <div className={`px-3 shrink-0 ${expanded ? "border-t border-border pt-2 pb-3" : "pt-1 pb-3"}`}>
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full bg-muted/80 border border-border rounded-full px-4 py-2.5 flex items-center gap-3 text-left"
          aria-label="검색하거나 질문하세요"
        >
          <Search className="w-4 h-4 text-primary shrink-0" />
          <span className="flex-1 min-w-0 text-[14px] text-muted-foreground truncate">검색하거나 질문하세요</span>
        </button>
      </div>
    </div>
  );
}
