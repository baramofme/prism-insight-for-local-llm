# GF Porting Priority 2 — Dual-Model Parallel Plan

## TL;DR

> **Quick Summary**: Priority 1에 이어 Google Finance 스타일 레이아웃 포팅의 2순위 영역(Header, Footer, Breadcrumb, Right Panel, Container max-width 1820)을 Qwen-3.6-1/Qwen-3.6-2 두 로컬 모델이 파일 충돌 없이 병렬 실행 가능하도록 분할하여 완료
>
> **Deliverables**:
> - GF 스타일 Header (SidebarTrigger 유지, 테마/알림 통합)
> - GF 스타일 Footer (AI 면책문구 + 링크, max-width 1820)
> - Finance 페이지 body breadcrumb (GF 스타일, 이중 배치)
> - Breadcrumb route mapping (finance route 추가)
> - Container max-width 1820 (FinanceView)
> - Right Panel (InfoSidebar 재활용 + GF research 콘텐츠 주입)
> - Bun test 기반 단위 테스트
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 2 waves (Wave 1: Group A + Group B 병렬)
> **Critical Path**: T4(layout.tsx 변경)는 Group B 내에서만 의존

---

## Context

### Original Request
Priority 1 완료 후, GF 포팅의 2순위 영역(header, footer, breadcrumb, right-panel, container max-width 1820) 작업 계획 수립. Qwen-3.6-1, Qwen-3.6-2 두 로컬 모델을 120k context 제한 내에서 병렬 실행할 수 있도록 최적화.

### Interview Summary
**Key Discussions**:
- **Header 전략 (A)**: GF 스타일 적용 + SidebarTrigger(모바일 네비)는 반드시 유지. 테마/알림은 header 내 GF 스타일로 통합
- **Right Panel (A)**: InfoSidebar 재활용. finance 라우트에서 `useInfobar().setContent()`로 GF Research 콘텐츠 주입. 별도 컴포넌트 생성 불필요
- **Breadcrumb (B)**: Header breadcrumbs 유지 + FinanceView body 상단에 GF 스타일 breadcrumb 이중 배치
- **Test (Bun test)**: 자동화 테스트 설정. Bun test (별도 패키지 불필요). 단, "새로운 npm 패키지 금지" 제약 준수

**Research Findings**:
- Header: `src/components/layout/header.tsx` — Clerk 통합, SidebarTrigger/Breadcrumbs/Search/Theme/Notifications 포함
- Footer: 현재 **존재하지 않음** (완전 신규)
- Breadcrumb: `src/hooks/use-breadcrumbs.tsx` + `src/components/breadcrumbs.tsx` — `usePathname()` 기반
- Right Panel: `InfoSidebar`(InfobarProvider)가 이미 우측 패널로 존재 — `useInfobar().setContent()`로 동적 콘텐츠 주입 가능
- FinanceView: `max-w-3xl (768px)` → max-w-[1820px]로 변경 필요
- InfoSidebar: slide-in 패널, `Ctrl+I` 토글 — GF research column과 상이하나 사용자 결정 A로 재활용

### Metis Review
**Identified Gaps** (addressed):
- **SidebarTrigger 소멸** → **RESOLVED**: Decision 1A로 SidebarTrigger 유지 확정
- **InfoSidebar vs Right Panel 충돌** → **RESOLVED**: Decision 2A로 InfoSidebar 재활용, layout.tsx 불필요
- **FinanceView 구조 변경 리스크** → **RESOLVED**: Decision 2A로 flex 레이아웃 변경 불필요 (InfoSidebar는 slide-in 패널로 toggling)
- **Breadcrumb 이중화** → **RESOLVED**: Decision 3B로 이중 배치 의도적 선택 확인

---

## Work Objectives

### Core Objective
Priority 1에 이어 GF 레이아웃 2순위 영역 5개를 포팅하여 KOSPI/KOSDAQ 종목 상세 페이지가 Google Finance 수준의 레이아웃 일관성을 갖추도록 함.

### Concrete Deliverables
- `src/components/layout/header.tsx` — GF 스타일 header (Group B)
- `src/components/layout/footer.tsx` — 신규 GF 스타일 footer (Group B)
- `src/app/dashboard/layout.tsx` — Footer import 추가 (Group B)
- `src/hooks/use-breadcrumbs.tsx` — Finance route 매핑 추가 (Group A)
- `src/features/finance/finance-view.tsx` — body breadcrumb + max-width 1820 + InfoSidebar content injection (Group A)
- 테스트 파일들: `*.test.ts` 각 대상 파일별 (각 Group)

