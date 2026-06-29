import type { ReactNode } from 'react';

interface GfLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

/**
 * Google Finance 반응형 레이아웃 컨테이너
 *
 * CSS 변수 기반 마진 계산 (--main-margin-left):
 *   <760px  → 0       (네비 숨김)
 *   ≥760px  → 80px    (collapsed 레일)
 *   ≥1480px → 320px   (expanded 레일)
 *
 * 전체 컨테이너 max-width 1820px + 센터링 (≥1820px)
 */
export function GfLayout({ children, rightPanel }: GfLayoutProps) {
  return (
    <div id="gf-layout" className="gf-layout mx-auto flex w-full max-w-[1820px]">
      {/* 메인 콘텐츠 영역 — margin-left = 네비 폭 반영 */}
      <main
        id="gf-main-content"
        data-gf="main-content"
        className="gf-layout__main min-w-0 flex-1 p-4 gf-sm:p-6"
        style={{ marginLeft: 'var(--main-margin-left)' }}
      >
        {children}
      </main>

      {/* 우측 조사 패널 자리 — ~1000px↑ 등장 (gf-md=1380px 이상) */}
      {rightPanel && (
        <aside
          id="gf-research-panel"
          data-gf="research-panel"
          className="gf-layout__right hidden w-0 flex-none gf-md:block gf-md:flex-grow gf-md:min-w-[314px]"
        >
          {rightPanel}
        </aside>
      )}
    </div>
  );
}
