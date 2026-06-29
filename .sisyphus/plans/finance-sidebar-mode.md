# Finance Sidebar Mode Switch

## TL;DR

> **Quick Summary**: shadcn sidebar-02 VersionSwitcher 패턴으로 메인/파이낸스 모드 전환을 구현. Finance 모드에서는 좌측 네비에 Equity Sectors + Watchlist(Select 전환), 중앙에 Market Overview 랜딩 페이지, 우측에 Research AI Chat UI 패널을 제공.
>
> **Deliverables**:
> - VersionSwitcher (main/finance mode toggle) → `app-sidebar.tsx` 통합
> - FinanceSidebar 좌측 네비 (Sectors + Watchlist Select 전환)
> - Market Overview 페이지 (`/dashboard/finance/page.tsx`)
> - Research AI Chat 우측 패널 (UI shell)
> - Mock 데이터 확장 (indices, sectors, news, watchlist)
> - TDD 테스트 (bun test)
>
> **Estimated Effort**: Medium-Large (10-14 tasks, ~3 waves)
> **Parallel Execution**: YES — 3 waves, max 5 concurrent
> **Critical Path**: Types → Mock Data → VersionSwitcher + State → FinanceSidebar → MarketOverview → Integration

---

## Context

### Original Request
사이드바에 main/finance 모드를 전환하는 VersionSwitcher를 추가하고, finance 모드에서는 Google Finance 스타일의 좌측 네비 + Market Overview + Research AI Chat을 제공.

### Interview Summary
**Key Decisions**:
- **메인 랜딩**: Market Overview (지수 + 뉴스 + 인기종목) — `/dashboard/finance/page.tsx` 신규
- **좌측 네비**: Equity Sectors + Watchlist를 Select dropdown으로 전환
- **Research AI Chat**: 포함 (UI shell, AI 백엔드 없음)
- **테스트**: TDD (bun test)
- **데이터**: Mock data (기존 패턴 유지), 실제 API 연동 없음

**Research Findings**:
- GF `/beta/`: Market Overview — 지역 탭(US/Europe/Asia/FX/Crypto/Futures) + 지수 + 뉴스 + Most Active/Gainers/Losers
- GF `/beta/portfolio/{id}`: Portfolio View (empty state: "Nothing in this portfolio yet")
- GF `/beta/quote/{symbol}`: Stock Detail — 이미 `[symbol]/page.tsx`에 구현 완료
- GF 좌측 네비: 321px(expanded) / 301px(normal) / 81px(collapsed/rail)
- 우측 Research 패널: AI chat + suggested prompts + thread history
- 11개 Equity Sectors (SIXB~SIXY): Materials, Communications, Energy, Industrials, Financials, Staples, Real Estate, Technology, Utilities, Health Care, Discretionary

### Metis Review
**Identified Gaps** (addressed):
- **Infobar vs Research Chat 충돌**: FinanceView가 `useInfobar().setContent()` 사용. 해결: finance mode에서 InfoSidebar → Research Chat 교체. FinanceView의 infobar 호출은 finance mode에서 조건부 비활성화 (default로 설정)
- **Mode state 저장**: Zustand store로 관리 (기존 코드베이스 패턴 일관성)
- **VersionSwitcher 위치**: SidebarHeader에 OrgSwitcher 아래 추가. OrgSwitcher는 항상 표시.
- **Mock data 규모**: 11 sectors, 5 indices, 5 news items, 3 watchlist stocks, 각 market mover 카테고리별 3종목

---

## Work Objectives

### Core Objective
사이드바에 VersionSwitcher를 도입해 main/finance 모드를 전환하고, finance 모드에서 GF 스타일 좌측 네비 + Market Overview + Research Chat을 제공한다.

### Concrete Deliverables
- `alpha/src/components/layout/version-switcher.tsx` — main/finance 모드 전환 dropdown
- `alpha/src/components/layout/finance-sidebar.tsx` — Finance 모드 좌측 네비
- `alpha/src/components/layout/research-chat-panel.tsx` — 우측 Research Chat UI
- `alpha/src/app/dashboard/finance/page.tsx` — Market Overview 랜딩 페이지
- `alpha/src/features/finance/types.ts` 확장 (Sector, MarketIndex, MarketMover 등)
- `alpha/src/features/finance/data/mock.ts` 확장 (멀티 종목 + 지수 + 섹터)
- `alpha/src/stores/app-mode.ts` — mode state (Zustand)
- `alpha/src/components/layout/app-sidebar.tsx` 수정 — VersionSwitcher + 조건부 렌더링

### Definition of Done
- [ ] `bun run build` 통과 (TypeScript strict, zero error)
- [ ] `bun test` — 기존 4개 + 신규 TDD 테스트 모두 통과
- [ ] curl/Playwright: `/dashboard/finance` 접속 → Market Overview 렌더링
- [ ] curl/Playwright: `/dashboard/finance/000660:KRX` 접속 → 기존 stock detail 정상
- [ ] Playwright: VersionSwitcher 클릭 → 사이드바 content 변경 확인
- [ ] Playwright: Select dropdown sector 선택 → 해당 섹터 종목 목록 표시
- [ ] Playwright: Research Chat 패널 visible in finance mode / hidden in main mode
- [ ] 기존 모든 dashboard page (`/dashboard/overview`, `/dashboard/product`, etc.) 정상 동작