### Definition of Done
- [ ] `bun run build` 통과 (type errors 0)
- [ ] Header: GF 스타일 렌더링 + SidebarTrigger 정상 작동
- [ ] Footer: AI 면책문구 + 링크, max-width 1820, 가운데 정렬
- [ ] FinanceView: max-w-[1820px] 적용, body breadcrumb 표시
- [ ] InfoSidebar: finance 라우트에서 GF research 콘텐츠 표시
- [ ] `bun test` 모든 테스트 통과

### Must Have
- Header 전체 대시보드에 GF 스타일 적용 (단, SidebarTrigger는 반드시 유지)
- Footer AI 면책문구 포함, max-width 1820 + 가운데 정렬
- Breadcrumb: header + finance body 이중 배치
- Container max-width 1820 적용
- 두 모델 간 파일 충돌 0건
- Bun test 통과

### Must NOT Have (Guardrails)
- **새로운 npm 패키지 금지** — 테스트 라이브러리 포함 추가 패키지 설치 불가 (bun test 내장만 사용)
- `src/components/ui/` 직접 수정 금지
- `colors.ts`의 UP_COLOR/DOWN_COLOR 변경 금지
- 실제 데이터 연동 금지 (mock data only)
- 1순위 영역 재수정 금지
- InfoSidebar(infobar-sidebar.tsx) 자체 수정 금지 — 콘텐츠만 주입
- sidebar hover overlay(760~1380bp) 수정 금지
- 레일폭 조정 금지

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (신규 설정)
- **Automated tests**: YES (TDD — test-first)
- **Framework**: Bun test (내장, 추가 패키지 불필요)
- **TDD workflow**: 각 task는 1) 작성 failing test → 2) 최소 구현 → 3) `bun test` 통과 확인 → 4) 리팩터

### Test Scope (No npm packages constraint)
- **Unit tests**: Pure logic/utility functions (route mapping, data formatting)
- **Hook tests**: use-breadcrumbs route resolution 로직
- **NO React Testing Library** (새 패키지 금지 제약)
- **NO component rendering tests** (동일 이유)

### QA Policy
모든 task는 Agent-Executed QA 시나리오 포함. UI/컴포넌트 검증은 Playwright로 대체.

- **Frontend/UI**: Playwright — Navigate, 스크린샷 캡처, DOM assert
- **Build**: `bun run build` — type error 0 확인
- **Test**: `bun test` — 모든 테스트 통과 확인
- **LSP**: `lsp_diagnostics` — error 0 확인

---

## Execution Strategy

### Dual-Model Parallel Split

