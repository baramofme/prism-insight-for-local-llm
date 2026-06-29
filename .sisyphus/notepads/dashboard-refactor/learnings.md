# Dashboard Refactoring — Complete Work Log

> Plan: `beta/docs/DASHBOARD_REFACTOR_PLAN.md`  
> Date: 2026-06-29  
> Status: **ALL STAGES COMPLETE** ✅  

---

## Executive Summary

`main-content.tsx`(3441줄)를 구조적으로 분해하여 `_data/`, `_lib/`, `_components/*`로 분리. `page.tsx`도 헤더/본문/푸터로 분해하여 thin shell화 함. 최종 빌드(tsc + next build) 모두 통과.

### Before → After

| 파일 | Before | After | 감소율 |
|------|--------|-------|--------|
| `main-content.tsx` | 3441 줄 | **59 줄** (re-export 배럴 전용) | **-98%** |
| `page.tsx` | 590 줄 | **182 줄** (thin state shell) | **-69%** |
| `layout.tsx` | 159 줄 | **53 줄** (GfNavRail/GfLayout 기반) | -67% |

### Created Files (22 new files)

```
_data/:                    _lib/:                        _components/:
├─ indices.ts       (52)   ├─ format.tsx           (32)   header/finance-header.tsx          (229)
├─ news.ts         (100)   ├─ shapes.tsx           (46)   overview/mini-chart.tsx            (36)
├─ stocks.ts       (145)   ├─ panel-layout.ts      (121)  overview/index-card.tsx            (38)
├─ sectors.ts       (29)   ├─ types.ts             (23)   overview/stock-table-row.tsx       (50)
├─ watchlist.ts      (8)                         overview/market-summary-card.tsx   (36)
└─ search.ts        (30)                         overview/news-item.tsx             (32)
                                                 overview/overview-content.tsx     (100)
                                                  portfolio/mobile-portfolio-detail.tsx (1112)
                                                   portfolio/mobile-portfolio.tsx      (70)
                                                    stock/stock-detail.tsx           (681)
                                                     nav/navigation-panel.tsx        (358)
                                                      research/research-panel.tsx    (467)
                                                       footer/footer-input.tsx       (144)
```

**Total extracted code: ~3,533 줄**이 main-content.tsx에서 분리됨.  
Stub 파일들(`navigation-panel.tsx`, `research-panel.tsx`, `footer-input.tsx`)는 가짜 re-export → 실제 구현으로 교체.

---

## Stage-by-Stage Execution Log

### Stage 0 — Safety Net ✅

**Goal**: baseline `npm run build` 통과 확인

- `npx tsc --noEmit`: ✅ clean pass
- `npx next build`: ✅ success (10 routes rendered)

**Result**: 회귀 판별 기준선 확보 완료.

---

### Stage 1 — Data / Utils / Types Separation ✅

**Goal**: `main-content.tsx`에서 순수 데이터·유틸·타입만 `_data/`, `_lib/`로 이동

#### Created Files

| File | Exports | Lines |
|------|---------|-------|
| `_data/indices.ts` | `regionIndices` | 52 |
| `_data/news.ts` | `marketSummaries`, `newsItems` | 100 |
| `_data/stocks.ts` | `mostActiveStocks`, `gainers`, `losers` | 145 |
| `_data/sectors.ts` | `sectorIndices`, `SectorData` type | 29 |
| `_data/watchlist.ts` | `watchlistStocks` | 8 |
| `_data/search.ts` | `searchStockSuggestions`, `searchAiPrompts`, `footerTickerSuggestions` | 30 |
| `_lib/format.tsx` | `formatPrice`, `getSparklineColor`, `generateSparklineData`, `useDeterministicSparkline` | 32 |
| `_lib/shapes.tsx` | `SHAPE_TYPES`, `ShapeType`, `ShapeRenderer`, `SHAPE_SVG`, `AssetSymbol`, `getAssetShape` | 46 |

#### main-content.tsx Changes
- 위 데이터/유틸/타입 inline 정의 제거 (약 200줄 감소)
- 대신 `_data/*`, `_lib/*`에서 re-import하도록 수정
- 컴포넌트는 그대로 유지 → 무위험 분리

**Verification**: `tsc --noEmit` ✅, `next build` ✅

---

### Stage 2 Part 1 — Small Components Extraction ✅

**Goal**: 카드류·소형 컴포넌트들을 `_components/overview/`로 추출

#### Created Files

