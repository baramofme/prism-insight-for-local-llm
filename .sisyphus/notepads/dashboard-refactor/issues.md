# Dashboard Refactoring — Issues & Gotchas

## Issue 1: edit tool Large String Matching Failure
**Severity**: Medium  
**Description**: `main-content.tsx`(3441줄)에서 큰 문자열 매칭 시 edit tool이 실패. 특히 중첩된 JSX 블록이나 긴 함수 본체에서 정확히 일치하는 oldString을 찾기 어려움.  
**Workaround**: Python 스크립트로 대치 작업 수행.  
```python
import re
content = open('main-content.tsx').read()
content = content.replace(old_block, new_reexport_comment)
open('main-content.tsx', 'w').write(content)
```  
**Prevention**: 앞으로의 리팩터링에서는 작은 단위(한 번에 한 컴포넌트씩)로 분해하여 edit tool 사용.

## Issue 2: Unused Variable Discovery During Extraction
**Severity**: Low  
**Description**: MobilePortfolio 추출 시 `watchlistSparkData` 변수가 실제로 사용되지 않음 발견. main-content.tsx에서는 Sparkline 데이터를 계산하지만 mobile-portfolio-detail에서 이를 사용하지 않음.  
**Resolution**: 추출 시 해당 unused 변수 제거.  
**Lesson**: 의존성 분석 시 "사용되는 import"와 "정의만 하고 안 쓰는 변수"를 구분해야 함.

## Issue 3: StockDetail Internal formatPrice Definition
**Severity**: Low  
**Description**: StockDetail이 `_lib/format.tsx`에서 `formatPrice`를 import하지 않고 자체적으로 `function formatPrice(price: string): string { ... }`로 내부 정의하고 있음.  
**Impact**: 의존성 분석 시 `_lib/format`을 import할 필요가 없음 (중복 정의 아님).  
**Recommendation**: 향후 `_lib/format.tsx`의 `formatPrice`를 StockDetail에서도 사용하도록 통일하면 코드 중복 제거 가능 (별도 작업 권장).

## Issue 4: Initial tsc Errors from Missing Imports in stock-detail.tsx
**Severity**: Medium  
**Description**: `stock-detail.tsx` 생성 시 초기 빌드 에러 발생 — `ScrollText`, `Item`, `ItemContent` imports 누락.  
**Root Cause**: main-content.tsx에서 lucide-react 아이콘과 shadcn/ui 컴포넌트들이 한 줄에 여러 개 import되어 있어, 추출 시 일부 누락됨.  
```tsx
// Before (in main-content.tsx)
import { ..., ScrollText, ArrowLeft, ... } from 'lucide-react';
import { ItemGroup, ItemMedia, ItemTitle, ItemDescription, Item, ItemContent } from 'item';

// After (in stock-detail.tsx) - initially missing ScrollText, Item, ItemContent
import { ArrowLeft, Plus, X, ChevronDown, ArrowUpRight, ArrowDownRight, Newspaper } from 'lucide-react'; // ← ScrollText 누락!
import { ..., Item, ItemContent } from 'item'; // ← ItemGroup, ItemMedia, ItemTitle, ItemDescription 누락!
```  
**Resolution**: 누락된 import들을 모두 추가 후 재빌드 → clean pass.  
**Prevention**: 각 컴포넌트 추출 후 즉시 `tsc --noEmit` 실행하여 누락된 import를 조기에 발견.

## Issue 5: scroll-hide CSS Class in Inline Style Tag
**Severity**: Low  
**Description**: `main-content.tsx`의 최상위에 `<style>{`.scroll-hide::-webkit-scrollbar { display: none; } .scroll-hide { scrollbar-width: none; -ms-overflow-style: none; }`}</style>`가 inline으로 정의되어 있음.  
**Impact**: 이 스타일을 사용하는 컴포넌트가 `_components/*`로 분리되면 해당 스타일 태그에 접근할 수 없음(각 컴포넌트가 separate file이 되었으므로).  
**Current Status**: 현재까지 확인한 모든 컴포넌트에서 `.scroll-hide` 클래스 사용 시 문제 없음 — page.tsx의 root div에서 전역적으로 적용되고 있고, 하위 컴포넌트들이 이 스타일을 상속받음.  
**Future Risk**: 만약 어떤 컴포넌트가 독립적인 파일로 이동하면서 `.scroll-hide`를 사용하게 되면 스타일이 적용되지 않을 수 있음.

## Issue 6: NavigationPanel Large Prop Type (Inline Interface)
**Severity**: Low  
**Description**: `navigation-panel.tsx`(358줄)의 prop 타입이 inline으로 매우 큼(~20개 prop + 중첩된 StockTransaction type).  
```tsx
export function NavigationPanel({ ... }: { 
  mobile?: boolean; open?: boolean; onClose?: () => void; centerBounds?: {...}; 
  sidebarMode?: "minimized"|"hover"|"normal"|"expanded"; 
  onStockClick?: (stock: { ticker: string; name: string; price: number; qty: number; dailyProfit: number; ... }) => void;
  // ... 15+ more props
})
```  
**Impact**: 가독성 저하, 유지보수 어려움.  
**Recommendation**: Prop 타입을 `_lib/types.ts`로 분리하고 named interface로 정의하는 것이 좋음 (별도 작업 권장).

## Issue 7: OverviewContent Imports from main-content Barrel
**Severity**: Low  
**Description**: `overview-content.tsx`가 IndexCard, MarketSummaryCard, NewsItem, StockTableRow를 `_components/main-content` barrel를 통해 import함.
```tsx
import { IndexCard, MarketSummaryCard, NewsItem, StockTableRow } from "../../components/main-content";
```  
**Impact**: 간접 의존성 — main-content.tsx에서 re-export하므로, 만약 어떤 컴포넌트의 export 경로가 변경되면 overview-content.tsx도 깨짐.  
**Recommendation**: 직접 import 경로로 변경 권장:
```tsx
import { IndexCard } from "../overview/index-card";
import { MarketSummaryCard } from "../overview/market-summary-card";
// etc.
```

## Issue 8: Stage 4 Not Implemented
**Severity**: Informational  
**Description**: Plan의 Stage 4(라우트 그룹 분리 `(finance)/`, `(console)/`)는 아직 미실행됨.  
**Current State**: `layout.tsx`에서 `pathname === "/dashboard"` 조건부 렌더링으로 우회 중.  
**Future Work**: 
- `/dashboard` → `(finance)/page.tsx` (FinanceShell 사용)
- `/dashboard/stocks|portfolio|settings` → `(console)/stocks/page.tsx` 등 (GfNavRail/GfLayout 사용)
- 현재 GfNavRail/GfLayout 기반 레이아웃이 이미 구현되어 있으므로, 폴더 구조만 조정하면 됨.