```
┌─────────────────────────────────────────────────────────────┐
│                   Wave 1 (병렬 실행)                          │
│                                                             │
│  ┌─ Group A (Qwen-3.6-1) ─────────────────┐                 │
│  │  Files: use-breadcrumbs, finance-view,  │                 │
│  │         *.test.ts (A group)             │                 │
│  │  Tasks: T1, T2, T3                     │                 │
│  └─────────────────────────────────────────┘                 │
│                    ⇅ (NO file overlap)                       │
│  ┌─ Group B (Qwen-3.6-2) ─────────────────┐                 │
│  │  Files: header.tsx, footer.tsx,         │                 │
│  │         layout.tsx, *.test.ts (B group) │                 │
│  │  Tasks: T4, T5, T6                     │                 │
│  └─────────────────────────────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 파일 충돌 매트릭스

| 파일 | Group A | Group B | 충돌 |
|------|---------|---------|------|
| `src/hooks/use-breadcrumbs.tsx` | ✅ | ❌ | ✅ 없음 |
| `src/features/finance/finance-view.tsx` | ✅ | ❌ | ✅ 없음 |
| `src/components/layout/header.tsx` | ❌ | ✅ | ✅ 없음 |
| `src/components/layout/footer.tsx` | ❌ | ✅ | ✅ 없음 |
| `src/app/dashboard/layout.tsx` | ❌ | ✅ | ✅ 없음 |
| `package.json` (test script 추가) | ❌ | ✅ | ✅ Group B만 |

### Group별 Context 예상 사용량

| Group | 모델 | 예상 context | 주요 부하 |
|-------|------|-------------|-----------|
| A | Qwen-3.6-1 | ~50-60k (120k 여유) | finance-view 구조 이해 + breadcrumb 로직 |
| B | Qwen-3.6-2 | ~60-70k (120k 여유) | header 전면 교체 + footer 신규 + layout 수정 |

---

## TODOs

> **실행 순서**: T0 (선행) → T1+T3+T4+T5 4개 병렬 실행
> **Group A**: Qwen-3.6-1 실행 — T1, T2
> **Group B**: Qwen-3.6-2 실행 — T0, T3, T4
> 
> **TDD 방식**: 각 task에서 test 파일 먼저 작성(`bun test` FAIL 확인) → 구현 → `bun test` PASS 확인
> **참고**: "새로운 npm 패키지 금지" 제약으로 React Testing Library 미사용. 단위 테스트는 pure logic 위주.

- [x] T0. **Test Infrastructure Setup (Group B)**

  **What to do**:
  - `alpha/package.json`에 test script 추가:
    ```json
    "scripts": {
      "test": "bun test",
      "test:watch": "bun test --watch"
    }
    ```
  - `alpha/bunfig.toml` 생성 (bun test 기본 설정):
    ```toml
    [test]
    preload = "./src/test-setup.ts"
    ```
  - `alpha/src/test-setup.ts` 생성 (기본 test 환경 — 빈 파일, 추후 확장 가능)
  - 첫 `bun test` 실행 → 테스트 파일 없으므로 "No tests found" 정상 출력 확인

  **Must NOT do**:
  - 새 npm 패키지 설치 금지
  - 기존 빌드 설정 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 설정 파일 생성, 기존 패키지 이해 필요 없음
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 0 선행 작업)
  - **Parallel Group**: Wave 0 (단독 실행)
  - **Blocks**: T4, T5, T6 (Group B 전체)
  - **Blocked By**: None

  **References**:
  - `alpha/package.json:9-19` — 기존 scripts 구조 참조해 test script 추가 패턴 확인
  - Bun docs: `https://bun.sh/docs/cli/test` — bun test CLI 옵션

  **Acceptance Criteria**:
  - [ ] `package.json`에 `"test": "bun test"` 추가됨
  - [ ] `bun test` 실행 → "No tests found" 출력 (정상)

  **QA Scenarios**:
  ```
  Scenario: Test command works
    Tool: Bash
    Preconditions: T0 완료 상태
    Steps:
      1. cd alpha && bun test
    Expected Result: "No tests found" 출력 (테스트 파일 없으므로 정상)
    Evidence: .sisyphus/evidence/task-T0-bun-test-ready.txt
  ```

  **Evidence to Capture**:
  - [ ] bun test 실행 로그

  **Commit**: YES
  - Message: `chore: add bun test infrastructure`
  - Files: `alpha/package.json`, `alpha/bunfig.toml`, `alpha/src/test-setup.ts`

---

- [x] T1. **Breadcrumb Route Mapping — Finance 경로 추가 (Group A)**

  **What to do**:
  - `src/hooks/use-breadcrumbs.tsx`의 `routeMapping` 객체에 다음 항목 추가:
    ```typescript
    '/dashboard/finance': { label: 'Finance' },
    '/dashboard/finance/[symbol]': { label: 'Finance', subtitle: 'Stock Detail' },
    ```
  - 동적 symbol 값을 subtitle로 표시하려면, 기존 패턴 확인 후 필요시 `useBreadcrumbs` 훅 내에서 `useParams()` 또는 `useSelectedLayoutSegment()` 활용
  - 실제 구현: routeMapping에 finance 경로 등록 + 동적 세그먼트 감지 로직

  **TDD 순서**:
  1. `src/hooks/use-breadcrumbs.test.ts` 생성 — routeMapping에 finance 경로가 포함되었는지 검증하는 테스트
  2. `bun test` → FAIL (예상)
  3. `use-breadcrumbs.tsx`에 finance route 추가
  4. `bun test` → PASS

  **Must NOT do**:
  - 기존 routeMapping 항목 삭제 금지
  - use-breadcrumbs.tsx의 시그니처 변경 금지
  - 실제 데이터 연동 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 route mapping 추가 + 기존 패턴 복제. 복잡한 로직 불필요
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3, T4)
  - **Blocks**: None
  - **Blocked By**: T0 (test infra)

  **References**:
  - `src/hooks/use-breadcrumbs.tsx` — 현재 routeMapping 구조 전체 파악
  - `src/hooks/use-breadcrumbs.tsx:existing-route-pattern` — 기존 경로 등록 패턴 (예: `/dashboard/product` → `Products`)
  - `src/app/dashboard/finance/[symbol]/page.tsx` — finance route 구조 확인

  **WHY Each Reference Matters**:
  - `use-breadcrumbs.tsx`: 기존 routeMapping에 일관된 패턴으로 새 항목을 추가하기 위해 필수
  - Finance page: 어떤 경로 구조인지 확인하여 정확한 route key 설정

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file: `src/hooks/use-breadcrumbs.test.ts` — finance route resolution 검증
  - [ ] `bun test` → PASS

  **QA Scenarios**:
  ```
  Scenario: Finance breadcrumb route resolves correctly
    Tool: Bash (bun test)
    Preconditions: T1 구현 완료
    Steps:
      1. cd alpha && bun test src/hooks/use-breadcrumbs.test.ts
    Expected Result: PASS — finance route가 올바르게 label로 매핑됨
    Failure Indicators: Test failure — route 매핑 누락 또는 잘못된 label
    Evidence: .sisyphus/evidence/task-T1-breadcrumb-test.txt

  Scenario: TypeScript build passes
    Tool: Bash
    Preconditions: T1 구현 완료
    Steps:
      1. cd alpha && bun run build 2>&1 | tail -20
    Expected Result: Build 성공 (exit code 0), type error 0
    Evidence: .sisyphus/evidence/task-T1-build.txt
  ```

  **Evidence to Capture**:
  - [ ] bun test 결과 로그
  - [ ] build 결과 로그

  **Commit**: YES (groups with T2)
  - Message: `feat(finance): add breadcrumb route mapping for finance pages`
  - Files: `alpha/src/hooks/use-breadcrumbs.tsx`, `alpha/src/hooks/use-breadcrumbs.test.ts`