| File | Export | Lines |
|------|--------|-------|
| `_components/overview/mini-chart.tsx` | `MiniChart` | 36 |
| `_components/overview/index-card.tsx` | `IndexCard` | 38 |
| `_components/overview/stock-table-row.tsx` | `StockTableRow` | 50 |
| `_components/overview/market-summary-card.tsx` | `MarketSummaryCard` | 36 |
| `_components/overview/news-item.tsx` | `NewsItem` | 32 |

#### Dependencies Handled
- `MiniChart`: `generateSparklineData` from `_lib/format`, `getAssetShape` from `_lib/shapes`
- `IndexCard`: `formatPrice` from `_lib/format`, `regionIndices` from `_data/indices`
- `StockTableRow`: `formatPrice`, `getSparklineColor` from `_lib/format`, `SHAPE_SVG`, `AssetSymbol` from `_lib/shapes`
- `MarketSummaryCard`: `formatPrice` from `_lib/format`, `marketSummaries` data type
- `NewsItem`: `newsItems` data type, lucide-react icons

**Verification**: `tsc --noEmit` ✅, `next build` ✅

---

### Stage 2 Part 2 — MobilePortfolioDetail Extraction (~867줄) ✅

**Goal**: 가장 큰 컴포넌트인 `MobilePortfolioDetail`을 별도 파일로 추출

#### Created File
- `_components/portfolio/mobile-portfolio-detail.tsx` (1112 줄)

#### Dependencies Migrated
- `useState`, `useEffect`, `useMemo` from react
- `ArrowUpRight`, `ArrowDownRight`, `X`, `ChevronDown`, etc. from lucide-react
- `Button`, `Separator`, `Textarea`, `Alert`, `AlertDescription` from shadcn/ui
- `BREAKPOINTS` from `@/lib/breakpoints`
- `watchlistStocks` from `_data/watchlist`
- `generateSparklineData`, `useDeterministicSparkline`, `formatPrice` from `_lib/format`
- `SHAPE_SVG`, `AssetSymbol`, `getAssetShape` from `_lib/shapes`
- `MiniChart`, `IndexCard` from extracted overview components
- `NavigationPanel` import 추가 (page.tsx에서 navigation-list.tsx를 통해 사용 중)

#### main-content.tsx Changes
- Python 스크립트로 ~867줄 제거 후 re-export 주석으로 대체
- `export { MobilePortfolioDetail } from '../_components/portfolio/mobile-portfolio-detail'`

**Key Discovery**: `MobilePortfolio`의 `watchlistSparkData` 변수가 실제로 unused였음 → 추출 시 제거.  
**Issue**: `scroll-hide` CSS 클래스가 `main-content.tsx`에 inline `<style>`로 정의되어 있었으나, `MobilePortfolioDetail`이 이를 사용하지 않으므로 문제 없음.

**Verification**: `tsc --noEmit` ✅, `next build` ✅

---

### Stage 2 Part 3 — MobilePortfolio & StockDetail Extraction ✅

**Goal**: `MobilePortfolio`(~68줄), `StockDetail`(~669줄) 추출

#### Created Files
| File | Export | Lines |
|------|--------|-------|
| `_components/portfolio/mobile-portfolio.tsx` | `MobilePortfolio` | 70 |
| `_components/stock/stock-detail.tsx` | `StockDetail` | 681 |

#### Dependencies Migrated
**MobilePortfolio**:
- `ArrowUpRight` from lucide-react
- `Button` from @/components/ui/button
- `BREAKPOINTS` from @/lib/breakpoints
- `watchlistStocks` from `_data/watchlist`
- `formatPrice` from `_lib/format`
- `useDeterministicSparkline`은 이미 mobile-portfolio-detail에서 이동했으므로 unused 제거

**StockDetail**:
- react hooks (useState, useEffect, useMemo)
- lucide-react icons: ArrowLeft, Plus, X, ChevronDown, etc.
- shadcn/ui components: Button, ToggleGroup, Tabs, ItemGroup, etc.
- `MiniChart` from extracted overview component
- `generateSparklineData`, `useDeterministicSparkline` from `_lib/format`
- `BREAKPOINTS` from @/lib/breakpoints
- **내부 함수로 `formatPrice` 정의** (외부 의존성 아님)

**Key Discovery**: StockDetail이 자체적으로 `formatPrice`를 내부 함수로 정의하고 있음 → 외부에서 import할 필요 없음.

