# ds-research-panel 반응형 너비 규칙 구현

## TL;DR

> **Quick Summary**: `ds-research-panel`(ResearchPanel)의 가시성과 너비를 사용자 정의 브레이크포인트(<1040px 숨김, ≥1040px 344px, ≥1225px 658px, ≥1380px 344px, ≥1445px 658px)에 따라 단계적으로 제어하도록 수정합니다.
> 
> **Deliverables**: 
> - `beta/src/lib/breakpoints.ts`: 새 브레이크포인트 상수 추가 (3개)
> - `beta/src/app/dashboard/page.tsx`: `calcPanelWidths()` rightW 계산 로직 + 렌더링 조건 변경
> - `beta/src/app/dashboard/components/main-content.tsx`: CSS 가시성 클래스 변경 (1개)
> 
> **Estimated Effort**: Short (~30-45분)
> **Parallel Execution**: NO — 순차적 의존성 있음
> **Critical Path**: T1(상수) → T2(calcPanelWidths) → T3(CSS+렌더링)

---

## Context

### Original Request
`ds-research-panel`의 반응형 최대 너비 규칙 구현:
- `<1040px`: 숨김
- `≥1040px`: max-width 344px
- `≥1225px`: max-width 658px
- `≥1380px`: max-width 344px (좌측 ds-sidebar-mobile 펼쳐짐)
- `≥1445px`: max-width 658px

### Interview Summary
**연구 Findings **(Metis 분석 포함)
- ResearchPanel width는 `collapsedWidth` prop으로 전달되며, `calcPanelWidths()`에서 반환하는 `rightW` 값에서 유래
- 현재 rightW 동작: `<936px` → 0, `936~1370px` → 선형 보간(283→597), `≥1371px` → 고정 597
- 가시성은 TWO-layer로 제어: JS(`{rightW > 0 && ...}`) + CSS(`hidden min-[936px]:flex`)
- `BREAKPOINTS.TABLET`(936) 변경 금지 — 전체 레이아웃에 파급 영향
- 임베디드 모드(MobilePortfolioDetail 내 ResearchPanel)는 수정 대상 아님
- `centerW` 계산이 rightW와 간접적으로 연동되어 있음 — center content overflow 주의 필요

---

## Work Objectives

### Core Objective
ResearchPanel의 너비와 가시성을 사용자 정의 브레이크포인트에 따라 단계적(step function)으로 제어하도록 변경합니다.

### Concrete Deliverables
- `beta/src/lib/breakpoints.ts`: RIGHT_PANEL_MIN(1040), RIGHT_PANEL_WIDE_A(1225), RIGHT_PANEL_WIDE_B(1445) 상수 추가
- `beta/src/app/dashboard/page.tsx`: calcPanelWidths()에서 rightW를 새 브레이크포인트 기반 step function으로 반환, 렌더링 조건 수정
- `beta/src/app/dashboard/components/main-content.tsx`: CSS 가시성 클래스 `min-[936px]` → `min-[1040px]` 변경