---

- [x] T2. **FinanceView: GF Body Breadcrumb + Max-Width 1820 + InfoSidebar Content (Group A)**

  **What to do**:
  1. **Body Breadcrumb**: `finance-view.tsx` 상단에 GF 스타일 breadcrumb 추가
     - 위치: `<header>` 와 `<StockHeader>` 사이, 또는 최상단
     - 스타일: `text-sm text-muted-foreground`, 경로 구분자 `/`
     - 내용: "Finance > {symbol}" (symbol은 prop 또는 params에서 추출)
     - 현재 header breadcrumbs와 이중 배치됨 (Decision 3B)
  2. **Container max-width 1820**: 
     - `<div className='mx-auto w-full max-w-3xl space-y-6'>` → `<div className='mx-auto w-full max-w-[1820px] space-y-6'>`
     - `max-w-3xl` → `max-w-[1820px]`로 변경
     - 가운데 정렬 유지
  3. **InfoSidebar Content Injection**:
     - `useEffect` + `useInfobar()` (from `@/components/layout/infobar`)를 사용하여 mount 시 GF research 콘텐츠 주입
     - 콘텐츠 구조:
       ```typescript
       setContent({
         title: 'Research',
         sections: [
           { title: 'Summary', content: 'AI 분석 요약 (mock data)' },
           { title: 'Key Metrics', content: 'P/E, EPS, Market Cap (mock data)' },
           { title: 'News Sentiment', content: '최근 뉴스 분석 (mock data)' }
         ]
       })
       ```
     - cleanup 시 `setContent(null)` 호출
     - `'use client'` 확인 (이미 client component일 가능성 높음)
     - finance 경로에만 적용되며, 다른 페이지에서 InfoSidebar 열면 기존 문서 콘텐츠 유지

  **TDD 순서**:
  1. `src/features/finance/finance-view.test.ts` 생성 — 컴포넌트 export 확인, 구조 검증 (렌더링은 Playwright)
  2. `bun test` → FAIL → 구현 → PASS

  **Must NOT do**:
  - InfoSidebar(`src/components/layout/info-sidebar.tsx`) 자체 수정 금지
  - 기존 T2-T5(1순위 컴포넌트: StockHeader, PriceCard, 등) 재수정 금지
  - 실제 데이터 연동 금지 (mock data only)
  - flex 레이아웃으로 변경 금지 (single-column 유지, InfoSidebar는 slide-in 패널)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 레이아웃 변경(max-width, breadcrumb 스타일), Tailwind CSS 클래스 조정
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3, T4)
  - **Blocks**: None
  - **Blocked By**: T0 (test infra)

  **References**:
  - `src/features/finance/finance-view.tsx` — 현재 구조, max-w-3xl 위치, StockHeader import 확인
  - `src/components/layout/info-sidebar.tsx` — 콘텐츠 구조(`{ title, sections }`), `useInfobar()` 훅 시그니처 확인
  - `src/hooks/use-breadcrumbs.tsx` — 현재 breadcrumbs 로직 (header용, 참조용)
  - `alpha/docs/GOOGLE_FINANCE_LAYOUT_SPEC.md` — max-width 1820, 레이아웃 스펙
  - `src/features/finance/finance-view.tsx:StockHeader` 위치 — body breadcrumb 삽입 위치 결정

  **WHY Each Reference Matters**:
  - `finance-view.tsx`: 실제 변경할 파일의 현재 구조 파악
  - `info-sidebar.tsx`: `useInfobar()` 훅의 정확한 import 경로와 API 확인
  - `GOOGLE_FINANCE_LAYOUT_SPEC.md`: max-width 1820이 정확한 사양인지 확인

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file: `src/features/finance/finance-view.test.ts` — 구조/export 검증
  - [ ] `bun test` → PASS

  **QA Scenarios**:
  ```
  Scenario: Build passes with all changes
    Tool: Bash
    Preconditions: T2 구현 완료 (T1도 완료 권장)
    Steps:
      1. cd alpha && bun run build 2>&1 | tail -20
    Expected Result: Build 성공, type error 0
    Evidence: .sisyphus/evidence/task-T2-build.txt

  Scenario: Finance page renders with breadcrumb and max-width (Playwright)
    Tool: Playwright (playwright skill)
    Preconditions: dev server 실행 중, T1+T2 구현 완료
    Steps:
      1. Navigate to http://localhost:3040/dashboard/finance/005930
      2. Screenshot full page
      3. Check body breadcrumb text contains "Finance"
      4. Check container width (~1820px via screenshot or class assertion)
    Expected Result: Page renders with body breadcrumb visible, wide container
    Failure Indicators: Breadcrumb missing, container still max-w-3xl (narrow)
    Evidence: .sisyphus/evidence/task-T2-finance-view.png

  Scenario: InfoSidebar shows GF research content on finance page
    Tool: Playwright (playwright skill)
    Preconditions: dev server, finance page open
    Steps:
      1. Navigate to http://localhost:3040/dashboard/finance/005930
      2. Press Ctrl+I or click InfoSidebar toggle
      3. Check sidebar content contains "Research" title and section titles
    Expected Result: InfoSidebar shows GF research data, not default documentation
    Evidence: .sisyphus/evidence/task-T2-infobar-content.png
  ```

  **Evidence to Capture**:
  - [ ] build 로그
  - [ ] Playwright 스크린샷 (full page)
  - [ ] Playwright 스크린샷 (InfoSidebar open)

  **Commit**: YES (groups with T1)
  - Message: `feat(finance): add gf-style breadcrumb, max-width 1820, and infobar content`
  - Files: `alpha/src/features/finance/finance-view.tsx`, `alpha/src/features/finance/finance-view.test.ts`

