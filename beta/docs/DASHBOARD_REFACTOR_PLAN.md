# Dashboard 정리(리팩터링) 계획

> 대상: `beta/src/app/dashboard/`
> 작성: 2026-06-29
> 셸 통일 방식: **(A) 라우트 그룹 분리** 확정
> 상태: **계획만 확정 — 실행 전** (단계별 착수 시 각 Stage 끝마다 `npm run build` 통과 확인)

---

## 1. 진단 — 실제 문제

사용자 체감("page.tsx·layout.tsx가 분리 안 됨")의 진짜 범인은 따로 있다.

| 파일 | 줄 | 문제 |
|---|---|---|
| **`components/main-content.tsx`** | **3441** | 🔥 **잡동사니 서랍**. 이름은 "main content"인데 **앱 전체**가 들어있음 — 유틸·목데이터·타입 + 모든 컴포넌트(StockDetail 671줄, MobilePortfolioDetail 867줄, NavigationPanel·ResearchPanel·FooterInput·카드들). export 25개 |
| `page.tsx` | 590 | `useState` ~20개 + `calcPanelWidths`(100줄, **4개 모드가 거의 복붙**) + 헤더 인라인(검색·드롭다운·설정·툴팁 190줄) + 푸터 인라인 + 본문 인라인 + **stock 타입 ×3 중복** |
| `layout.tsx` | 159 | `if (pathname === "/dashboard") return <>{children}</>` — **/dashboard는 layout을 건너뛰고 page.tsx 안에서 자기 셸(헤더·푸터·사이드바)을 직접 그림.** stocks/portfolio/settings만 layout 사이드바 셸 사용 → **셸이 2개로 충돌** |
| `navigation-panel.tsx` / `research-panel.tsx` / `footer-input.tsx` | 각 1 | **가짜 re-export 스텁** (`export { X } from './main-content'`). 분리된 척만 함 |

### 핵심 원인 3가지
1. `main-content.tsx` 가 모든 걸 빨아들인 **배럴(junk drawer)**.
2. `page.tsx` 가 layout이 할 일(셸·반응형 레이아웃 계산)까지 떠안음.
3. 셸이 **두 갈래**(/dashboard 자체 셸 vs layout 사이드바 셸)로 갈려 `pathname` 핵으로 봉합됨.

### 의존 그래프(현재)
- `page.tsx`, `navigation-list.tsx`, 그리고 3개 스텁 → **전부 `main-content.tsx` 한 파일에 의존.**
- `navigation-list.tsx` → `main-content`의 `MiniChart`, `formatPrice`, `getSparklineColor` 사용.

---

## 2. 목표 구조

```
src/app/dashboard/
  (finance)/                 # GF 풀페이지 셸 (사이드바 공유 X)
    layout.tsx               #   FinanceShell — 헤더 + 그리드 + 푸터 + 상태
    page.tsx                 #   <OverviewContent/> (thin)
  (console)/                 # 사이드바 셸
    layout.tsx               #   현재 Sidebar 레이아웃 그대로 이동
    stocks/  portfolio/  settings/
  _data/        indices.ts  news.ts  stocks.ts  sectors.ts  watchlist.ts  search.ts
  _lib/         panel-layout.ts   types.ts(Stock/Transaction 단일)   format.ts
  _components/
    header/    finance-header.tsx · search-dropdown.tsx · settings-menu.tsx
    nav/       navigation-panel.tsx
    research/  research-panel.tsx
    footer/    finance-footer.tsx · footer-input.tsx
    overview/  region-tabs · index-card · market-summary-card · news-item · stock-table-row · mini-chart
    portfolio/ mobile-portfolio · mobile-portfolio-detail
    stock/     stock-detail.tsx
```

> `_` 접두 폴더 = Next.js App Router에서 라우트 제외(private) → 안전한 colocation.

---

## 3. 단계별 계획

각 Stage 종료 시 **`npm run build` + 타입체크 통과**를 게이트로 둔다.

### Stage 0 — 안전망
- `npm run build` / 타입체크 baseline 통과 확인 (회귀 판별 기준선).
- 가능하면 주요 뷰포트 스냅샷 1세트 확보(시각 회귀 비교용).

### Stage 1 — 데이터·유틸·타입 분리 (무위험, 효과 큼)
- `main-content.tsx`에서 **순수 데이터/타입/포맷만** `_data/`·`_lib/`로 이동:
  - 데이터: `regionIndices`, `marketSummaries`, `newsItems`, `mostActiveStocks`, `gainers`, `losers`, `sectorIndices`, `watchlistStocks`, `searchStockSuggestions`, `searchAiPrompts`, `footerTickerSuggestions`
  - 유틸/타입: `formatPrice`, `getSparklineColor`, `SHAPE_TYPES`/`ShapeType`/`ShapeRenderer`/`SHAPE_SVG`, `SectorData`(및 inline 타입)
- 컴포넌트는 그대로 두고 **import만 갱신**. → 3441줄에서 비(非)컴포넌트 덩어리부터 안전하게 덜어냄.

### Stage 2 — 컴포넌트 추출
- 거대 컴포넌트부터 자기 파일로 이동: `StockDetail`(671) → `MobilePortfolioDetail`(867) → `NavigationPanel`(356) → `ResearchPanel`(429) → `MobilePortfolio` → 카드류(`IndexCard`·`StockTableRow`·`MarketSummaryCard`·`NewsItem`·`MiniChart`) → `FooterInput`.
- **가짜 스텁 3개**(`navigation-panel`·`research-panel`·`footer-input`)는 실제 파일로 대체.
- 끝나면 `main-content.tsx` **삭제**(또는 `index.ts` 배럴만 잔존).