### Must Have
- Main/finance 모드 전환 시 사이드바 content 교체
- Finance 모드 좌측 네비: Select dropdown으로 Sectors / Watchlist 전환
- Market Overview 페이지: 주요 지수 + 뉴스 + 인기종목
- Research Chat UI shell (우측 패널)
- 모든 데이터 mock 기반 (기존 패턴 유지)
- TDD: 각 구현 전 테스트 먼저 작성

### Must NOT Have (Guardrails)
- Python backend (`cores/`, `trading/`, `prism-us/`) 절대 수정 금지
- `.env`, credential 파일 절대 수정 금지
- `src/components/ui/` 내 기존 shadcn 파일 직접 수정 금지 (npx shadcn add로 새 컴포넌트 설치)
- @tabler/icons-react 직접 import 금지 (Icons from @/components/icons)
- Zustand store 신규 추가 = app-mode store만 허용
- Portfolio page/route 미포함
- 실제 AI/API 연동 미포함
- 모바일 반응형 최적화 미포함 (desktop-first)
- 사용자 설정 저장(localStorage) 미포함
- 실시간 데이터(WebSocket/SSE) 미포함

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: YES (bun test)
- **Automated tests**: TDD
- **Framework**: bun test (string validation + Playwright E2E)
- **TDD**: 각 task 전 RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **UI rendering**: Playwright (browser) — navigate, interact, assert, screenshot
- **Type validation**: Bun test — type checks, mock data structure validation
- **Integration**: Playwright — full flow (mode switch → nav change → page render)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — types + mock + store):
├── Task 1: Domain types 확장 (Sector, MarketIndex, MarketMover 등)
├── Task 2: Mock data 확장 (지수, 섹터, 뉴스, watchlist, market movers)
├── Task 3: AppMode store (Zustand) + test
└── Task 4: TDD infrastructure 정비 + Playwright setup

Wave 2 (Core Components — sidebar + layout, MAX PARALLEL):
├── Task 5: VersionSwitcher 컴포넌트 (depends: 3)
├── Task 6: FinanceSidebar 컴포넌트 (depends: 1, 2, 3)
├── Task 7: ResearchChatPanel 컴포넌트 (depends: 3)
├── Task 8: AppSidebar 통합 — 조건부 렌더링 (depends: 5, 6)
└── Task 9: Finance sub-layout (depends: 7, 8)

Wave 3 (Pages + Integration):
├── Task 10: Market Overview 페이지 (depends: 1, 2, 9)
├── Task 11: FinanceView infobar Research Chat 적응 (depends: 7, 9)
├── Task 12: Navigation 통합 + breadcrumbs (depends: 10)
└── Task 13: Edge cases 처리 (empty state, missing symbol, collapsed) (depends: 10, 11, 12)