---

- [x] T3. **GF-Style Header with SidebarTrigger Preserved (Group B)**

  **What to do**:
  - `src/components/layout/header.tsx`를 GF 스타일로 리디자인 (현재 Clerk header를 대체)
  - **유지 필수 요소**:
    - `SidebarTrigger` (모바일 네비게이션 햄버거 버튼) — 좌측 상단 고정
    - `ThemeToggle` (테마 전환 버튼) — 우측에 GF 스타일로 통합
    - `NotificationsButton` (알림 센터) — 우측에 GF 스타일로 통합
    - `Breadcrumbs` (기존 헤더 breadcrumbs) — 유지 (Decision 3B)
  - **GF 스타일 추가 요소**:
    - **로고**: 왼쪽에 Google Finance 스타일 "PRISM" 로고 텍스트 (로고 옆에 작은 아이콘)
    - **검색창**: 중앙에 검색 input (GF 스타일, rounded-full, bg-muted, placeholder="Search stocks...")
    - **시장 네비게이션**: 검색창 아래 또는 옆에 "KR | US" 마켓 토글 (작은 칩 스타일)
    - **프로필**: 우측 끝에 아바타/프로필 (GF 스타일, 작은 원형)
  - **레이아웃 구조 (좌→우)**:
    ```
    [≡ SidebarTrigger] [로고] [Breadcrumbs] ... [검색창] ... [마켓토글] [🌙테마] [🔔알림] [👤프로필]
    ```
  - `SidebarTrigger`는 `<SidebarTrigger className="-ml-1" />` 형태로 유지, 모바일에서 정상 작동 확인

  **TDD 순서**:
  1. `src/components/layout/header.test.ts` 생성 — export 검증 (컴포넌트가 올바르게 export되는지)
  2. `bun test` → FAIL → 구현 → PASS
  3. Playwright로 시각 검증

  **Must NOT do**:
  - `SidebarTrigger` 삭제 금지 (필수 유지)
  - `@/components/ui/` 내 컴포넌트 직접 수정 금지
  - 실제 API 연동 금지 (mock/search는 placeholder로)
  - 새로운 npm 패키지 설치 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 리디자인, Tailwind CSS 레이아웃, 기존 컴포넌트 재배치
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T4)
  - **Blocks**: None
  - **Blocked By**: T0 (test infra)

  **References**:
  - `src/components/layout/header.tsx` — 현재 header 전체 코드 (SidebarTrigger, Breadcrumbs, Search, Theme, Notifications 위치)
  - `src/app/dashboard/layout.tsx` — header가 어떻게 렌더링되는지 (SidebarInset 내부)
  - `src/components/layout/app-sidebar.tsx` — SidebarTrigger 동작 방식 (mobile nav)
  - `src/components/breadcrumbs.tsx` — breadcrumbs 컴포넌트 (import 경로 확인)
  - `alpha/docs/GOOGLE_FINANCE_LAYOUT_SPEC.md` — GF header 스타일 참조 (로고, 검색, 네비)
  - `src/components/icons.tsx` — 사용 가능한 아이콘 확인 (search, user, globe 등)

  **WHY Each Reference Matters**:
  - `header.tsx`: 기존 모든 요소의 import와 배치를 파악해야 SidebarTrigger 누락 방지
  - `layout.tsx`: header가 어떤 컨테이너 내에 렌더링되는지 확인하여 레이아웃 깨짐 방지
  - `GOOGLE_FINANCE_LAYOUT_SPEC.md`: GF 스타일의 구체적인 시각 요소 참조

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file: `src/components/layout/header.test.ts` — export 검증
  - [ ] `bun test` → PASS

  **QA Scenarios**:
  ```
  Scenario: Build passes
    Tool: Bash
    Preconditions: T3 구현 완료
    Steps:
      1. cd alpha && bun run build 2>&1 | tail -20
    Expected Result: Build 성공 (exit code 0), type error 0
    Evidence: .sisyphus/evidence/task-T3-build.txt

  Scenario: Header renders with SidebarTrigger visible (mobile)
    Tool: Playwright (playwright skill)
    Preconditions: dev server 실행 중
    Steps:
      1. Set viewport to 375x812 (iPhone)
      2. Navigate to http://localhost:3040/dashboard/finance/005930
      3. Check SidebarTrigger (햄버거 버튼) exists and is visible
      4. Screenshot header area
    Expected Result: SidebarTrigger visible in mobile viewport
    Failure Indicators: SidebarTrigger missing or hidden
    Evidence: .sisyphus/evidence/task-T3-header-mobile.png

  Scenario: Header renders with GF elements (desktop)
    Tool: Playwright (playwright skill)
    Preconditions: dev server 실행 중
    Steps:
      1. Set viewport to 1440x900
      2. Navigate to http://localhost:3040/dashboard/finance/005930
      3. Screenshot full header
      4. Check 로고 text "PRISM" visible
      5. Check 검색창 (input) visible
      6. Check 테마 toggle visible
    Expected Result: GF-style header with all elements rendered
    Failure Indicators: Missing 로고, 검색창, 또는 레이아웃 깨짐
    Evidence: .sisyphus/evidence/task-T3-header-desktop.png

  Scenario: Header breadcrumbs still visible
    Tool: Playwright (playwright skill)
    Preconditions: dev server, desktop viewport
    Steps:
      1. Navigate to /dashboard/finance/005930
      2. Check breadcrumbs text in header area
    Expected Result: Header breadcrumbs 표시됨
    Evidence: .sisyphus/evidence/task-T3-header-breadcrumbs.png
  ```

  **Evidence to Capture**:
  - [ ] build 로그
  - [ ] Playwright 스크린샷 (mobile header)
  - [ ] Playwright 스크린샷 (desktop header)

  **Commit**: YES
  - Message: `feat(layout): redesign header with gf-style while preserving sidetrigger`
  - Files: `alpha/src/components/layout/header.tsx`, `alpha/src/components/layout/header.test.ts`