### Stage 3 — page.tsx 분해
- `calcPanelWidths` → `_lib/panel-layout.ts`로 추출하고 **4개 모드 중복 제거**
  (모드별로 `leftW`만 다르고 right/center 분기는 동일 → 공통 함수 + `leftW` 테이블화).
- 헤더/푸터/본문 분리:
  - `FinanceHeader`(+ `SearchDropdown` · `SettingsMenu`)
  - `FinanceFooter`
  - `OverviewContent`(지역 탭·지수 카드·뉴스·종목 테이블)
- 상태 묶음 → 훅 추출(`useSidebarMode` · `useViewport` · `useDropdown`) 후 `FinanceShell`로 이동.
- **stock 타입 ×3 중복** → `_lib/types.ts` 단일 `Stock`/`Transaction` 타입으로 통합.

### Stage 4 — 셸 통일: (A) 라우트 그룹 분리 **[확정]**
- `layout.tsx`의 `pathname === "/dashboard"` 핵 **제거**.
- 라우트 그룹으로 셸을 물리적으로 분리:
  - `(finance)/layout.tsx` = `FinanceShell` (GF 풀페이지) → `(finance)/page.tsx` = `/dashboard`
  - `(console)/layout.tsx` = 현재 사이드바 레이아웃 → `(console)/stocks|portfolio|settings`
- 두 그룹 모두 `/dashboard/*`로 매핑되되 URL 충돌 없음(`(finance)/page.tsx` → `/dashboard`, `(console)/stocks/page.tsx` → `/dashboard/stocks`).
- 효과: `pathname` 분기 없이 셸이 깔끔하게 둘로 나뉨.

#### 대안(채택 안 함)
- (B) page.tsx의 FinanceShell을 그대로 layout으로 승격 — 구조 변경 최소이나 두 셸 충돌 잔존.
- (C) 둘을 단일 셸로 통합 — GF 풀페이지 레이아웃을 포기해야 해 비용 최대. 비추.

---

## 4. main-content.tsx export 인벤토리 (이동 매핑 기준)

| export | 종류 | 이동 대상 |
|---|---|---|
| `formatPrice`, `getSparklineColor` | 유틸 | `_lib/format.ts` |
| `SHAPE_TYPES`/`ShapeType`/`ShapeRenderer`/`SHAPE_SVG` | 타입·상수 | `_lib/` (예: `shapes.ts`) |
| `SectorData` 및 inline 타입 | 타입 | `_lib/types.ts` |
| `regionIndices` | 데이터 | `_data/indices.ts` |
| `marketSummaries`, `newsItems` | 데이터 | `_data/news.ts` 또는 `market.ts` |
| `mostActiveStocks`, `gainers`, `losers` | 데이터 | `_data/stocks.ts` |
| `sectorIndices` | 데이터 | `_data/sectors.ts` |
| `watchlistStocks` | 데이터 | `_data/watchlist.ts` |
| `searchStockSuggestions`, `searchAiPrompts`, `footerTickerSuggestions` | 데이터 | `_data/search.ts` |
| `MiniChart` | 컴포넌트 | `_components/overview/mini-chart.tsx` |
| `IndexCard` | 컴포넌트 | `_components/overview/index-card.tsx` |
| `StockTableRow` | 컴포넌트 | `_components/overview/stock-table-row.tsx` |
| `MarketSummaryCard` | 컴포넌트 | `_components/overview/market-summary-card.tsx` |
| `NewsItem` | 컴포넌트 | `_components/overview/news-item.tsx` |
| `MobilePortfolioDetail` | 컴포넌트 | `_components/portfolio/mobile-portfolio-detail.tsx` |
| `MobilePortfolio` | 컴포넌트 | `_components/portfolio/mobile-portfolio.tsx` |
| `StockDetail` | 컴포넌트 | `_components/stock/stock-detail.tsx` |
| `NavigationPanel` | 컴포넌트 | `_components/nav/navigation-panel.tsx` |
| `ResearchPanel` | 컴포넌트 | `_components/research/research-panel.tsx` |
| `FooterInput` | 컴포넌트 | `_components/footer/footer-input.tsx` |

---

## 5. 리스크 / 주의

- **컴포넌트 간 의존**: `StockDetail`·`MobilePortfolioDetail` 등은 `MiniChart`/`formatPrice`/`SHAPE_SVG` 등을 사용 → 추출 시 각 파일 import 재구성 필요(가장 손 많이 가는 부분).
- **`"use client"` 경계**: 추출된 컴포넌트/훅 파일 상단에 지시어 유지.
- **반응형 회귀**: `calcPanelWidths` 중복 제거 시 4개 모드 동작이 **시각적으로 동일**한지 뷰포트별(모바일/태블릿/1371/1445/1820) 확인.
- **라우트 그룹 이동**: page.tsx/layout.tsx 경로가 바뀌므로 상대 import 경로 점검.

---

## 6. 권장 착수 순서

`Stage 0 → 1 → 2 → 3 → 4`. Stage 1은 무위험이라 단독 PR로 먼저 머지 가능. Stage 4(라우트 그룹)는 page/layout 이동을 포함하므로 Stage 3 완료 후 별도 커밋 권장.
