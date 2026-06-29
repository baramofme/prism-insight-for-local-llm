# Dashboard Refactoring — Design Decisions

## Decision 1: `_` Prefix 폴더 구조 (Next.js App Router Private Colocation)
**Context**: Next.js App Router는 파일 시스템 기반 라우팅을 사용하며, `app/` 이하 모든 폴더가 라우트 경로에 포함됨.  
**Decision**: `_data/`, `_lib/`, `_components/` 접두사 사용 → Next.js가 이들을 라우트로 인식하지 않음.  
**Rationale**: `/dashboard/_data/*` 같은 URL이 생성되는 것을 방지. Plan에서 명시한 전략과 일치.

## Decision 2: Re-export Barrel Pattern for Stub Files
**Context**: 기존 `navigation-panel.tsx`(stub), `research-panel.tsx`(stub), `footer-input.tsx`(stub)는 모두 `export { X } from './main-content'` 형태로 main-content.tsx를 재export하고 있었음.  
**Decision**: 실제 구현 파일을 `_components/nav/navigation-panel.tsx` 등으로 만들고, stub 파일은 re-export만 하도록 변경.  
```tsx
// beta/src/app/dashboard/components/navigation-panel.tsx (stub → re-export)
export { NavigationPanel } from "../_components/nav/navigation-panel";
```  
**Rationale**: `page.tsx`나 `navigation-list.tsx` 등에서 사용하는 import 경로를 변경할 필요 없음 (하위 호환성 유지).

## Decision 3: React.Dispatch<SetStateAction<T>> for Setter Props
**Context**: page.tsx의 useState setter props(FinanceHeader, OverviewContent로 전달)를 Next.js "use client" 환경에서 직접 전달하면 prop serialization 경고 발생 가능.  
**Decision**: setter 함수에 `Action` 접미어 추가 + explicit type annotation 사용.
```tsx
setActiveRegionAction: React.Dispatch<React.SetStateAction<string>>
```  
**Rationale**: Next.js Server Component와의 prop 직렬화 규칙을 준수하며, TypeScript 타입 안전성 확보.

## Decision 4: Underscore-Prefixed Intentionally-Unused Props
**Context**: OverviewContent가 page.tsx의 레이아웃 관련 상태(sidebarMode, leftW 등)를 받지만 현재 사용하지 않음. 향후 레이아웃 확장을 위해 prop으로 남겨두어야 함.  
**Decision**: `_sidebarMode`, `_leftW`, `_centerLeftMargin` — `_` prefix로 TypeScript unused prop warning suppression.  
**Rationale**: prop 제거 시 page.tsx에서 pass하는 JSX에서도 에러 발생 → 향후 확장을 위해 prop 유지하되 warning suppression.

## Decision 5: CalcPanelWidths Logic Duplication Preserved (Not Refactored Yet)
**Context**: Plan Stage 3에서는 "4개 모드 중복 제거"를 권장했으나, 실제 구현은 original logic을 verbatim 이동함.  
**Decision**: 중복 제거는 별도 PR/Stage로 미룸. 우선 "move without changing behavior" 원칙 준수.  
**Rationale**: calcPanelWidths의 4개 모드(expanded, normal, hover, collapsed)는 leftW만 다르고 나머지는 동일하지만, wrapperMargin 계산이 mode별로 미세하게 달라서 단순 테이블화로 추출하기 어려움. 시각적 회귀 위험을 피하기 위해 로직 변경 없이 이동.

## Decision 6: FooterLayout Partial Extraction
**Context**: Plan에서는 `FinanceFooter` 컴포넌트 추출을 언급했으나, 실제 구현은 page.tsx에 footer JSX가 inline으로 남음.  
**Decision**: FooterInput(AI 질문 입력 UI)만 추출하고, 전체 footer layout(disclaimer + separator + nav links)은 page.tsx에 유지.  
**Rationale**: footer layout이 relatively 작고(20줄), FooterInput과 footer layout은 서로 다른 책임(사용자 상호작용 vs 페이지 하단 네비게이션) → 분리하지 않고 함께 유지하는 것이 더 명확함.

## Decision 7: Layout.tsx pathname Split Instead of Route Groups (Plan Stage 4 Alternative)
**Context**: Plan Stage 4는 `(finance)/`, `(console)/` 라우트 그룹 분리를 권장했으나, subagent 작업으로 GfNavRail/GfLayout 기반 레이아웃으로 교체됨.  
**Decision**: 물리적 라우트 그룹 대신 `pathname === "/dashboard"` 조건부 렌더링으로 우회.  
**Rationale**: 
- `/dashboard` 경로는 기존 page.tsx의 자체 셸(FinanceHeader + OverviewContent + FooterInput) 사용
- 다른 경로(`/dashboard/stocks|portfolio|settings`)는 GfNavRail + GfLayout 사용
- 결과적으로 두 셸이 물리적으로 분리된 것과 동일한 효과 달성
- **Trade-off**: URL 구조는 동일하지만 폴더 구조가 계획과 다름. 나중에 라우트 그룹으로 마이그레이션 가능.