---

- [x] T4. **GF-Style Footer + Layout Integration (Group B)**

  **What to do**:
  1. **Footer 컴포넌트 생성** (`src/components/layout/footer.tsx` — 신규):
     - AI 면책문구 포함: "This analysis is for reference purposes only and does not constitute investment advice."
     - 관련 링크: "Terms · Privacy · Disclaimer" (링크는 `#` placeholder)
     - 스타일:
       - `max-w-[1820px] mx-auto` (max-width 1820 + 가운데 정렬)
       - `py-2 px-4` (padding 8px 상하, 16px 좌우)
       - `text-xs text-muted-foreground text-center`
       - 상단 얇은 border: `border-t border-border`
       - 배경: `bg-background` (기본 백그라운드)
     - 내용: copyright "© 2026 PRISM Insight. All rights reserved."
  2. **Layout에 Footer 추가** (`src/app/dashboard/layout.tsx`):
     - `SidebarInset` 내부, `{children}` 아래에 `<Footer />` 추가
     - `import { Footer } from '@/components/layout/footer';`

  **TDD 순서**:
  1. `src/components/layout/footer.test.ts` 생성 — export 확인, 텍스트 포함 검증 (간단한 string match)
  2. `bun test` → FAIL → 구현 → PASS

  **Must NOT do**:
  - 실제 링크 (외부 URL) 연결 금지 — `href="#"` placeholder 사용
  - 기존 layout.tsx의 SidebarProvider, SidebarInset 구조 변경 금지
  - Footer에 불필요한 기능 추가 금지 (순수 정보성 + 면책문구)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 정적 컴포넌트 생성 + layout.tsx에 import 추가
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3)
  - **Blocks**: None
  - **Blocked By**: T0 (test infra)

  **References**:
  - `src/app/dashboard/layout.tsx` — Footer를 추가할 위치 (SidebarInset 내 children 아래)
  - `src/components/layout/header.tsx` — 레이아웃 컴포넌트 컨벤션 참조 (import 패턴, export 방식)
  - `alpha/docs/GOOGLE_FINANCE_LAYOUT_SPEC.md` — footer 스펙 (max-width 1820, 면책문구)

  **WHY Each Reference Matters**:
  - `layout.tsx`: 정확한 위치에 Footer를 추가하기 위해 현재 JSX 구조 파악 필요
  - `header.tsx`: 동일 디렉토리 컴포넌트이므로 import/export 패턴 일관성 유지
  - `GOOGLE_FINANCE_LAYOUT_SPEC.md`: Footer의 max-width 1820과 면책문구가 정확한 spec인지 확인

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file: `src/components/layout/footer.test.ts` — export + text 검증
  - [ ] `bun test` → PASS

  **QA Scenarios**:
  ```
  Scenario: Footer renders on finance page
    Tool: Playwright (playwright skill)
    Preconditions: dev server 실행 중, T4 구현 완료
    Steps:
      1. Navigate to http://localhost:3040/dashboard/finance/005930
      2. Scroll to bottom of page
      3. Screenshot footer area
      4. Check 면책문구 text exists
      5. Check copyright text exists
      6. Check max-width container class 적용됨
    Expected Result: Footer with disclaimer, links, copyright, centered, max-width 1820
    Failure Indicators: Footer missing, disclaimer text missing, not centered
    Evidence: .sisyphus/evidence/task-T4-footer.png

  Scenario: Footer renders on non-finance page
    Tool: Playwright (playwright skill)
    Preconditions: dev server
    Steps:
      1. Navigate to http://localhost:3040/dashboard/overview
      2. Scroll to bottom
      3. Screenshot footer
    Expected Result: Footer visible on all dashboard pages
    Evidence: .sisyphus/evidence/task-T4-footer-overview.png

  Scenario: Build passes
    Tool: Bash
    Preconditions: T4 구현 완료
    Steps:
      1. cd alpha && bun run build 2>&1 | tail -20
    Expected Result: Build 성공 (exit code 0), type error 0
    Evidence: .sisyphus/evidence/task-T4-build.txt
  ```

  **Evidence to Capture**:
  - [ ] Playwright 스크린샷 (finance page footer)
  - [ ] Playwright 스크린샷 (overview page footer)
  - [ ] build 로그

  **Commit**: YES
  - Message: `feat(layout): add gf-style footer with disclaimer and integrate into layout`
  - Files: `alpha/src/components/layout/footer.tsx`, `alpha/src/components/layout/footer.test.ts`, `alpha/src/app/dashboard/layout.tsx`