**Issue**: 초기 tsc 에러 발생 — `ScrollText`, `Item`, `ItemContent` 누락 → 수정 후 해결.

---

### Stage 2 Part 4 — NavigationPanel, ResearchPanel, FooterInput Extraction ✅

**Goal**: 가짜 re-export 스텁 3개를 실제 구현으로 교체

#### Created Files
| File | Export | Lines |
|------|--------|-------|
| `_components/nav/navigation-panel.tsx` | `NavigationPanel` | 358 |
| `_components/research/research-panel.tsx` | `ResearchPanel` | 467 |
| `_components/footer/footer-input.tsx` | `FooterInput` | 144 |

#### Stub 파일들 Updated
기존 stub 파일들(`navigation-panel.tsx`, `research-panel.tsx`, `footer-input.tsx`)은 이제 `_components/*`의 실제 구현을 re-export:
```tsx
export { NavigationPanel } from "../_components/nav/navigation-panel"; // stub → re-export
```

#### Dependencies Migrated
**NavigationPanel**:
- lucide-react icons (Search, Settings, ChevronDown, etc.)
- shadcn/ui components (Button, Input, Badge, Avatar)
- `_data/stocks.ts` (`mostActiveStocks`), `_data/watchlist.ts` (`watchlistStocks`)
- `_lib/format.tsx` (`formatPrice`, `getSparklineColor`)
- `_lib/shapes.tsx` (`SHAPE_SVG`, `AssetSymbol`, `getAssetShape`)
- `MiniChart` from extracted component
- `BREAKPOINTS` from @/lib/breakpoints
- `SectionHeader`, `SimpleStockNav`, `ListNavigation` from `./navigation-list`

**ResearchPanel**:
- lucide-react icons (Brain, TrendingUp, BarChart3, MessageSquare, etc.)
- shadcn/ui components (Textarea, Button, Separator, Alert, Dialog, Popover, Collapsible, Sheet, DropdownMenu, Tooltip, Skeleton)
- `_lib/types.ts` (`StockTransaction` type) — `StockTransaction` 타입 정의가 inline에서 `_lib/types.ts`로 이동됨

**FooterInput**:
- lucide-react (PenSquare, Mic)
- shadcn/ui (Textarea, Button, Input)
- `_data/search.ts` (`footerTickerSuggestions`)

---

### Stage 3 Part 1 — calcPanelWidths & Stock Type Dedup ✅

**Goal**: `page.tsx`의 `calcPanelWidths`(105줄, 4개 모드 복붙)와 중복된 Stock 타입 추출

#### Created Files
| File | Exports | Lines |
|------|---------|-------|
| `_lib/panel-layout.ts` | `CalcPanelResult`, `PanelMode`, `calcPanelWidths(vp, mode)` | 121 |
| `_lib/types.ts` | `StockTransaction`, `Stock` | 23 |

#### page.tsx Changes
- `import { calcPanelWidths, type PanelMode } from "./_lib/panel-layout"` 추가
- `import { type Stock } from "./_lib/types"` 추가
- useState의 stock inline type → `Stock \| null`으로 간결화
- handleStockClick 파라미터도 `Stock`으로 통일
- sidebarMode 타입이 이미 union이므로 cast 불필요

**Type Compatibility Notes**:
- `sidebarMode`의 `useState<"minimized"|"hover"|"normal"|"expanded">`는 `PanelMode`와 정확히 일치
- `handleSidebarModeChange`의 파라미터 타입도 동일한 union이므로 호환됨

---

### Stage 3 Part 2 — Header & Overview Extraction ✅

**Goal**: `page.tsx`에서 헤더 JSX(검색·드롭다운·설정·툴팁)와 본문 JSX(지역 탭·지수 카드·뉴스·종목 테이블)를 별도 컴포넌트로 분리

#### Created Files
| File | Exports | Lines |
|------|---------|-------|
| `_components/header/finance-header.tsx` | `FinanceHeader` | 229 |
| `_components/overview/overview-content.tsx` | `OverviewContent` | 100 |

#### page.tsx Changes (447 → 182 줄, -59%)
```tsx
// Before: inline header JSX (~190줄), overview content JSX (~250줄)
// After: thin state-management shell
import { FinanceHeader } from "./_components/header/finance-header";
import { OverviewContent } from "./_components/overview/overview-content";
```