Wave FINAL (Verification):
├── Task F1: Plan Compliance Audit (oracle)
├── Task F2: Code Quality Review
├── Task F3: Real Manual QA (Playwright)
└── Task F4: Scope Fidelity Check
```

### Dependency Matrix
- Task 1 (Types) → 2, 6
- Task 2 (Mock data) → 6, 10
- Task 3 (Store) → 5, 6, 7, 8
- Task 4 (TDD infra) — parallel to all above
- Task 5 (VersionSwitcher) → 8
- Task 6 (FinanceSidebar) → 8
- Task 7 (ResearchChatPanel) → 9
- Task 8 (AppSidebar) → 9
- Task 9 (Finance layout) → 10, 11, 12
- Task 10 (Market Overview) → 12, 13
- Task 11 (FinanceView adapt) → 13
- Task 12 (Navigation) → 13

### Agent Dispatch Summary
- **Wave 1**: Tasks 1-4 → `quick` (types, mock, store, infra)
- **Wave 2**: Tasks 5-9 → `unspecified-high` (UI components, layout)
- **Wave 3**: Tasks 10-13 → `unspecified-high` (pages, integration, edge cases)
- **Final**: Tasks F1-F4 → `oracle` + `unspecified-high`

---

## TODOs

- [x] 1. Domain types 확장 (Sector, MarketIndex, MarketMover, WatchlistItem)

  **What to do**:
  - `alpha/src/features/finance/types.ts`에 다음 타입 추가:
    - `Sector`: `{ ticker, name, price, change, changePercent }` (Equity Sector 지수용, SIXB~SIXY)
    - `MarketIndex`: `{ name, value, change, changePercent, region }` (KOSPI, S&P 500 등)
    - `MarketMover`: `{ symbol, name, price, changePercent, market }` (Most Active / Gainers / Losers)
    - `NewsItem`: `{ title, source, url, timeAgo, summary? }`
    - `WatchlistItem`: `{ symbol, name, price, changePercent, market }`
  - 기존 `Quote`, `StockDetail`, `Period`, `ContentTab` 타입은 유지
  - TDD: 타입 정의 후 `bun test`로 컴파일 검증

  **Must NOT do**:
  - 기존 타입 필드 변경 금지 (backward compatibility)
  - `any` 타입 사용 금지

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []
  - Skills Evaluated but Omitted: N/A (단순 타입 정의)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 2, 6, 10
  - **Blocked By**: None

  **References**:
  - `alpha/src/features/finance/types.ts:1-60` — 기존 타입 정의 패턴 (Quote, StockDetail 등)
  - `alpha/src/types/index.ts:1-50` — NavGroup, NavItem 등 core 타입 정의 패턴

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과 (TypeScript strict)
  - [ ] 모든 새 타입이 기존 mock data와 호환

  **QA Scenarios**:
  ```
  Scenario: 새 타입 정의 검증
    Tool: Bash (bun)
    Preconditions: types.ts 파일 수정 완료
    Steps:
      1. bun run build 실행
      2. exit code 확인
    Expected Result: Build 성공 (exit code 0), 0 errors
    Evidence: .sisyphus/evidence/task-1-build-pass.txt

  Scenario: 기존 타입 호환성 검증
    Tool: Bash (bun)
    Preconditions: types.ts 수정 완료
    Steps:
      1. bun test 실행 (기존 finance-view.test.ts 포함)
      2. 모든 테스트 통과 확인
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-1-test-pass.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-1-build-pass.txt`
  - [ ] `.sisyphus/evidence/task-1-test-pass.txt`

  **Commit**: YES (groups with Task 2)
  - Message: `feat(finance): expand domain types for market overview`
  - Files: `alpha/src/features/finance/types.ts`

- [x] 2. Mock data 확장 (지수, 섹터, 뉴스, watchlist, market movers)

  **What to do**:
  - `alpha/src/features/finance/data/mock.ts`에 다음 mock 데이터 추가:
    - `MOCK_SECTORS: Sector[]` — 11개 Equity Sectors (SIXB~SIXY): ticker, name, price, change%
      - SIXB Materials, SIXC Communications, SIXE Energy, SIXI Industrials, SIXM Financials
      - SIXR Staples, SIXRE Real Estate, SIXT Technology, SIXU Utilities, SIXV Health Care, SIXY Discretionary
    - `MOCK_INDICES: MarketIndex[]` — 주요 지수 5개 (KOSPI, KOSDAQ, S&P 500, NASDAQ, Nikkei 225)
    - `MOCK_NEWS: NewsItem[]` — 시장 뉴스 5개 이상
    - `MOCK_MARKET_MOVERS: { mostActive: MarketMover[], gainers: MarketMover[], losers: MarketMover[] }`
    - `MOCK_WATCHLIST: WatchlistItem[]` — 관심 종목 3-5개 (000660, 005930, AAPL 등)
    - `getAllSectors()`, `getMarketIndices()`, `getMarketNews()`, `getMarketMovers()`, `getWatchlist()` export 함수
  - 기존 `getStockDetail()`, `mockQuoteData` 유지
  - TDD: mock data 함수 호출 결과 타입 및 구조 검증 테스트

  **Must NOT do**:
  - 기존 mock data 수정 금지 (SK하이닉스 single stock data 유지)
  - 실제 API 호출 금지

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []
  - Skills Evaluated but Omitted: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Tasks 6, 10
  - **Blocked By**: Task 1 (types)

  **References**:
  - `alpha/src/features/finance/data/mock.ts:1-200` — 기존 mock data 패턴 (getStockDetail 함수 구조)
  - `alpha/src/features/finance/types.ts` — Task 1에서 정의한 새 타입

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] 각 mock 함수 호출 시 올바른 구조의 데이터 반환
  - [ ] MOCK_SECTORS.length === 11
  - [ ] MOCK_INDICES.length >= 3
  - [ ] MOCK_NEWS.length >= 5
  - [ ] 각 market mover 카테고리별 >= 3 items

  **QA Scenarios**:
  ```
  Scenario: Mock 데이터 구조 검증
    Tool: Bash (bun)
    Preconditions: mock.ts 수정 완료
    Steps:
      1. `bun -e "import { getAllSectors } from './src/features/finance/data/mock'; console.log(JSON.stringify(getAllSectors().length))"` 실행
      2. 출력이 "11"인지 확인
    Expected Result: 11 sectors 반환
    Evidence: .sisyphus/evidence/task-2-sectors.txt

  Scenario: TypeScript build 검증
    Tool: Bash (bun)
    Preconditions: types.ts + mock.ts 수정 완료
    Steps:
      1. bun run build 실행
      2. 0 errors 확인
    Expected Result: Build success
    Evidence: .sisyphus/evidence/task-2-build.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-2-sectors.txt`
  - [ ] `.sisyphus/evidence/task-2-build.txt`

  **Commit**: YES (groups with Task 1)
  - Message: `feat(finance): expand domain types for market overview`
  - Files: `alpha/src/features/finance/data/mock.ts`

- [x] 3. AppMode store (Zustand) + test

  **What to do**:
  - `alpha/src/stores/app-mode.ts` 신규 생성:
    ```typescript
    type AppMode = 'main' | 'finance';
    
    interface AppModeState {
      mode: AppMode;
      setMode: (mode: AppMode) => void;
      toggleMode: () => void;
    }
    
    export const useAppMode = create<AppModeState>((set) => ({
      mode: 'main',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'main' ? 'finance' : 'main' }))
    }));
    ```
  - TDD: store 테스트 (초기값, setMode, toggleMode 검증)
  - `alpha/src/stores/` 디렉토리가 없으면 생성

  **Must NOT do**:
  - 기존 Zustand store 수정 금지
  - localStorage persistence 불필요 (세션 기반)

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Tasks 5, 6, 7, 8
  - **Blocked By**: None

  **References**:
  - `alpha/node_modules/zustand` — Zustand create API
  - 기존 Zustand 사용처: (grep으로 확인)

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] Store 초기값: `mode: 'main'`
  - [ ] `setMode('finance')` 호출 후 mode === 'finance'
  - [ ] `toggleMode()` 호출 시 'main' ↔ 'finance' 전환
  - [ ] TDD 테스트 통과

  **QA Scenarios**:
  ```
  Scenario: Store 동작 검증
    Tool: Bash (bun test)
    Preconditions: app-mode.ts + app-mode.test.ts 생성
    Steps:
      1. bun test 실행
      2. app-mode 테스트 통과 확인
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-3-store-test.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-3-store-test.txt`

  **Commit**: YES (standalone)
  - Message: `feat(store): add AppMode Zustand store for sidebar mode`
  - Files: `alpha/src/stores/app-mode.ts`

- [x] 4. TDD infrastructure 정비 + Playwright setup

  **What to do**:
  - `alpha/src/features/finance/__tests__/` 디렉토리 생성 (금융 기능 테스트 집중)
  - 기존 `finance-view.test.ts`를 새 위치로 리팩터하거나 참조 (기존 테스트는 유지)
  - 테스트 예제 작성: `types.test.ts` (타입 구조 검증), `mock-data.test.ts` (mock 함수 검증)
  - Playwright E2E 테스트 기본 설정: `alpha/e2e/` 디렉토리 생성 + 기본 smoke test (mode switch, page load)
  - 기존 테스트 실행 확인: `bun test` — 4개 테스트 모두 통과

  **Must NOT do**:
  - 기존 `bun test` 설정 변경 금지
  - Playwright config 이미 있으면 중복 생성 금지

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: None (infrastructure)
  - **Blocked By**: None

  **References**:
  - `alpha/src/features/finance/finance-view.test.ts:1-50` — 기존 test pattern (string validation)
  - `alpha/package.json:18` — test script: "bun test"

  **Acceptance Criteria**:
  - [ ] `bun test` — 기존 4개 테스트 + 신규 테스트 모두 통과
  - [ ] `alpha/e2e/` 디렉토리 존재 + 기본 smoke test 파일
  - [ ] Playwright 실행 가능 확인

  **QA Scenarios**:
  ```
  Scenario: Test infrastructure 검증
    Tool: Bash (bun)
    Preconditions: TDD setup 완료
    Steps:
      1. bun test 실행
      2. 모든 테스트 (기존 4개 + 신규) pass 확인
    Expected Result: "All tests passed" 메시지
    Evidence: .sisyphus/evidence/task-4-test-infra.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-4-test-infra.txt`

  **Commit**: YES (standalone)
  - Message: `chore(test): set up TDD infrastructure for finance mode`
  - Files: `alpha/src/features/finance/__tests__/*.test.ts`, `alpha/e2e/*.test.ts`

- [x] 5. VersionSwitcher 컴포넌트 (shadcn sidebar-02 pattern)

  **What to do**:
  - `alpha/src/components/layout/version-switcher.tsx` 신규 생성
  - shadcn sidebar-02 VersionSwitcher 패턴 적용:
    - `SidebarMenuButton` + `DropdownMenu` 조합
    - DropdownMenuTrigger: 현재 선택된 모드 표시 (main="Dashboard" / finance="Finance")
    - DropdownMenuContent: "Dashboard" / "Finance" 두 옵션
    - 각 옵션 선택 시 `useAppMode().setMode()` 호출
    - 아이콘: Dashboard는 `Icons.dashboard`, Finance는 `Icons.trendingUp`
  - TDD: VersionSwitcher 렌더링 + 클릭 시 모드 변경 검증

  **Must NOT do**:
  - shadcn `src/components/ui/` 내 파일 직접 수정 금지
  - 이미 설치된 DropdownMenu, SidebarMenuButton 등만 사용

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7)
  - **Blocks**: Task 8 (AppSidebar 통합)
  - **Blocked By**: Task 3 (store)

  **References**:
  - `alpha/src/components/ui/dropdown-menu.tsx` — shadcn DropdownMenu (이미 설치됨)
  - `alpha/src/components/ui/sidebar.tsx` — shadcn SidebarMenuButton (이미 설치됨)
  - sidebar-02 VersionSwitcher 패턴: DropdownMenu > DropdownMenuTrigger(SidebarMenuButton) > DropdownMenuContent > DropdownMenuItem
  - `alpha/src/components/icons.tsx` — Icons.dashboard, Icons.trendingUp 사용

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] VersionSwitcher 렌더링: 현재 모드 표시 (기본값 "Dashboard")
  - [ ] 드롭다운 열기: "Dashboard" / "Finance" 옵션 표시
  - [ ] "Finance" 선택 → useAppMode().mode === 'finance'
  - [ ] TDD 테스트 통과

  **QA Scenarios**:
  ```
  Scenario: VersionSwitcher 드롭다운 동작
    Tool: Bash (bun test)
    Preconditions: version-switcher.tsx + test 파일 생성
    Steps:
      1. bun test 실행 (VersionSwitcher 관련 테스트)
      2. 기본 모드 표시 검증
      3. Finance 선택 후 mode 변경 검증
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-5-vs-test.txt

  Scenario: Build 검증
    Tool: Bash (bun)
    Steps:
      1. bun run build 실행
    Expected Result: Build success, 0 errors
    Evidence: .sisyphus/evidence/task-5-build.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-5-vs-test.txt`
  - [ ] `.sisyphus/evidence/task-5-build.txt`

  **Commit**: YES (standalone)
  - Message: `feat(sidebar): add VersionSwitcher component`
  - Files: `alpha/src/components/layout/version-switcher.tsx`

- [x] 6. FinanceSidebar 컴포넌트 (좌측 네비 — Sectors / Watchlist Select 전환)

  **What to do**:
  - `alpha/src/components/layout/finance-sidebar.tsx` 신규 생성
  - `'use client'` 클라이언트 컴포넌트
  - 구조:
    ```
    SidebarHeader (VersionSwitcher 영역 — main/finance 전환)
    SidebarContent
      Select dropdown: "Equity Sectors" / "Watchlist" 전환
        - Equity Sectors 선택 시: 11개 섹터 리스트 표시 (ticker + name + price + change%)
        - Watchlist 선택 시: 관심 종목 리스트 표시 (symbol + name + price + change%)
        - 각 항목 클릭 시 해당 종목 [symbol] 페이지로 이동
      Empty state: Watchlist가 비었을 때 "No stocks in watchlist" placeholder
    SidebarFooter (UserAvatarProfile — app-sidebar와 동일)
    ```
  - Sector 항목 포맷: `SIXT Technology 3,656.35 -1.65%` (색상: positive=green, negative=red)
  - Watchlist 항목 포맷: `000660 SK Hynix ₩2,673,000 -8.36%`
  - TDD: 각 섹터/종목 렌더링 + Select 전환 검증

  **Must NOT do**:
  - Navigation (Link)는 shadcn SidebarMenuButton + asChild 패턴 사용
  - Icons는 @/components/icons에서만 import

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: ['frontend-ui-ux']

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7)
  - **Blocks**: Task 8 (AppSidebar 통합)
  - **Blocked By**: Tasks 1 (types), 2 (mock data), 3 (store)

  **References**:
  - `alpha/src/components/layout/app-sidebar.tsx:62-180` — 현재 sidebar의 SidebarContent 패턴
  - `alpha/src/features/finance/types.ts` — Sector, WatchlistItem 타입
  - `alpha/src/features/finance/data/mock.ts` — getAllSectors(), getWatchlist()
  - `alpha/src/components/ui/select.tsx` — shadcn Select 컴포넌트 (이미 설치 확인 필요, 없으면 npx shadcn add select)

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] Select dropdown으로 Equity Sectors / Watchlist 전환
  - [ ] Sectors 선택 시 11개 섹터 올바르게 표시
  - [ ] Watchlist 선택 시 관심 종목 올바르게 표시
  - [ ] 각 항목 클릭 시 올바른 URL로 이동
  - [ ] TDD 테스트 통과

  **QA Scenarios**:
  ```
  Scenario: FinanceSidebar 렌더링
    Tool: Bash (bun test)
    Preconditions: finance-sidebar.tsx + test 생성
    Steps:
      1. bun test 실행
      2. 사이드바 항목 렌더링 검증
      3. Select 전환 동작 검증
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-6-fs-test.txt

  Scenario: Sectors 목록 검증
    Tool: Bash (bun)
    Steps:
      1. bun -e "import { getAllSectors } from './src/features/finance/data/mock'; console.log(getAllSectors().map(s => s.ticker).join(','))" 실행
      2. 11개 ticker (SIXB~SIXY) 출력 확인
    Expected Result: SIXB,SIXC,SIXE,SIXI,SIXM,SIXR,SIXRE,SIXT,SIXU,SIXV,SIXY
    Evidence: .sisyphus/evidence/task-6-sectors-list.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-6-fs-test.txt`
  - [ ] `.sisyphus/evidence/task-6-sectors-list.txt`

  **Commit**: YES (standalone)
  - Message: `feat(sidebar): add FinanceSidebar with sectors/watchlist`
  - Files: `alpha/src/components/layout/finance-sidebar.tsx`

- [x] 7. ResearchChatPanel 컴포넌트 (우측 AI Chat UI shell)

  **What to do**:
  - `alpha/src/components/layout/research-chat-panel.tsx` 신규 생성
  - `'use client'` 클라이언트 컴포넌트
  - InfoSidebar 위치에 표시 (finance mode에서 InfoSidebar 대체)
  - 구조:
    ```
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Research</h3>
        <span className="text-xs text-muted-foreground">AI-powered insights</span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ask anything about the markets...
          </p>
          <!-- Suggested prompts -->
          <div class="flex flex-wrap gap-2">
            <button>What's moving the markets today?</button>
            <button>Compare S&P 500 to Nasdaq</button>
          </div>
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input placeholder="Ask AI..." />
          <Button size="icon"><Icons.arrowUp /></Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          AI content may include mistakes. Learn more
        </p>
      </div>
    </div>
    ```
  - 인풋 필드는 UI만 제공 (실제 AI 호출 없음)
  - Suggested prompts는 버튼 클릭 시 placeholder만 변경
  - TDD: 컴포넌트 렌더링 + 기본 UI 요소 존재 검증

  **Must NOT do**:
  - 실제 AI API 호출 금지
  - 채팅 히스토리 저장 금지

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: ['frontend-ui-ux']

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Tasks 9 (finance layout), 11 (FinanceView adapt)
  - **Blocked By**: Task 3 (store)

  **References**:
  - `alpha/src/components/layout/info-sidebar.tsx` — InfoSidebar 구조 (대체 대상)
  - `alpha/src/components/ui/input.tsx` — shadcn Input
  - `alpha/src/components/ui/button.tsx` — shadcn Button
  - `alpha/src/components/icons.tsx` — Icons.arrowUp 기존 확인

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] Research Chat panel 렌더링: 제목 "Research", 입력 필드, suggested prompts
  - [ ] Input 필드에 텍스트 입력 가능 (UI only)
  - [ ] TDD 테스트 통과

  **QA Scenarios**:
  ```
  Scenario: Research Chat panel 렌더링
    Tool: Bash (bun test)
    Preconditions: research-chat-panel.tsx + test 생성
    Steps:
      1. bun test 실행
      2. panel UI 요소 존재 검증
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-7-rc-test.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-7-rc-test.txt`
  - [ ] `.sisyphus/evidence/task-7-build.txt`

  **Commit**: YES (standalone)
  - Message: `feat(sidebar): add Research Chat panel UI`
  - Files: `alpha/src/components/layout/research-chat-panel.tsx`

- [x] 8. AppSidebar 통합 — VersionSwitcher + 조건부 렌더링

  **What to do**:
  - `alpha/src/components/layout/app-sidebar.tsx` 수정:
    - `useAppMode()` import + 사용
    - SidebarHeader: VersionSwitcher 추가 (OrgSwitcher 아래)
    - SidebarContent 조건부 렌더링:
      - `mode === 'main'`: 기존 `filteredGroups.map(...)` (현재 코드 유지)
      - `mode === 'finance'`: `<FinanceSidebar />` 렌더링
    - mode 변경 시 기존 사이드바 콜랩스 상태 유지
  - 기존 main mode 동작 100% 보존
  - TDD: mode 전환 시 사이드바 content 변경 검증

  **Must NOT do**:
  - 기존 navGroups, useFilteredNavGroups, OrgSwitcher 코드 수정 금지
  - SidebarFooter, SidebarRail 수정 금지

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: ['frontend-ui-ux']

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on 5, 6)
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 9
  - **Blocked By**: Tasks 5, 6

  **References**:
  - `alpha/src/components/layout/app-sidebar.tsx:38-182` — 현재 sidebar 전체 구조
  - `alpha/src/components/layout/version-switcher.tsx` — Task 5에서 생성
  - `alpha/src/components/layout/finance-sidebar.tsx` — Task 6에서 생성
  - `alpha/src/stores/app-mode.ts` — Task 3에서 생성

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] Main mode: OrgSwitcher + navGroups (기존과 동일)
  - [ ] VersionSwitcher에서 "Finance" 선택 → FinanceSidebar 표시
  - [ ] VersionSwitcher에서 "Dashboard" 선택 → 기존 main sidebar 복원
  - [ ] Sidebar collapse/expand 동작 유지
  - [ ] 기존 모든 dashboard page 접속 정상
  - [ ] TDD 테스트 통과

  **QA Scenarios**:
  ```
  Scenario: Mode 전환 동작
    Tool: Playwright
    Preconditions: dev server running, logged in
    Steps:
      1. /dashboard/overview 접속
      2. VersionSwitcher 클릭 → "Finance" 선택
      3. 사이드바 content 변경 확인 (FinanceSidebar 표시)
      4. VersionSwitcher 클릭 → "Dashboard" 선택
      5. 기존 admin nav 복원 확인
    Expected Result: Mode 전환 시 사이드바 content 교체
    Evidence: .sisyphus/evidence/task-8-mode-switch.mp4
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-8-mode-switch.mp4`

  **Commit**: YES (standalone)
  - Message: `feat(sidebar): integrate VersionSwitcher into AppSidebar`
  - Files: `alpha/src/components/layout/app-sidebar.tsx`

- [x] 9. Finance sub-layout (Research Chat + content 영역 조정)

  **What to do**:
  - `alpha/src/app/dashboard/finance/layout.tsx` 신규 생성 (finance route 전용 레이아웃):
    ```tsx
    export default function FinanceLayout({ children }: { children: React.ReactNode }) {
      return (
        <div className="flex flex-1">
          <main className="flex-1">{children}</main>
          {/* Research Chat panel — only in finance mode */}
          <ResearchChatPanel />
        </div>
      );
    }
    ```
  - **중요**: Research Chat panel은 finance mode에서만 표시. main mode에서는 InfoSidebar가 그대로 동작
  - `useAppMode()`로 mode 확인 → finance일 때만 panel 표시
  - 기존 dashboard/layout.tsx의 InfobarProvider + InfoSidebar는 유지 (main mode용)
  - InfoSidebar와 Research Chat panel의 공존 방지 (둘 중 하나만 active)
  - TDD: finance layout 렌더링 + Research Chat 표시 조건 검증

  **Must NOT do**:
  - dashboard/layout.tsx의 InfobarProvider/InfoSidebar 제거 금지
  - 기존 non-finance 페이지에 영향 가지 않도록

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: ['frontend-ui-ux']

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on 7, 8)
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 10, 11, 12
  - **Blocked By**: Tasks 7, 8

  **References**:
  - `alpha/src/app/dashboard/layout.tsx:21-40` — dashboard 레이아웃 원본 (InfobarProvider 패턴)
  - `alpha/src/components/layout/research-chat-panel.tsx` — Task 7

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] finance mode에서 Research Chat panel 표시
  - [ ] main mode에서 Research Chat panel hidden (InfoSidebar 정상)
  - [ ] TDD 테스트 통과

  **QA Scenarios**:
  ```
  Scenario: Finance layout 렌더링
    Tool: Playwright
    Preconditions: dev server running, finance mode active
    Steps:
      1. /dashboard/finance 접속
      2. 우측 Research Chat panel visible 확인
      3. main mode로 전환
      4. /dashboard/overview 접속
      5. Research Chat panel hidden, InfoSidebar 정상 확인
    Expected Result: Research Chat only in finance mode
    Evidence: .sisyphus/evidence/task-9-layout.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-9-layout.png`

  **Commit**: YES (standalone)
  - Message: `feat(finance): add finance sub-layout with Research Chat panel`
  - Files: `alpha/src/app/dashboard/finance/layout.tsx`

- [x] 10. Market Overview 페이지 (`/dashboard/finance/page.tsx`)

  **What to do**:
  - `alpha/src/app/dashboard/finance/page.tsx` 신규 생성 (Server Component)
  - `alpha/src/features/finance/components/market-overview.tsx` 신규 생성 (Client Component)
  - Market Overview 페이지 구조 (GF `/beta/` 스타일):
    - `PageContainer pageTitle="Finance" pageDescription="Market Overview"`
    - Markets 섹션: 주요 지수 그리드 (MarketIndex: name + value + change%)
    - Market Movers 섹션: Most Active / Top Gainers / Top Losers (3-column grid)
    - Market News 섹션: NewsItem 리스트 (title + source + timeAgo)
  - 데이터: Task 2의 mock 함수 사용
  - TDD: 페이지 컴포넌트 렌더링 + 각 섹션 존재 검증

  **Must NOT do**:
  - PageContainer props 직접 조작 금지
  - 실제 API 호출 금지

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: ['frontend-ui-ux']

  **Parallelization**:
  - **Blocks**: Tasks 12, 13
  - **Blocked By**: Tasks 1, 2, 9

  **References**:
  - `alpha/src/features/finance/finance-view.tsx` — PageContainer 사용 패턴
  - `alpha/src/app/dashboard/finance/[symbol]/page.tsx` — 기존 finance page
  - `alpha/src/features/finance/types.ts` — MarketIndex, MarketMover, NewsItem
  - `alpha/src/features/finance/data/mock.ts` — getMarketIndices(), getMarketMovers(), getMarketNews()

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] `/dashboard/finance` 접속 시 Market Overview 렌더링 (200 OK)
  - [ ] 지수 섹션: 3개 이상 index 표시
  - [ ] Market Movers: Most Active / Gainers / Losers 3개 섹션
  - [ ] News 섹션: 5개 이상 news item 표시

  **QA Scenarios**:
  ```
  Scenario: Market Overview 페이지 렌더링
    Tool: Playwright
    Preconditions: dev server running, finance mode active
    Steps:
      1. /dashboard/finance 접속
      2. Markets 섹션 존재 + 지수 최소 3개 표시 확인
      3. Most Active / Gainers / Losers 섹션 존재 확인
      4. Market News 섹션 존재 + 뉴스 5개 이상 확인
      5. 스크린샷 캡처
    Expected Result: 모든 섹션 정상 렌더링
    Evidence: .sisyphus/evidence/task-10-market-overview.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-10-market-overview.png`

  **Commit**: YES
  - Message: `feat(finance): add Market Overview landing page`
  - Files: `alpha/src/app/dashboard/finance/page.tsx`, `alpha/src/features/finance/components/market-overview.tsx`

- [x] 11. FinanceView infobar → Research Chat 적응

  **What to do**:
  - `alpha/src/features/finance/finance-view.tsx` 수정:
    - `useInfobar().setContent()` 호출을 finance mode에서 조건부 skip
    - `useAppMode()` import 추가
    - main mode: 기존처럼 InfoSidebar에 내용 표시 (변화 없음)
  - TDD: mode에 따른 infobar 동작 차이 검증

  **Must NOT do**:
  - FinanceView의 핵심 렌더링 로직 변경 금지

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: ['frontend-ui-ux']

  **Parallelization**:
  - **Blocks**: Task 13
  - **Blocked By**: Tasks 7, 9

  **References**:
  - `alpha/src/features/finance/finance-view.tsx` — FinanceView + useInfobar
  - `alpha/src/stores/app-mode.ts` — useAppMode

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] Main mode + stock detail: InfoSidebar 기존 content 표시
  - [ ] Finance mode + stock detail: InfoSidebar 미사용, Research Chat panel 표시

  **QA Scenarios**:
  ```
  Scenario: Infobar 적응 검증 (main mode)
    Tool: Playwright
    Preconditions: dev server, main mode
    Steps:
      1. /dashboard/finance/000660:KRX 접속
      2. InfoSidebar (우측)에 stock detail 관련 content 표시 확인
    Expected Result: 기존 동작 유지
    Evidence: .sisyphus/evidence/task-11-infobar-main.png

  Scenario: Research Chat 전환 검증 (finance mode)
    Tool: Playwright
    Preconditions: dev server, finance mode
    Steps:
      1. /dashboard/finance/000660:KRX 접속
      2. 우측 Research Chat panel 표시 확인 (InfoSidebar 아님)
    Expected Result: Research Chat panel 정상 표시
    Evidence: .sisyphus/evidence/task-11-research-chat.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-11-infobar-main.png`
  - [ ] `.sisyphus/evidence/task-11-research-chat.png`

  **Commit**: YES
  - Message: `fix(finance): adapt FinanceView infobar for finance mode`
  - Files: `alpha/src/features/finance/finance-view.tsx`

- [x] 12. Navigation 통합 + breadcrumbs

  **What to do**:
  - `alpha/src/config/nav-config.ts` 수정:
    - "Finance" 항목 → collapsible 그룹으로 확장
    - 하위 메뉴: "Market Overview" + watchlist symbol 목록
    - `isActive` 로직: `pathname.startsWith('/dashboard/finance')`로 설정
  - TDD: nav-config 변경 후 올바른 URL 생성 검증

  **Must NOT do**:
  - 다른 nav group 항목 수정 금지

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []

  **Parallelization**:
  - **Blocks**: Task 13
  - **Blocked By**: Task 10

  **References**:
  - `alpha/src/config/nav-config.ts` — 현재 Finance 항목
  - `alpha/src/types/index.ts` — NavGroup, NavItem 타입

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] Finance 항목이 collapsible 그룹으로 표시
  - [ ] 각 하위 메뉴 클릭 시 올바른 URL로 이동

  **QA Scenarios**:
  ```
  Scenario: Navigation 변경 검증
    Tool: Playwright
    Preconditions: dev server, main mode
    Steps:
      1. /dashboard 접속
      2. "Finance" 항목이 collapsible로 표시 확인
      3. "Market Overview" 클릭 → /dashboard/finance
      4. "SK Hynix" 클릭 → /dashboard/finance/000660:KRX
    Expected Result: Navigation 정상 동작
    Evidence: .sisyphus/evidence/task-12-nav.gif
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-12-nav.gif`

  **Commit**: YES
  - Message: `feat(nav): expand Finance nav group with sub-items`
  - Files: `alpha/src/config/nav-config.ts`

- [ ] 13. Edge cases 처리

  **What to do**:
  - Empty states: Watchlist empty → "No stocks in your watchlist"
  - Missing symbol → 404 or graceful fallback
  - Collapsed sidebar: VersionSwitcher 아이콘 표시, dropdown 동작 확인
  - Auto mode switch: `/dashboard/finance/*` 접속 시 자동 finance mode 활성화
  - TDD: 각 edge case 시나리오별 테스트

  **Must NOT do**:
  - 기존 error handling 패턴 변경 금지

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: ['frontend-ui-ux']

  **Parallelization**:
  - **Blocked By**: Tasks 10, 11, 12

  **References**:
  - `alpha/src/app/not-found.tsx` — 404 page

  **Acceptance Criteria**:
  - [ ] `bun run build` 통과
  - [ ] Empty watchlist: placeholder 메시지 표시
  - [ ] Invalid symbol: graceful fallback
  - [ ] `/dashboard/finance/*` 접속 시 자동 finance mode 활성화

  **QA Scenarios**:
  ```
  Scenario: Empty watchlist
    Tool: Playwright
    Steps:
      1. /dashboard/finance 접속, Watchlist 선택
      2. "No stocks in your watchlist" 메시지 확인
    Expected Result: Empty state 정상
    Evidence: .sisyphus/evidence/task-13-empty-watchlist.png

  Scenario: Invalid symbol → 404
    Tool: Playwright
    Steps:
      1. /dashboard/finance/INVALID 접속
      2. 404 page 표시 확인
    Expected Result: 404 처리
    Evidence: .sisyphus/evidence/task-13-invalid-symbol.png

  Scenario: Auto mode switch
    Tool: Playwright
    Steps:
      1. /dashboard/finance/000660:KRX 직접 접속
      2. 자동 finance mode 활성화 확인
    Expected Result: Auto mode switch
    Evidence: .sisyphus/evidence/task-13-auto-mode.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-13-empty-watchlist.png`
  - [ ] `.sisyphus/evidence/task-13-invalid-symbol.png`
  - [ ] `.sisyphus/evidence/task-13-auto-mode.png`

  **Commit**: YES
  - Message: `fix(finance): handle edge cases (empty, missing, collapsed, auto-mode)`
  - Files: (변경된 모든 파일)

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `bun run build` + `bun test`. Review all changed files for: any type assertions, lint issues, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Test [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-task integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything built, nothing beyond scope. Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy
- **Task 4**: `chore(test): set up TDD infrastructure for finance mode`
- **Task 5**: `feat(sidebar): add VersionSwitcher component`
- **Task 6**: `feat(sidebar): add FinanceSidebar with sectors/watchlist`
- **Task 8**: `feat(sidebar): integrate VersionSwitcher into AppSidebar`
- **Task 10**: `feat(finance): add Market Overview landing page`
- **Task 11**: `fix(finance): adapt FinanceView infobar for finance mode`
- **Task 13**: `fix(finance): handle edge cases (empty, missing, collapsed)`

---

## Success Criteria

### Verification Commands
```bash
bun run build    # Expected: Build successful, 0 errors
bun test         # Expected: All tests pass
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard/finance  # Expected: 200
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] 기존 dashboard page regression 없음