---

## Final Verification Wave

> 4개 리뷰 에이전트가 병렬 실행. ALL APPROVED 후 사용자 승인 필요.

- [x] F1. **Plan Compliance Audit** — `oracle` ✅ APPROVED
  Read the plan end-to-end. Verify:
  - Header에 SidebarTrigger 유지 확인 (`header.tsx`에 SidebarTrigger import 존재)
  - Footer max-width 1820 + 면책문구 포함 확인
  - FinanceView max-w-[1820px] 적용 확인 (max-w-3xl 잔재 없는지)
  - InfoSidebar setContent() 호출 확인 (finance-view.tsx)
  - Breadcrumb 이중 배치 확인 (header + body)
  - 1순위 영역 재수정 없는지 확인 (StockHeader, PriceCard 등)
  - Must NOT: 새 npm 패키지 미설치 확인
  - Evidence 파일 존재 확인 (.sisyphus/evidence/)
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high` ✅ APPROVED
  Run `bun run build` + `bun test`. Review changed files for:
  - TypeScript strict violations
  - Unused imports, `any` type, `@ts-ignore`
  - console.log in production code
  - AI slop: 과도한 주석, over-abstraction
  - Import 경로 일관성 (`@/` alias 사용 확인)
  Output: `Build [PASS/FAIL] | Test [N pass/N fail] | VERDICT`

- [x] F3. **Real Manual QA** — 직접 Playwright QA 실행 ✅ APPROVED (12/12 scenarios PASS — Better Auth 로그인 후 finance page, header, footer, sidebar 전 항목 검증 완료)
  Start from clean state. Execute EVERY QA scenario from EVERY task:
  - T0: `bun test` 실행 확인
  - T1: breadcrumb route 테스트 통과 확인
  - T2: finance-view Playwright 검증 (breadcrumb, max-width, infobar)
  - T3: header 검증 (mobile sidebar trigger, desktop GF 요소)
  - T4: footer 검증 (면책문구, 링크, max-width)
  - 크로스 페이지 검증: finance 외 페이지에서 footer 정상 동작 확인
  - 엣지 케이스: symbols/ 없는 경로, 모바일 뷰포트
  Save evidence to `.sisyphus/evidence/final-qa/`
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — 직접 수행 ✅ APPROVED
  For each task: read "What to do", read actual diff (git diff). Verify 1:1:
  - T0: test script + bunfig.toml + test-setup.ts 생성
  - T1: use-breadcrumbs.tsx에 finance mapping 추가
  - T2: finance-view.tsx 변경 (breadcrumb + max-width + setContent)
  - T3: header.tsx GF 리디자인 (SidebarTrigger 유지 확인)
  - T4: footer.tsx 생성 + layout.tsx integration
  - Check: Group A 파일에 Group B 수정사항 없음 (zero cross-contamination)
  - Check: Must NOT (새 npm 패키지, 1순위 재수정) 위반 없음
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

| Task | Message | Files |
|------|---------|-------|
| T0 | `chore: add bun test infrastructure` | `package.json`, `bunfig.toml`, `src/test-setup.ts` |
| T1+T2 | `feat(finance): add gf-style breadcrumbs, container, and infobar content` | `use-breadcrumbs.tsx`, `finance-view.tsx`, `*.test.ts` |
| T3 | `feat(layout): redesign header with gf-style while preserving sidetrigger` | `header.tsx`, `header.test.ts` |
| T4 | `feat(layout): add gf-style footer with disclaimer and integrate into layout` | `footer.tsx`, `footer.test.ts`, `layout.tsx` |

---

## Success Criteria

### Verification Commands
```bash
# 1. Build check
cd alpha && bun run build
# Expected: Build successful, 0 errors

# 2. Test check
cd alpha && bun test
# Expected: All tests PASS

# 3. Lint check
cd alpha && bun run lint
# Expected: No warnings/errors
```

### Final Checklist
- [x] Header: GF 스타일 렌더링 + SidebarTrigger 정상 작동 (Playwright ✅)
- [x] Footer: 면책문구 + 링크, max-width 1820, 가운데 정렬 (Playwright ✅)
- [x] FinanceView: max-w-[1820px] 적용, body breadcrumb 표시 (Playwright ✅)
- [x] InfoSidebar: finance 라우트에서 GF research 콘텐츠 표시 (Playwright ✅)
- [x] Breadcrumb: header + finance body 이중 배치 확인
- [x] `bun run build` 통과 (0 errors)
- [x] `bun test` 통과 (34 pass, 0 failures)
- [x] Group A ↔ Group B 파일 충돌 0건
- [x] Must NOT: 새 npm 패키지 미설치 확인