### Definition of Done
- [ ] 각 브레이크포인트에서 panel width가 정확히 요구사항과 일치 (Playwright evaluate + getBoundingClientRect 검증)
- [ ] <1040px에서 패널 DOM에 mount되지 않음
- [ ] center content(#ds-center) horizontal overflow 없음
- [ ] sidebar toggle(normal↔hover↔expanded) 동작 regression-free
- [ ] TypeScript 컴파일 오류 없음 (`tsc --noEmit`)

### Must Have
- 모든 모드(expanded/normal/hover/minimized)에서 일관된 rightW 적용
- 기존 BREAKPOINTS.TABLET(936) 값 유지 — 절대 변경 금지
- 임베디드 모드 건드리지 않음

### Must NOT Have (Guardrails)
- BREAKPOINTS.TABLET, TABLET, RIGHT_PANEL 등 기존 상수 값 변경 금지
- NavigationPanel/sidebar visibility 로직 변경 금지
- 임베디드 모드(MobilePortfolioDetail 내 ResearchPanel) 수정 금지
- centerW 계산 로직의 근본적 재설계 금지 — rightW만 독립적으로 override
- AI slop: 불필요한 추상화, 과도한 주석, 새로운 유틸리티 함수 생성 금지

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (pytest, Playwright available per AGENTS.md)
- **Automated tests**: None — frontend-only change, Playwright QA scenarios로 검증
- **Framework**: Playwright (viewport resize + evaluate)

### QA Policy
모든 작업은 Agent-Executed QA Scenarios 포함. Evidence saved to `.sisyphus/evidence/`.

- **Frontend/UI**: Playwright viewport resize + getBoundingClientRect() + screenshot
- **Build**: `tsc --noEmit` in beta directory

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (start):
├── Task 1: BREAKPOINTS 상수 추가 [quick]
├── Task 2: calcPanelWidths() rightW step function [unspecified-high]
└── Task 3: CSS 가시성 클래스 + 렌더링 조건 변경 [quick]

Critical Path: T1 → T2 → T3 (순차적 의존성)
```

### Dependency Matrix

| Task | Blocks | Blocked By |
|------|--------|------------|
| T1: 상수 추가 | T2, T3 | - |
| T2: calcPanelWidths | T3 | T1 |
| T3: CSS+렌더링 | - | T1, T2 |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks — T1 → `quick`, T2 → `unspecified-high`, T3 → `quick`

---

## TODOs

- [x] 1. BREAKPOINTS 상수 추가 (RIGHT_PANEL_MIN, RIGHT_PANEL_WIDE_A, RIGHT_PANEL_WIDE_B)

  **What to do**:
  - `beta/src/lib/breakpoints.ts`에 다음 상수 추가:
    - `RIGHT_PANEL_MIN: 1040` — 패널 표시 최소 브레이크포인트
    - `RIGHT_PANEL_WIDE_A: 1225` — 패널 넓어짐 (658px)
    - `RIGHT_PANEL_WIDE_B: 1445` — sidebar 후 다시 넓어짐 (658px)
  - 기존 상수(TABLET=936, WIDE=1371, DESKTOP_SIDEBAR=1380 등)는 절대 변경하지 않음
  - export된 BREAKPOINTS 객체에 추가 또는 별도 상수로 export

  **Must NOT do**:
  - 기존 상수 값 변경 금지
  - 불필요한 주석이나 설명 추가 금지 (상수명은 자체 문서화)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단일 파일의 단순 상수 추가 작업
  - **Skills**: []
    - No special skills needed for constant addition

  **Parallelization**:
  - **Can Run In Parallel**: YES (no dependencies)
  - **Parallel Group**: Wave 1 — first task
  - **Blocks**: T2(calcPanelWidths), T3(CSS+렌더링)
  - **Blocked By**: None

  **References** (CRITICAL):
  **Pattern References**:
  - `beta/src/lib/breakpoints.ts` — 현재 상수 정의 위치. 동일한 패턴으로 새 상수 추가
  
  **WHY Each Reference Matters**:
  - breakpoints.ts에서 BREAKPOINTS 객체의 구조를 파악하여 동일한 형식으로 추가해야 함
  - DESKTOP_SIDEBAR(1380)이 이미 존재하므로 중복 확인 필요

  **Acceptance Criteria**:
  - [ ] `beta/src/lib/breakpoints.ts`에 RIGHT_PANEL_MIN=1040, RIGHT_PANEL_WIDE_A=1225, RIGHT_PANEL_WIDE_B=1445 추가됨
  - [ ] 기존 모든 상수 값 변경 없음 (git diff로 검증)
  - [ ] TypeScript 컴파일 오류 없음: `cd beta && npx tsc --noEmit`

  **QA Scenarios **(MANDATORY)
  ```
  Scenario: 상수 추가 후 타입스크립트 빌드 정상 동작
    Tool: Bash (tsc)
    Preconditions: 상수가 breakpoints.ts에 추가된 상태
    Steps:
      1. cd beta && npx tsc --noEmit
      2. Exit code === 0 확인
    Expected Result: 컴파일 성공, 오류 0개
    Failure Indicators: exit code !== 0, type error 출력
    Evidence: .sisyphus/evidence/task-1-tsc-build.txt

  Scenario: 기존 상수 값 변경 여부 검증
    Tool: Bash (git diff)
    Preconditions: 상수 추가 commit 전
    Steps:
      1. git diff beta/src/lib/breakpoints.ts
      2. TABLET(936), WIDE(1371), DESKTOP_SIDEBAR(1380) 값이 변경되지 않았는지 확인
    Expected Result: diff에서 기존 상수 줄 삭제/변경 없음 — 오직 새로운 상수 라인만 추가됨
    Evidence: .sisyphus/evidence/task-1-git-diff.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-1-tsc-build.txt` — tsc --noEmit 결과
  - [ ] `.sisyphus/evidence/task-1-git-diff.txt` — git diff 결과

  **Commit**: NO (T2, T3와 그룹화)

- [x] 2. calcPanelWidths() rightW 계산 로직 수정 — step function 적용

  **What to do**:
  - `beta/src/app/dashboard/page.tsx`의 `calcPanelWidths()` 함수를 수정하여 rightW 반환값을 새 브레이크포인트에 따른 단계적(step) 함수로 변경:
  
  **목표 rightW 매핑**:
  | Viewport | rightW | 비고 |
  |----------|--------|------|
  | <1040px | 0 | 패널 숨김 |
  | ≥1040px | 344 | 기본 너비 |
  | ≥1225px | 658 | 넓어짐 |
  | ≥1380px | 344 | sidebar 펼쳐짐 → 좁아짐 |
  | ≥1445px | 658 | 다시 넓어짐 |
  
  **구체적 구현 지침**:
  1. `BREAKPOINTS.RIGHT_PANEL_MIN`(1040), `RIGHT_PANEL_WIDE_A`(1225), `RIGHT_PANEL_WIDE_B`(1445), `DESKTOP_SIDEBAR`(1380) import
  2. 4개 모드(expanded, normal, hover, minimized) 모두 동일한 step function 적용
  3. 기존 선형 보간(interpolation) 로직 제거 — step function으로 대체
  4. centerW 계산은 기존 interpolation 유지 (rightW와 독립적으로 동작하도록)
  5. wrapperMargin 계산도 기존 로직 유지
  
  **중요: 4개 모드의 처리**
  - 현재 expanded 모드(line ~170-196): rightW가 vp>=TABLET일 때 linear interpolation 사용 → step function으로 변경
  - normal mode(line ~200-223): 동일하게 step function으로 변경
  - hover mode(line ~227-249): 동일하게 step function으로 변경
  - minimized/collapsed mode(line ~253-277): 동일하게 step function으로 변경

  **Must NOT do**:
  - BREAKPOINTS.TABLET(936) 값 변경 금지
  - centerW 계산의 근본적 재설계 금지 — interpolation progress는 그대로 유지하되 rightW만 override
  - 임베디드 모드 관련 코드 수정 금지
  - 새로운 유틸리티 함수나 헬퍼 생성 금지 — inline if/else로 구현

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: calcPanelWidths()는 4개 모드에 걸쳐 복잡한 분기 로직을 포함. 각 모드에서 일관되게 적용해야 하며, 기존 centerW/leftW/wrapperMargin 계산과의 충돌을 피해야 함
  - **Skills**: []
    - Frontend-only 변경, 특별한 도메인 지식 불필요

  **Parallelization**:
  - **Can Run In Parallel**: NO (T1 완료 필요)
  - **Parallel Group**: Wave 1 — sequential after T1
  - **Blocks**: T3(CSS+렌더링 조건은 T2의 rightW와 연동되어야 함)
  - **Blocked By**: T1(BREAKPOINTS 상수 추가)

  **References** (CRITICAL):
  **Pattern References**:
  - `beta/src/app/dashboard/page.tsx:calcPanelWidths()` (line ~160-280) — 현재 rightW 계산 로직 위치. 4개 모드의 분기 구조 파악 필수
  
  **API/Type References**:
  - `beta/src/lib/breakpoints.ts:BREAKPOINTS` — 새로 추가된 RIGHT_PANEL_* 상수 참조용
  
  **WHY Each Reference Matters**:
  - calcPanelWidths()는 4개의 분기(expanded/normal/hover/minimized)가 있으며 각각 동일한 패턴으로 rightW를 반환함 — 모든 분기를 일관되게 수정해야 함
  - 기존 interpolation 로직 (`progress = (vp - TABLET) / (WIDE - TABLET)`)이 centerW 계산에도 사용됨 — rightW만 step function으로 변경하고 centerW는 기존 interpolation 유지 필요

  **Acceptance Criteria**:
  - [ ] `cd beta && npx tsc --noEmit` → PASS, 오류 0
  - [ ] calcPanelWidths()에서 vp=1039 → rightW=0 반환
  - [ ] calcPanelWidths()에서 vp=1040 → rightW=344 반환
  - [ ] calcPanelWidths()에서 vp=1225 → rightW=658 반환
  - [ ] calcPanelWidths()에서 vp=1380 → rightW=344 반환
  - [ ] calcPanelWidths()에서 vp=1445 → rightW=658 반환
  - [ ] 4개 모드 모두 동일한 rightW 값 반환 (모드 간 불일치 없음)
  - [ ] 기존 상수(TABLET, WIDE 등) 값 변경 없음

  **QA Scenarios **(MANDATORY)
  ```
  Scenario: 각 브레이크포인트에서 rightW 정확히 반환 (happy path)
    Tool: Bash (node REPL 또는 bun repl)
    Preconditions: calcPanelWidths() 함수가 수정된 상태
    Steps:
      1. cd beta && node -e "const {default: page} = require('./src/app/dashboard/page'); /* or use tsx/ts-node */" 
         → 실제로는 unit test 파일 생성 후 실행 권장:
         npx tsx -e "import { calcPanelWidths } from './src/app/dashboard/page'; console.log(calcPanelWidths(1039).rightW); console.log(calcPanelWidths(1040).rightW); console.log(calcPanelWidths(1225).rightW); console.log(calcPanelWidths(1380).rightW); console.log(calcPanelWidths(1445).rightW);"
      2. 출력값이 각각 0, 344, 658, 344, 658인지 확인
    Expected Result: 0\n344\n658\n344\n658 순서대로 출력
    Failure Indicators: 다른 값 출력, import 오류, 런타임 에러
    Evidence: .sisyphus/evidence/task-2-rightw-values.txt

  Scenario: 4개 모드 간 rightW 일관성 검증 (edge case)
    Tool: Bash (tsx REPL)
    Preconditions: calcPanelWidths()가 sidebarMode 인자를 받는 경우
    Steps:
      1. 각 모드(default, wide-screen, hover, minimized)에서 vp=1225로 호출
      2. 모든 모드의 rightW === 658 인지 확인
    Expected Result: 4개 모드 모두 rightW=658 반환
    Evidence: .sisyphus/evidence/task-2-mode-consistency.txt

  Scenario: centerW 계산 regression-free (error scenario)
    Tool: Bash (tsx REPL)
    Preconditions: 수정 후 calcPanelWidths 실행
    Steps:
      1. vp=1200, 1400, 1600에서 centerW 값 확인
      2. NaN, Infinity, 음수, 또는 비정상적으로 큰 값(>2000)이 아닌지 확인
    Expected Result: 모든 viewport에서 centerW는 합리적인 양수 범위(100~1000) 내에 있음
    Evidence: .sisyphus/evidence/task-2-centerw-check.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-2-rightw-values.txt` — 브레이크포인트별 rightW 출력값
  - [ ] `.sisyphus/evidence/task-2-mode-consistency.txt` — 모드 간 일관성 검증 결과
  - [ ] `.sisyphus/evidence/task-2-centerw-check.txt` — centerW regression检查结果

  **Commit**: NO (T3와 그룹화)

- [x] 3. CSS 가시성 클래스 변경 + JS 렌더링 조건 수정

  **What to do**:
  
  **A. CSS 가시성 클래스 변경 **(main-content.tsx)
  - `beta/src/app/dashboard/components/main-content.tsx`, line ~3064:
    - 기존: `hidden min-[936px]:flex flex-shrink-0 self-stretch h-full`
    - 변경: `hidden min-[1040px]:flex flex-shrink-0 self-stretch h-full`
  - ResearchPanel component 내 `<aside>` 태그의 className에서 Tailwind arbitrary breakpoint만 변경
  
  **B. JS 렌더링 조건 변경 **(page.tsx)
  - `beta/src/app/dashboard/page.tsx`, line ~573:
    - 기존: `{rightW > 0 && researchPanelVisible && <div id="ds-research-panel">...}` 
    - 변경: `{vp >= BREAKPOINTS.RIGHT_PANEL_MIN && researchPanelVisible && <div id="ds-research-panel">...}`
  - rightW > 0 체크를 명시적 브레이크포인트 체크로 변경 — calcPanelWidths가 rightW=0을 반환하더라도 vp 기반 체크가 우선
  
  **C. 임베디드 모드 영향 확인**:
  - MobilePortfolioDetail 내 research tab 표시 조건(`rightW <= 0`)은 그대로 유지
  - 임베디드 모드의 ResearchPanel JSX는 수정 대상 아님

  **Must NOT do**:
  - 임베디드 모드 관련 코드 수정 금지
  - CSS transition, animation 클래스 추가 금지 (기존 duration-300 유지)
  - 다른 컴포넌트의 가시성 클래스 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단일 className 문자열 교체 + 단일 조건문 변경 — 명확한 패턴 매칭 작업
  - **Skills**: []
    - No special skills needed for string replacement

  **Parallelization**:
  - **Can Run In Parallel**: NO (T1, T2 완료 필요)
  - **Parallel Group**: Wave 1 — final sequential task
  - **Blocks**: None (마지막 구현 작업)
  - **Blocked By**: T1(상수), T2(calcPanelWidths)

  **References** (CRITICAL):
  **Pattern References**:
  - `beta/src/app/dashboard/components/main-content.tsx:3064` — CSS 가시성 클래스 위치. Tailwind arbitrary breakpoint(`min-[936px]`) → (`min-[1040px]`)로 변경
  
  **API/Type References**:
  - `beta/src/app/dashboard/page.tsx:573` — JS 렌더링 조건 위치. `rightW > 0` → `vp >= BREAKPOINTS.RIGHT_PANEL_MIN`으로 변경
  
  **WHY Each Reference Matters**:
  - main-content.tsx line 3064의 `hidden min-[936px]:flex`는 패널 가시성의 CSS layer — 이 값을 1040으로 변경하면 CSS가 새로운 브레이크포인트에서 flex를 적용함
  - page.tsx line 573의 `rightW > 0`은 JS rendering condition — calcPanelWidths()가 rightW=0을 반환하더라도 vp 기반 체크로 대체해야 일관된 동작 보장
  - 두 곳을 동시에 변경하지 않으면 CSS와 JS 간 불일치로 인한 버그 발생 (CSS는 표시하지만 JS는 mount 안 함, 또는 그 반대)

  **Acceptance Criteria**:
  - [ ] main-content.tsx에서 `min-[936px]` → `min-[1040px]`로 정확히 1개만 변경됨 (grep 검증)
  - [ ] page.tsx에서 `rightW > 0` → `vp >= BREAKPOINTS.RIGHT_PANEL_MIN`으로 변경됨 (ResearchPanel 관련 라인에서만)
  - [ ] 임베디드 모드 관련 코드 변경 없음 (git diff로 MobilePortfolioDetail 관련 라인 확인)
  - [ ] `cd beta && npx tsc --noEmit` → PASS

  **QA Scenarios **(MANDATORY)
  ```
  Scenario: CSS 가시성 클래스 정확히 변경됨 (happy path)
    Tool: Bash (grep)
    Preconditions: 수정 완료 상태
    Steps:
      1. grep -n 'min-\[1040\]' beta/src/app/dashboard/components/main-content.tsx
      2. ResearchPanel aside 태그에서 min-[1040px]:flex 존재 확인
      3. grep -c 'min-\[936px\]' beta/src/app/dashboard/components/main-content.tsx → 0 확인
    Expected Result: min-[1040px]:flex가 정확히 1회 등장, min-[936px]는 ResearchPanel 관련 라인에서 0회
    Evidence: .sisyphus/evidence/task-3-css-class.txt

  Scenario: JS 렌더링 조건 변경 — 임베디드 모드 미변경 (error scenario)
    Tool: Bash (git diff + grep)
    Preconditions: 수정 완료 후 commit 전
    Steps:
      1. git diff beta/src/app/dashboard/page.tsx | grep -A2 -B2 'RIGHT_PANEL_MIN'
      2. 변경이 ds-research-panel 관련 라인(line ~573)에만 있는지 확인
      3. MobilePortfolioDetail 관련 코드 변경 없음 확인
    Expected Result: RIGHT_PANEL_MIN이 ds-research-panel mount 조건에서만 등장, 임베디드 모드 관련 코드 무변경
    Evidence: .sisyphus/evidence/task-3-render-condition.txt

  Scenario: TypeScript 빌드 전체 통과 (integration check)
    Tool: Bash (tsc)
    Preconditions: 모든 파일 수정 완료
    Steps:
      1. cd beta && npx tsc --noEmit
    Expected Result: exit code 0, 오류 0개
    Failure Indicators: BREAKPOINTS.RIGHT_PANEL_MIN undefined error, type mismatch
    Evidence: .sisyphus/evidence/task-3-tsc-final.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-3-css-class.txt` — CSS 클래스 변경 검증 결과
  - [ ] `.sisyphus/evidence/task-3-render-condition.txt` — 렌더링 조건 + 임베디드 모드 미변경 검증
  - [ ] `.sisyphus/evidence/task-3-tsc-final.txt` — 최종 TypeScript 빌드 결과

  **Commit**: YES (T1~T3 그룹화)
  - Message: `fix(dashboard): add responsive width breakpoints for research panel`
  - Files: `beta/src/lib/breakpoints.ts`, `beta/src/app/dashboard/page.tsx`, `beta/src/app/dashboard/components/main-content.tsx`
  - Pre-commit: `cd beta && npx tsc --noEmit`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, grep). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high` (APPROVE)
  Run `tsc --noEmit` in beta directory. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `visual-engineering` (APPROVE)
  Start from clean state. Execute viewport resize tests at EACH breakpoint (1039, 1040, 1225, 1380, 1445). Verify panel visibility and width via getBoundingClientRect(). Save screenshots to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Breakpoints [N/N verified] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep` (APPROVE after clean re-commit)
  For each task: read "What to do", read actual diff. Verify 1:1 compliance. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes. Specifically verify: BREAKPOINTS.TABLET unchanged, embedded mode untouched, NavigationPanel/sidebar logic unchanged.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Group**: T1 + T2 + T3 → 단일 커밋
  - Message: `fix(dashboard): add responsive width breakpoints for research panel`
  - Files changed:
    - `beta/src/lib/breakpoints.ts` — 상수 추가
    - `beta/src/app/dashboard/page.tsx` — rightW 계산 + 렌더링 조건
    - `beta/src/app/dashboard/components/main-content.tsx` — CSS 가시성 클래스
  - Pre-commit validation: `cd beta && npx tsc --noEmit`

---

## Success Criteria

### Verification Commands
```bash
# TypeScript 컴파일 검증
cd beta && npx tsc --noEmit  # Expected: exit code 0

# 변경 파일 확인
git diff --stat  # Expected: 3 files changed (breakpoints.ts, page.tsx, main-content.tsx)

# 기존 상수 변경 없음 확인
git diff beta/src/lib/breakpoints.ts | grep -E '^\-' | grep -v '^---'  # Expected: 기존 상수 삭제 라인 없음
```

### Final Checklist
- [ ] 모든 "Must Have" present (상수 추가, step function, CSS+JS 가시성 변경)
- [ ] 모든 "Must NOT Have" absent (TABLET 변경 없음, 임베디드 모드 건드리지 않음, NavigationPanel 변경 없음)
- [ ] TypeScript 빌드 통과
- [ ] 각 브레이크포인트에서 panel width 정확히 일치 (Playwright/evaluate 검증)
- [ ] center content horizontal overflow 없음
- [ ] sidebar toggle regression-free