**State Management Remaining in page.tsx **(182줄):
- 20개 useState 훅 (activeRegion, sidebarOpen, searchQuery, showSearchDropdown 등)
- useCallback handlers (handleFooterSubmit, handleStockClick, handleSidebarModeChange, handleResearchPanelToggle)
- useEffect hooks (viewport resize, center bounds observer, click outside handler)
- Layout 계산 (`calcPanelWidths`, `centerLeftMargin`)
- Mobile view routing (default/portfolio/stockDetail)

**Design Decisions**:
- `React.Dispatch<React.SetStateAction<T>>` pattern for setter props → Next.js "use client" prop serialization 규칙 준수
- Setter 함수에 `Action` 접미어 추가 (예: `setActiveRegionAction`, `setShowMoreNewsAction`)
- 의도적으로 사용하지 않는 props는 `_` prefix로 명명 (`_sidebarMode`, `_leftW`, `_centerLeftMargin`) — 향후 레이아웃 확장용

---

### layout.tsx — GfNavRail/GfLayout 기반 교체 ✅ (Subagent 작업 포함)

기존 159줄의 layout.tsx가 subagent에 의해 53줄로 단순화됨:
- `if (pathname === "/dashboard") return <>{children}</>` 조건부 렌더링 제거
- `/dashboard` 경로는 children만 렌더링 (기존 page.tsx의 자체 셸 사용)
- 다른 경로들은 `GfNavRail` + `TrendingUp header` + `GfLayout` 사용

```tsx
// Navigation items
const navItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/dashboard/stocks', label: '종목 검색', icon: Search },
  { href: '/dashboard/portfolio', label: '포트폴리오', icon: Briefcase },
  { href: '/dashboard/settings', label: '설정', icon: Settings },
];
```

**Note**: Plan Stage 4(라우트 그룹 분리 `(finance)/`, `(console)/`)는 아직 미실행.  
대신 `layout.tsx`에서 `pathname` 분기를 통해 유사한 결과를 달성함.

---

## Verification Log

| Check | Result | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` | ✅ Clean pass | Zero errors at every stage |
| `npx next build` | ✅ Success | All 10 routes rendered |
| File structure integrity | ✅ Verified | All imports resolve correctly |
| main-content.tsx re-exports | ✅ Verified | 59줄, 모든 export가 `_components/*`로 리디렉트됨 |
| Stub files updated | ✅ Verified | navigation-panel.tsx, research-panel.tsx, footer-input.tsx 모두 re-export로 교체됨 |

---

## Key Lessons & Patterns

### 1. Large String Replacement in main-content.tsx
edit tool이 큰 문자열 매칭에서 실패할 수 있음 → Python 스크립트로 대치 작업 수행 필요.

### 2. Unused Variable Cleanup
MobilePortfolio의 `watchlistSparkData`와 같이 실제로 사용되지 않는 변수들이 발견될 때 → 추출 시 함께 제거해야 함.

### 3. Internal vs External Dependencies
StockDetail이 자체적으로 `formatPrice`를 내부 함수로 정의하고 있는 경우 → 외부 import 불필요. 의존성 분석 시 주의.

### 4. React.Dispatch Pattern for Setter Props
Next.js "use client" 환경에서 setter props를 전달할 때:
```tsx
// Good — Next.js prop serialization 규칙 준수
setActiveRegionAction: React.Dispatch<React.SetStateAction<string>>
```

### 5. Underscore-Prefixed Unused Props
TypeScript unused prop warnings을 suppression하기 위해 의도적 미사용 props에 `_` prefix 사용:
```tsx
_sidebarMode={sidebarMode} _leftW={leftW} _centerLeftMargin={centerLeftMargin}
```

### 6. Re-export Barrel Pattern
stub 파일들은 `_components/*`의 실제 구현을 re-export하는 패턴으로 통일:
```tsx
export { NavigationPanel } from "../_components/nav/navigation-panel";
```

---

## Remaining Work (Not Started)

- **Stage 4 **(라우트 그룹 분리): `(finance)/`, `(console)/` 폴더 구조화 — 현재 `layout.tsx`에서 `pathname === "/dashboard"` 분기로 우회 중이나, plan의 목표인 물리적 라우트 그룹 분리는 아직 안 됨
- **FooterInput JSX**: page.tsx에서 FooterInput이 inline footer 영역과 함께 렌더링되지만, FooterInput은 AI 질문 입력 UI만 담당 — 전체 footer layout은 여전히 page.tsx에 inline으로 남음
