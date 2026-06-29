# Google Finance UI 픽셀 정합 이식 계획

## TL;DR

> **요약**: alpha/docs/의 Google Finance Beta UI 스펙을 beta/ Next.js 앱에 픽셀 단위 정합하며 이식. 영역별 독립 작업(data-gf 태그 기준), TDD 테스트, shadcn/ui 재구성.
>
> **Deliverables**: 반응형 레이아웃 컨테이너, fixed 네비 레일, GF 스타일 탭/차트/헤더 컴포넌트, oklch 테마 토큰 매핑
>
> **Estimated Effort**: Medium (8-12 waves, 25-30 tasks)
> **Parallel Execution**: YES - 최대 7개 동시 실행
> **Critical Path**: Theme → Layout → Navigation → Core Components → Integration

---

## Context

### Original Request
"@alpha/docs 를 읽어서 @beta 를 수정하는 계획을 세워봐."

### Interview Summary
**Key Discussions**:
- 테스트 전략: TDD (RED→GREEN→REFACTOR)
- 미측정 영역 처리: 영어 매처(gf-tagger.js english version) 재실행
- 차트 라이브러리: Recharts 유지 (기존 의존성, shadcn 통합, 비용 0)
- 탭 UI: shadcn bg-muted 제거 → GF와 동일 투명 배경+언더라인
- 좌측 네비: position:fixed 레일 방식 (<760px 숨김, ≥1480px 펼침)
- RBAC: 클라이언트 세션 훅 동기식 필터링 (서버 호출 없음)

**Research Findings**:
- Tailwind v4 사용 (@tailwindcss/postcss) → 별도 tailwind.config 불필요
- 테마 선택자: :root(라이트) / .dark(다크) — [data-theme] 아님
- 모든 색상 토큰 oklch 기반 (chroma=0 = grayscale)
- 차트 컬러: 현재 grayscale (--chart-1~5) → GF 컬러로 교체 필요
- body/html overflow: hidden (앱 동작 적합)

### Metis Review
**Identified Gaps** (addressed):
- GF 클래스명 동적 변경 가능성 → data-gf 기능 식별자 + CSS 변수 토큰 의존 필수
- 대시보드 조건부 렌더링 로직 → /dashboard 경로 우회 처리 유지 필요
- 미측정 영역(profile/metrics/news/related) → 영어 매처 재실행 후 보완 작업 추가

---

## Work Objectives

### Core Objective
Google Finance Beta UI의 반응형 레이아웃, 네비게이션 레일, 타이포그래피, 색상 토큰을 beta/ Next.js 앱에 픽셀 단위 정합하며 이식.

### Concrete Deliverables
- 반응형 레이아웃 컨테이너 (CSS 변수 기반)
- fixed 네비게이션 레일 컴포넌트 (3-tier 브레이크포인트 대응)
- GF 스타일 탭 컴포넌트 (투명 배경+언더라인/굵기)
- Recharts 래퍼 (GF 차트 스타일 적용)
- oklch 테마 토큰 매핑 (라이트/다크 자동 대응)

### Definition of Done
- [ ] Playwright 픽셀 정합 테스트 <1380 / 1380~1480 / ≥1480 뷰포트별 PASS
- [ ] 모든 data-gf 영역 alpha/docs 스펙과 치수·색상·간격 일치
- [ ] TDD 테스트 전량 PASS (RED→GREEN→REFACTOR 완료)

### Must Have
- 데이터 기반 치수 정합 (측정 값 우선)
- shadcn/ui 컴포넌트 재구성 (새 컴포넌트 생성 아님)
- 클라이언트 사이드 RBAC 필터링 (서버 호출 0회)

### Must NOT Have (Guardrails)
- 서버 측 네비 가시성 로직 추가 금지
- 기존 Recharts 의존성 교체 금지
- ai-slop 패턴(불필요한 추상화, 과도한 주석) 포함 금지

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (pytest)
- **Automated tests**: TDD (RED→GREEN→REFACTOR)
- **Framework**: Jest + React Testing Library (컴포넌트), Playwright (E2E 픽셀 정합)

### QA Policy
모든 작업은 Agent-Executed QA Scenarios 포함. 증거는 `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}` 저장.

- **Frontend/UI**: Playwright - 뷰포트별 레이아웃/치수/색상 정합 검증
- **Component**: Jest - 렌더링, 상태 변화, RBAC 필터링 동작 확인
- **Theme**: CSS 변수 추출 스크립트 - oklch 토큰 매핑 정확도 확인

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (기반 설정):
├── T1: 테마 토큰 정의 (CSS 변수)
├── T2: Tailwind v4 커스텀 유틸리티 추가
├── T3: 타입 정의 확장 (NavigationItem, TabProps)
└── T4: 테스트 유틸리티 함수 작성

Wave 2 (레이아웃 핵심):
├── T5: 반응형 레이아웃 컨테이너
├── T6: fixed 네비 레일 컴포넌트
├── T7: 메인 콘텐츠 마진 계산 훅
└── T8: 브레이크포인트 감지 유틸리티

Wave 3 (네비게이션 상세):
├── T9: 아이콘+호버 오버레이 (<1380~1480)
├── T10: 펼침/축소 전환 애니메이션
├── T11: RBAC 동기식 필터링 훅
└── T12: 네비 아이템 컴포넌트 재구성

Wave 4 (탭 UI):
├── T13: Period 탭 (텍스트 굵기 기반 활성 표시)
├── T14: Content 탭 (하단 보더 언더라인)
├── T15: 탭 컨테이너 레이아웃 정합
└── T16: 탭 상태 관리 훅 통합

Wave 5 (차트 영역):
├── T17: Recharts 래퍼 컴포넌트 (GF 스타일 적용)
├── T18: 차트 컬러 토큰 교체 (oklch → GF 색상)
├── T19: 차트 마진/패딩 정합
└── T20: 반응형 차트 크기 조정

Wave 6 (헤더+프로필):
├── T21: 스톡 헤더 (가격, 변동률 표시)
├── T22: 프로필 섹션 (기업 정보 레이아웃)
├── T23: 타이포그래피 토큰 매핑
└── T24: 헤더-차트 간격 정합

Wave 7 (미측정 영역 보완):
├── T25: Metrics 섹션 (핵심 지표 그리드)
├── T26: News 섹션 (기사 목록 레이아웃)
├── T27: Related Stocks 섹션
└── T28: 영어 매처 결과 반영 검증

Wave FINAL (통합 검증):
├── F1: Plan Compliance Audit (oracle)
├── F2: Code Quality Review (unspecified-high)
├── F3: Real Manual QA - Playwright 픽셀 정합 (unspecified-high + playwright)
└── F4: Scope Fidelity Check (deep)
```

### Dependency Matrix
| Task | Blocks | Blocked By |
|------|--------|------------|
| T1-T4 | - | None |
| T5 | T6, T7 | T1 |
| T6 | T9, T10, T11, T12 | T1, T5 |
| T7 | T5 | T1 |
| T8 | T6, T7 | T1 |
| T9-T12 | - | T6 |
| T13-T16 | - | T1, T4 |
| T17-T20 | - | T1, T4 |
| T21-T24 | - | T1, T4 |
| T25-T28 | - | T1, T4 |
| F1-F4 | - | All Tasks |

---

## TODOs

### Wave 1 — 기반 설정 (독립 실행 가능)

- [x] **1. 테마 토큰 정의 (CSS 변수)** ✅ COMPLETED

  **What to do**:
  - `globals.css`에 GF 색상/타이포그래피 CSS 변수 추가
  - oklch 토큰 매핑: 상승(`#046E00`), 하강(`#D32F2F`), 텍스트(`#0A0A0A`), 보조(`#56595E`)
  - 라이트(:root) / 다크(.dark) 모드별 토큰 정의

  **Must Not do**:
  - 기존 shadcn/ui 기본 토큰 삭제 금지
  - 새로운 CSS 파일 생성 금지 (globals.css 내에만 추가)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (T1-T4 동시 실행)
  - **Blocks**: T5, T6, T7, T8, T13-T16, T17-T20, T21-T24, T25-T28
  - **Blocked By**: None

  **References**:
  - `alpha/docs/themes.md` - GF 색상/타이포그래피 스펙
  - `beta/src/app/globals.css:51-118` - 현재 :root/.dark 토큰 구조

  **Acceptance Criteria**:
  - [ ] CSS 변수 15개 이상 추가 (--gf-color-rise, --gf-color-fall, --gf-text-primary 등)
  - [ ] oklch 변환 정확도 검증 (HEX → oklch 자동 계산)
  - [ ] Jest 테스트: CSS 변수 존재 여부 확인

  **QA Scenarios**:
  ```
  Scenario: CSS 변수 정의 확인
    Tool: Bash (grep + node/css parser)
    Steps:
      1. globals.css에서 --gf-* 변수 추출
      2. 15개 이상 확인
      3. oklch 값 유효성 검사
    Expected Result: 모든 변수 정의됨, oklch 형식 올바름
    Evidence: .sisyphus/evidence/task-1-css-vars.txt

  Scenario: 라이트/다크 모드 토큰 분리 확인
    Tool: Bash (grep)
    Steps:
      1. :root 블록 내 GF 토큰 확인
      2. .dark 블록 내 GF 토큰 확인
    Expected Result: 두 모드별 별도 토큰 존재
    Evidence: .sisyphus/evidence/task-1-theme-modes.txt
  ```

  **Commit**: YES
  - Message: `style(theme): add Google Finance color and typography tokens`

---

- [x] **2. Tailwind v4 커스텀 유틸리티 추가** ✅ COMPLETED

  **What to do**:
  - `@theme inline` 블록에 GF 전용 유틸리티 클래스 매핑 추가
  - 브레이크포인트 확장: `760px`, `1380px`, `1480px`, `1820px`
  - 네비 폭 토큰: `--nav-width-collapsed: 80px`, `--nav-width-expanded: 300px`

  **Must Not do**:
  - tailwind.config.ts 생성 금지 (Tailwind v4는 @theme inline 사용)
  - 기존 유틸리티 덮어쓰기 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (T1-T4 동시 실행)
  - **Blocks**: T5, T6, T8
  - **Blocked By**: None

  **References**:
  - `beta/src/app/globals.css:7-49` - 현재 @theme inline 구조
  - TailwindCSS v4 Docs: `https://tailwindcss.com/docs/v4-beta`

  **Acceptance Criteria**:
  - [ ] 브레이크포인트 4개 추가 (--breakpoint-gf-sm, --gf-md, --gf-lg, --gf-xl)
  - [ ] 네비 폭 토큰 2개 추가
  - [ ] Jest 테스트: 유틸리티 클래스 존재 확인

  **QA Scenarios**:
  ```
  Scenario: 브레이크포인트 토큰 정의 확인
    Tool: Bash (grep + node parser)
    Steps:
      1. globals.css에서 --breakpoint-gf-* 추출
      2. 4개 이상 확인 (760, 1380, 1480, 1820px)
    Expected Result: 모든 브레이크포인트 정의됨
    Evidence: .sisyphus/evidence/task-2-breakpoints.txt
  ```

  **Commit**: YES (T1과 그룹화)

---

- [x] **3. 타입 정의 확장** ✅ COMPLETED

  **What to do**:
  - `beta/src/types/`에 GF 전용 타입 정의 추가
  - `NavigationItem`, `TabProps`, `ChartConfig`, `ThemeToken` 인터페이스 생성

  **Must Not do**:
  - 기존 타입 파일 수정 금지 (새 파일 생성)
  - any 타입 사용 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills`: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (T1-T4 동시 실행)
  - **Blocks**: T6, T9-T12, T13-T16, T17-T20
  - **Blocked By**: None

  **References**:
  - `alpha/docs/nav-rbac.md` - 네비게이션 아이템 구조 스펙
  - `beta/src/app/dashboard/layout.tsx` - 현재 네비 타입 사용 패턴

  **Acceptance Criteria**:
  - [ ] TypeScript 컴파일 오류 없음 (`tsc --noEmit`)
  - [ ] 인터페이스 5개 이상 정의
  - [ ] Jest 테스트: 타입 호환성 확인

  **QA Scenarios**:
  ```
  Scenario: 타입 정의 컴파일 검증
    Tool: Bash (tsc --noEmit)
    Steps:
      1. types/gf-types.ts 생성 후 tsc 실행
    Expected Result: 컴파일 오류 0개
    Evidence: .sisyphus/evidence/task-3-tsc-output.txt
  ```

  **Commit**: YES (T1과 그룹화)

---

- [x] **4. 테스트 유틸리티 함수 작성** ✅ COMPLETED

  **What to do**:
  - 픽셀 정합 테스트용 헬퍼 함수 생성
  - 뷰포트 크기 설정, 요소 치수 추출, 색상 비교 유틸리티 구현

  **Must Not do**:
  - 기존 테스트 파일 수정 금지
  - 외부 의존성 추가 금지 (기존 Jest/Playwright만 사용)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills`: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (T1-T4 동시 실행)
  - **Blocks**: F3 (최종 QA)
  - **Blocked By**: None

  **References**:
  - Playwright Docs: `https://playwright.dev/docs/test-fixtures`

  **Acceptance Criteria**:
  - [ ] 뷰포트 설정 함수 (`setViewport(w, h)`)
  - [ ] 치수 추출 함수 (`getElementBox(selector)`)
  - [ ] 색상 비교 함수 (`compareColors(actual, expected, tolerance)`)
  - [ ] Jest 테스트: 유틸리티 함수 동작 확인

  **QA Scenarios**:
  ```
  Scenario: 유틸리티 함수 기본 동작
    Tool: Bash (jest test)
    Steps:
      1. test/utils/gf-test-utils.test.ts 작성 후 실행
    Expected Result: 테스트 통과 (tolerance=2px 내 색상 일치)
    Evidence: .sisyphus/evidence/task-4-utils-test.txt
  ```

  **Commit**: YES (T1과 그룹화)

---

### Wave 2 — 레이아웃 핵심 (T1 완료 후 시작)

- [x] **5. 반응형 레이아웃 컨테이너** ✅ COMPLETED

  **What to do**: 메인 레이아웃 컴포넌트 재구성 (CSS 변수 기반 마진 계산). `--main-margin-left` 동적 적용: `<760px`=0, `760~1380px`=80px, `≥1480px`=320px.

  **Must Not do**: 기존 라우트 구조 변경 금지, 서버 측 렌더링 로직 수정 금지.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 2 (T5-T8 동시), Blocks: T9-T12, F3 | Blocked By: T1, T2

  **References**: `alpha/docs/GOOGLE_FINANCE_LAYOUT_SPEC.md`(반응형 메커니즘), `beta/src/app/dashboard/layout.tsx:45-78`(현재 구조)

  **Acceptance Criteria**: Playwright 테스트: 3-tier 브레이크포인트별 margin-left 치수 정합 ±1px.

  **QA Scenarios**:
  ```
  Scenario: <760px 뷰포트 검증 | Tool: Playwright | viewport(750) → data-gf="main-content" boundingBox.marginLeft=0px±1 | Evidence: task-5-layout-mobile.png
  Scenario: ≥1480px 뷰포트 검증 | Tool: Playwright | viewport(1500) → margin-left=320px±1 | Evidence: task-5-layout-desktop.png
  ```

  **Commit**: YES

---

- [x] **6. fixed 네비 레일 컴포넌트** ✅ COMPLETED

  **What to do**: 기존 shadcn Sidebar 제거 → position:fixed 기반 GF 네비 레일 구현. 상태 관리: 숨김(<760), 아이콘+호버(760~1380), 펼침(≥1480). CSS 변수 --nav-width 적용 (80/300/320px).

  **Must Not do**: shadcn SidebarProvider 완전 삭제 금지, 서버 측 RBAC 로직 추가 금지.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 2 (T5-T8 동시), Blocks: T9-T12 | Blocked By: T1, T2, T3

  **References**: `alpha/docs/GOOGLE_FINANCE_LAYOUT_SPEC.md:120-180`(네비 동작 스펙), `beta/src/app/dashboard/layout.tsx:SidebarProvider`

  **Acceptance Criteria**: Playwright 테스트: 브레이크포인트별 네비 가시성/폭 정합, position:fixed 적용 확인.

  **QA Scenarios**:
  ```
  Scenario: <760px 네비 숨김 | Tool: Playwright | viewport(750) → data-gf="nav-rail" isVisible=false | Evidence: task-6-nav-mobile.png
  Scenario: ≥1480px 네비 펼침 | Tool: Playwright | viewport(1500) → width=320px±2 | Evidence: task-6-nav-desktop.png
  ```

  **Commit**: YES

---

- [ ] **7. 메인 콘텐츠 마진 계산 훅**

  **What to do**: `useMainMargin()` 커스텀 훅 생성. window.innerWidth 기반 --main-margin-left 값 반환. 리사이즈 이벤트 리스너로 동적 업데이트.

  **Must Not do**: 서버 컴포넌트에서 사용 금지, useEffect 없이 동기식 계산 시도 금지.

  **Recommended Agent Profile**: `quick`, []

  **Parallelization**: Wave 2 (T5-T8 동시), Blocks: T5 | Blocked By: T1, T3

  **References**: `alpha/docs/GOOGLE_FINANCE_LAYOUT_SPEC.md:200-220`(마진 계산 로직)

  **Acceptance Criteria**: Jest 테스트: 브레이크포인트별 예상 값 반환 확인, 리사이즈 시 상태 업데이트 검증.

  **QA Scenarios**:
  ```
  Scenario: 마진 값 정확도 | Tool: Jest | mount 훅 → innerWidth mock 변경(750→1000→1500) → 반환값[0,80,320]px | Evidence: task-7-hook-test.txt
  ```

  **Commit**: YES (T8과 그룹화)

---

- [ ] **8. 브레이크포인트 감지 유틸리티**

  **What to do**: `useBreakpoint()` 훅 생성: 현재 뷰포트 카테고리 반환 ('mobile'/'tablet'/'desktop'). matchMedia API 기반 구현. GF 전용 임계값 적용 (760, 1380, 1480).

  **Must Not do**: polyfill 추가 금지, 서버 측 렌더링 fallback 포함 금지.

  **Recommended Agent Profile**: `quick`, []

  **Parallelization**: Wave 2 (T5-T8 동시), Blocks: T9, T10 | Blocked By: T1

  **References**: MDN matchMedia Docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList

  **Acceptance Criteria**: Jest 테스트: 각 범주 정확히 분류 확인, removeEventListener 호출 검증.

  **QA Scenarios**:
  ```
  Scenario: 카테고리 분류 | Tool: Jest | mount 훅 → innerWidth mock 변경 → 반환값['mobile','tablet','desktop'] |     Evidence: task-8-breakpoint-test.txt
  ```

  **Commit**: YES (T7과 그룹화)

---

### Wave 3 — 네비게이션 상세 (T6 완료 후 시작)

- [ ] **9. 아이콘+호버 오버레이 (<1380~1480)**

  **What to do**: 760~1380px 범위에서 아이콘만 표시 + 호버 시 전체 메뉴 오버레이 표시. CSS transition 기반 부드러운 전환.

  **Must Not do**: JavaScript 기반 hover 상태 관리 금지 (CSS :hover 만 사용), z-index 충돌 발생 금지.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 3 (T9-T12 동시), Blocks: None | Blocked By: T6, T8

  **References**: `alpha/docs/GOOGLE_FINANCE_LAYOUT_SPEC.md:150-170`(오버레이 동작 스펙)

  **Acceptance Criteria**: Playwright 테스트: hover 시 오버레이 가시성 확인, transition 지속 시간 200ms±50ms.

  **QA Scenarios**:
  ```
  Scenario: 호버 오버레이 표시 | Tool: Playwright | viewport(1000) → nav-item.hover() → overlay.isVisible=true | Evidence: task-9-hover-overlay.png
  ```

  **Commit**: YES (T10과 그룹화)

---

- [ ] **10. 펼침/축소 전환 애니메이션**

  **What to do**: 네비 레일 폭 변경 시 width/max-width transition 적용. 아이콘 위치补정 transform: translateX().

  **Must Not do**: layout shift 발생 금지, animation duration 300ms 초과 금지.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 3 (T9-T12 동시), Blocks: None | Blocked By: T6

  **References**: CSS Transitions Docs: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions

  **Acceptance Criteria**: Playwright 테스트: transition 완료 후 최종 치수 정합, CLS(Cumulative Layout Shift)=0.

  **QA Scenarios**:
  ```
  Scenario: 전환 애니메이션 검증 | Tool: Playwright | viewport resize(1479→1481) → nav width transition 확인 | Evidence: task-10-transition.mp4
  ```

  **Commit**: YES (T9과 그룹화)

---

- [ ] **11. RBAC 동기식 필터링 훅**

  **What to do**: `useNavigationFilter()` 훅 생성. 클라이언트 세션(`useOrganization`, `membership.role`) 기반 메뉴 필터링. 서버 호출 0회.

  **Must Not do**: async/await 사용 금지, 로딩 상태 표시 금지, UI闪烁(flash) 발생 금지.

  **Recommended Agent Profile**: `quick`, []

  **Parallelization**: Wave 3 (T9-T12 동시), Blocks: T12 | Blocked By: T3

  **References**: `alpha/docs/nav-rbac.md`(RBAC 규칙 스펙), Better Auth Docs: https://www.better-auth.com

  **Acceptance Criteria**: Jest 테스트: 역할별 예상 메뉴 목록 반환 확인, 세션 변경 시 즉시 반영.

  **QA Scenarios**:
  ```
  Scenario: 관리자 권한 필터링 | Tool: Jest | mock role='admin' → 전체 메뉴 반환 | Evidence: task-11-admin-filter.txt
  Scenario: 일반 사용자 필터링 | Tool: Jest | mock role='user' → 제한 메뉴만 반환 | Evidence: task-11-user-filter.txt
  ```

  **Commit**: YES

---

- [ ] **12. 네비 아이템 컴포넌트 재구성**

  **What to do**: 기존 shadcn MenuItem 제거 → GF 스타일 네비 아이템 구현. 아이콘+레이아웃 레이블, 활성 상태 하단 보더 표시.

  **Must Not do**: shadcn/ui 컴포넌트 직접 수정 금지, 새로운 의존성 추가 금지.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 3 (T9-T12 동시), Blocks: None | Blocked By: T6, T11

  **References**: `alpha/docs/themes.md`(네비 색상 토큰)

  **Acceptance Criteria**: Playwright 테스트: 활성 항목 스타일 정합 (border-bottom-color, font-weight).

  **QA Scenarios**:
  ```
  Scenario: 활성 네비 아이템 스타일 | Tool: Playwright | active-item 선택 → computedStyle 확인 | Evidence: task-12-active-nav.png
  ```

  **Commit**: YES

---

### Wave 4 — 탭 UI (독립 실행 가능, T1 완료 후 시작)

- [ ] **13. Period 탭 (텍스트 굵기 기반)**

  **What to do**: 기간 선택 탭(1D, 5D, 1M, 6M, YTD, 1Y, 5Y, ALL). 활성 시 텍스트 굵기 bold, 비활성 regular. 배경 투명 유지.

  **Must Not do**: shadcn bg-muted 적용 금지, 배경색 변경 금지.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 4 (T13-T16 동시), Blocks: None | Blocked By: T1, T4

  **References**: `alpha/docs/gf-regions/tabs.md`(Period 탭 스펙)

  **Acceptance Criteria**: Jest 테스트: 활성 상태 font-weight=700 반환, 비활성 400 반환.

  **QA Scenarios**:
  ```
  Scenario: 활성 Period 탭 스타일 | Tool: Playwright | active-tab 선택 → font-weight=700 확인 | Evidence: task-13-period-active.png
  ```

  **Commit**: YES (T14과 그룹화)

---

- [ ] **14. Content 탭 (하단 보더 언더라인)**

  **What to do**: 콘텐츠 섹션 탭(CHART, NEWS, RELATED). 활성 시 하단 보더(2px solid primary-color), 텍스트 색상 primary.

  **Must Not do**: 배경색 변경 금지, shadcn TabIndicator 제거.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 4 (T13-T16 동시), Blocks: None | Blocked By: T1, T4

  **References**: `alpha/docs/gf-regions/tabs.md`(Content 탭 스펙)

  **Acceptance Criteria**: Playwright 테스트: 활성 탭 border-bottom-width=2px, color=primary 확인.

  **QA Scenarios**:
  ```
  Scenario: 활성 Content 탭 스타일 | Tool: Playwright | active-content-tab 선택 → border-bottom 확인 | Evidence: task-14-content-border.png
  ```

  **Commit**: YES (T13과 그룹화)

---

- [ ] **15. 탭 컨테이너 레이아웃 정합**

  **What to do**: 탭 간격(gap=16px), 패딩(top/bottom=0, left/right=8px), 전체 너비 flex:1 적용.

  **Must Not do**: 고정 너비 사용 금지, overflow-x: visible 금지.

  **Recommended Agent Profile**: `quick`, []

  **Parallelization**: Wave 4 (T13-T16 동시), Blocks: None | Blocked By: T13, T14

  **References**: `alpha/docs/gf-regions/tabs.md`(레이아웃 치수 스펙)

  **Acceptance Criteria**: Playwright 테스트: gap=16px±1, padding 확인.

  **QA Scenarios**:
  ```
  Scenario: 탭 간격 검증 | Tool: Playwright | tab-container 선택 → computedStyle.gap=16px±1 | Evidence: task-15-tab-gap.txt
  ```

  **Commit**: YES (T16과 그룹화)

---

- [ ] **16. 탭 상태 관리 훅 통합**

  **What to do**: `useTabState()` 훅 생성. URL query parameter 기반 탭 상태 유지. 기본값 자동 설정.

  **Must Not do**: 서버 측 상태 저장 금지, localStorage 사용 금지.

  **Recommended Agent Profile**: `quick`, []

  **Parallelization**: Wave 4 (T13-T16 동시), Blocks: None | Blocked By: T3

  **References**: Next.js useRouter Docs: https://nextjs.org/docs/app/api-reference/functions/use-router

  **Acceptance Criteria**: Jest 테스트: URL 변경 시 탭 상태 동기화 확인.

  **QA Scenarios**:
  ```
  Scenario: URL 기반 탭 상태 복원 | Tool: Jest | mock url ?tab=news → activeTab='news' 반환 |     Evidence: task-16-url-sync.txt
  ```

  **Commit**: YES (T15과 그룹화)

---

### Wave 5 — 차트 영역 (독립 실행 가능, T1 완료 후 시작)

- [ ] **17. Recharts 래퍼 컴포넌트**

  **What to do**: GF 스타일 적용된 Recharts 래퍼 생성..axis 제거, grid 라인 투명/회색, tooltip 커스텀.

  **Must Not do**: Recharts 버전 변경 금지, 새로운 차트 라이브러리 도입 금지.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 5 (T17-T20 동시), Blocks: None | Blocked By: T1, T4

  **References**: `alpha/docs/gf-regions/chart-decision.md`(차트 스타일 스펙), Recharts Docs: https://recharts.org

  **Acceptance Criteria**: Jest 테스트: 래퍼 렌더링 확인, props 전달 검증.

  **QA Scenarios**:
  ```
  Scenario: 차트 기본 렌더링 | Tool: Playwright | chart-container 선택 → isVisible=true, axis.style.display='none' | Evidence: task-17-chart-render.png
  ```

  **Commit**: YES (T18과 그룹화)

---

- [ ] **18. 차트 컬러 토큰 교체**

  **What to do**: 현재 grayscale --chart-1~5 토큰을 GF 색상으로 교체. 상승=oklch(0.72 0.19 149), 하강=oklch(0.63 0.25 25).

  **Must Not do**: 기존 shadcn/ui 차트 토큰 삭제 금지, 새로운 파일 생성 금지.

  **Recommended Agent Profile**: `quick`, []

  **Parallelization**: Wave 5 (T17-T20 동시), Blocks: None | Blocked By: T1

  **References**: `alpha/docs/themes.md`(차트 색상 스펙), `beta/src/app/globals.css:70-74`

  **Acceptance Criteria**: CSS 변수 추출 스크립트: oklch 값 정확히 매핑 확인.

  **QA Scenarios**:
  ```
  Scenario: 차트 컬러 정합 | Tool: Playwright + CSS parser | rising-line 선택 → color=#046E00±tolerance | Evidence: task-18-chart-color.txt
  ```

  **Commit**: YES (T17과 그룹화)

---

- [ ] **19. 차트 마진/패딩 정합**

  **What to do**: 차트 영역 내외부 여백 GF 스펙 적용. 상단=16px, 하단=8px, 좌우=0px.

  **Must Not do**: 고정 px 단위만 사용 금지 (CSS 변수 활용).

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 5 (T17-T20 동시), Blocks: None | Blocked By: T17

  **References**: `alpha/docs/gf-regions/chart-decision.md`(차트 치수 스펙)

  **Acceptance Criteria**: Playwright 테스트: padding-top=16px±1, padding-bottom=8px±1 확인.

  **QA Scenarios**:
  ```
  Scenario: 차트 패딩 검증 | Tool: Playwright | chart-area 선택 → computedStyle.padding 확인 | Evidence: task-19-chart-padding.png
  ```

  **Commit**: YES (T20과 그룹화)

---

- [ ] **20. 반응형 차트 크기 조정**

  **What to do**: 뷰포트 변경 시 차트 너비/높이 자동 조정. ResizeObserver 기반 구현.

  **Must Not do**: window.resize 이벤트 직접 리스닝 금지 (ResizeObserver 권장).

  **Recommended Agent Profile**: `quick`, []

  **Parallelization**: Wave 5 (T17-T20 동시), Blocks: None | Blocked By: T17

  **References**: MDN ResizeObserver Docs: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver

  **Acceptance Criteria**: Jest 테스트: 컨테이너 크기 변경 시 차트 props 업데이트 확인.

  **QA Scenarios**:
  ```
  Scenario: 차트 반응형 동작 | Tool: Playwright | viewport resize(1200→800) → chart width 재계산 확인 | Evidence: task-20-responsive-chart.mp4
  ```

  **Commit**: YES (T19과 그룹화)

---

### Wave 6 — 헤더+프로필 (독립 실행 가능, T1 완료 후 시작)

- [ ] **21. 스톡 헤더 (가격, 변동률 표시)**

  **What to do**: 티커 심볼, 현재가, 전일 대비 금액/비율 표시. 상승=초록색, 하강=빨간색.

  **Must Not do**: 서버 측 데이터 포맷팅 금지 (클라이언트 전용).

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 6 (T21-T24 동시), Blocks: None | Blocked By: T1, T4

  **References**: `alpha/docs/gf-regions/stockheader.md`(헤더 스펙)

  **Acceptance Criteria**: Jest 테스트: 가격 포맷팅 정확도 확인, 색상 클래스 적용 검증.

  **QA Scenarios**:
  ```
  Scenario: 상승가 색상 검증 | Tool: Playwright | price-container 선택 → color=#046E00±tolerance | Evidence: task-21-rising-price.png
  ```

  **Commit**: YES (T23과 그룹화)

---

- [ ] **22. 프로필 섹션 (기업 정보 레이아웃)**

  **What to do**: 기업명, 산업, 시가총액 그리드 레이아웃 구현. 영어 매처 결과 반영.

  **Must Not do**: 하드코딩된 데이터 사용 금지, mock 데이터만 테스트용.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 6 (T21-T24 동시), Blocks: None | Blocked By: T1

  **References**: `alpha/docs/gf-regions/profile.md`(프로필 스펙 - 영어 매처 pending)

  **Acceptance Criteria**: Playwright 테스트: 그리드 열 수/간격 정합.

  **QA Scenarios**:
  ```
  Scenario: 프로필 그리드 레이아웃 | Tool: Playwright | profile-section 선택 → grid-template-columns 확인 | Evidence: task-22-profile-grid.png
  ```

  **Commit**: YES

---

- [ ] **23. 타이포그래피 토큰 매핑**

  **What to do**: 폰트 크기/굵기/행높이 GF 스펙 적용. 티커=20px bold, 가격=32px bold, 라벨=12px regular.

  **Must Not do**: 새로운 웹폰트 로드 금지 (기존 font-sans 활용).

  **Recommended Agent Profile**: `quick`, []

  **Parallelization**: Wave 6 (T21-T24 동시), Blocks: None | Blocked By: T1

  **References**: `alpha/docs/themes.md`(타이포그래피 스펙)

  **Acceptance Criteria**: Playwright 테스트: font-size, font-weight 정확히 매핑 확인.

  **QA Scenarios**:
  ```
  Scenario: 티커 텍스트 치수 | Tool: Playwright | ticker-symbol 선택 → fontSize='20px', fontWeight='700' | Evidence: task-23-ticker-font.txt
  ```

  **Commit**: YES (T21과 그룹화)

---

- [ ] **24. 헤더-차트 간격 정합**

  **What to do**: 스톡 헤더와 차트 영역 사이 간격 GF 스펙 적용 (gap=24px).

  **Must Not do**: margin 대신 gap 사용 (flex/grid 컨테이너 기준).

  **Recommended Agent Profile**: `quick`, []

  **Parallelization**: Wave 6 (T21-T24 동시), Blocks: None | Blocked By: T21, T17

  **References**: `alpha/docs/gf-regions/stockheader.md`(간격 스펙)

  **Acceptance Criteria**: Playwright 테스트: header-bottom과 chart-top 사이 거리=24px±1.

  **QA Scenarios**:
  ```
  Scenario: 헤더-차트 간격 검증 | Tool: Playwright | boundingBox 계산 → distance=24px±1 | Evidence: task-24-header-chart-gap.png
  ```

  **Commit**: YES

---

### Wave 7 — 미측정 영역 보완 (영어 매처 결과 반영, T1 완료 후 시작)

- [ ] **25. Metrics 섹션 (핵심 지표 그리드)**

  **What to do**: PE, PB, 시가총액, 거래량 등 핵심 지표 표시. 영어 매처 결과 기반 레이아웃 구현.

  **Must Not do**: mock 데이터 하드코딩 금지, API 연동 로직 포함 금지.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 7 (T25-T28 동시), Blocks: None | Blocked By: T1

  **References**: `alpha/docs/gf-regions/metrics.md`(metrics 스펙 - 영어 매처 pending)

  **Acceptance Criteria**: Jest 테스트: 그리드 레이아웃 렌더링 확인.

  **QA Scenarios**:
  ```
  Scenario: 메트릭스 카드 렌더링 | Tool: Playwright | metrics-grid 선택 → childElementCount≥4 확인 | Evidence: task-25-metrics-render.png
  ```

  **Commit**: YES (T26과 그룹화)

---

- [ ] **26. News 섹션 (기사 목록 레이아웃)**

  **What to do**: 기사 제목, 출처, 시간 표시. 리스트 뷰 + 구분선 스타일 적용.

  **Must Not do**: 실제 뉴스 피드 연동 금지, 정적 mock만 사용.

  **Recommended Agent Profile**: `visual-engineering`, []

  **Parallelization**: Wave 7 (T25-T28 동시), Blocks: None | Blocked By: T1

  **References**: `alpha/docs/gf-regions/news.md`(news 스펙 - 영어 매처 pending)

  **Acceptance Criteria**: Playwright 테스트: 리스트 항목 간격/스타일 정합.

  **QA Scenarios**:
  ```
  Scenario: 뉴스 아이템 스타일 | Tool: Playwright | news-item:first-child 선택 → borderBottom 확인 | Evidence: task-26-news-list.png
  ```

  **Commit**: YES (T26과 그룹화)

---

- [ ] **27. Related Stocks 섹션**

  **What to do**: 관련 종목 티커, 현재가, 변동률 표시. 테이블/리스트 뷰 구현.

  **Must Not do**: 외부 API 호출 로직 포함 금지.

  **Recommended Agent Profile**: `quick`, []

  **Parallelization**: Wave 7 (T25-T28 동시), Blocks: None | Blocked By: T1

  **References**: `alpha/docs/gf-regions/related.md`(related 스펙 - 영어 매처 pending)

  **Acceptance Criteria**: Jest 테스트: 행 렌더링 수 확인, 데이터 바인딩 검증.

  **QA Scenarios**:
  ```
  Scenario: 관련 종목 목록 | Tool: Playwright | related-stocks-table 선택 → row count≥3 확인 | Evidence: task-27-related-list.png
  ```

  **Commit**: YES (T28과 그룹화)

---

- [ ] **28. 영어 매처 결과 반영 검증**

  **What to do**: gf-tagger.js english version 실행 결과 분석. 미측정 영역 치수/스타일 보완 적용.

  **Must Not do**: 영어 매처 실패 시 작업 건너뛰기 금지 (대체 측정 방법 사용).

  **Recommended Agent Profile**: `deep`, []

  **Parallelization**: Wave 7 (T25-T28 동시), Blocks: F3 | Blocked By: T25, T26, T27

  **References**: `alpha/docs/gf-regions/*.md`(미측정 영역 스펙)

  **Acceptance Criteria**: 모든 data-gf 영역 스펙 존재 확인, 치수 정합률 ≥90%.

  **QA Scenarios**:
  ```
  Scenario: 영어 매처 결과 통합 | Tool: Bash + Python parser | tagger output 파싱 → missing regions=0 확인 |     Evidence: task-28-tagging-complete.txt
  ```

  **Commit**: YES

---

## Final Verification Wave (모든 작업 완료 후 실행)

> 4개 리뷰 에이전트가 병렬로 실행. ALL APPROVE 필요. 결과 통합 → 사용자 명시적 승인 대기.

- [ ] **F1. Plan Compliance Audit** — `oracle`
  계획서 전량 읽기. "Must Have" 항목별 구현 존재 확인 (파일 읽기, curl 엔드포인트). "Must NOT Have" 금지 패턴 검색. 증거 파일(.sisyphus/evidence/) 존재 확인.
  출력: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] **F2. Code Quality Review** — `unspecified-high`
  `tsc --noEmit` + linter + `jest --ci` 실행. 변경 파일 검토: `as any`, 빈 catch, console.log, 주석 처리된 코드, 미사용 import. AI slop 패턴 확인.
  출력: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] **F3. Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  클린 상태 시작. 모든 작업의 QA 시나리오 순차 실행. 크로스 작업 통합 테스트 (기능 간 상호작용). 엣지 케이스: 빈 상태, 유효하지 않은 입력, 빠른 연속 동작. `.sisyphus/evidence/final-qa/` 저장.
  출력: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] **F4. Scope Fidelity Check** — `deep`
  각 작업별 "What to do" 읽기 → 실제 diff 비교 (git log/diff). 1:1 일치 확인 (누락 없음, 범주 침범 없음). "Must NOT do" 준수 확인. 교차 작업 오염 감지 (Task N이 Task M 파일 수정).
  출력: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Wave | Commit Message | Files | Pre-commit |
|------|----------------|-------|------------|
| 1 | `chore(gf): add theme tokens, types, and test utilities` | globals.css, types/gf-types.ts, test/utils/* | jest test/utils/*.test.ts |
| 2 | `feat(layout): implement responsive container and fixed nav rail` | layout.tsx, useMainMargin.ts, useBreakpoint.ts | playwright tests/wave2/*.spec.ts |
| 3 | `feat(nav): implement hover overlay, animations, and RBAC filtering` | NavRail.tsx, NavigationItem.tsx, useNavigationFilter.ts | jest + playwright |
| 4 | `feat(tabs): implement GF-style period and content tabs` | PeriodTab.tsx, ContentTab.tsx, useTabState.ts | jest + playwright |
| 5 | `feat(chart): wrap Recharts with GF styling and responsive sizing` | ChartWrapper.tsx, chart.tokens.css, useChartResize.ts | jest + playwright |
| 6 | `feat(header): implement stock header, typography, and spacing` | StockHeader.tsx, typography.css, HeaderChartGap.tsx | jest + playwright |
| 7 | `feat(regions): implement metrics, news, related sections` | MetricsGrid.tsx, NewsList.tsx, RelatedStocks.tsx | jest + playwright |
| FINAL | `verify(gf): final compliance audit and QA pass` | .sisyphus/evidence/* | all tests |

---

## Success Criteria

### Verification Commands
```bash
# 타입 체크
cd beta && tsc --noEmit  # Expected: 0 errors

# 컴포넌트 테스트
npx jest --coverage  # Expected: ≥80% coverage, 0 failures

# E2E 픽셀 정합 테스트
npx playwright test --project=chromium  # Expected: all scenarios PASS

# 브레이크포인트별 검증
npx playwright test --viewport="750x1024"  # mobile
npx playwright test --viewport="1300x900"  # tablet
npx playwright test --viewport="1500x900"  # desktop
```

### Final Checklist
- [ ] 모든 "Must Have" 항목 구현 확인
- [ ] 모든 "Must NOT Have" 항목 부재 확인
- [ ] TDD 테스트 전량 PASS (RED→GREEN→REFACTOR 완료)
- [ ] Playwright 픽셀 정합 테스트 3-tier 뷰포트별 PASS
- [ ] 증거 파일(.sisyphus/evidence/) 전량 생성됨
- [ ] F1-F4 리뷰 에이전트 ALL APPROVE
- [ ] 사용자 명시적 승인("okay") 받음

---

## Agent Dispatch Summary

| Wave | Tasks | Recommended Agents | Parallelism |
|------|-------|-------------------|-------------|
| 1 | T1-T4 | `quick` x4 | 4개 동시 실행 |
| 2 | T5-T8 | `visual-engineering` x2, `quick` x2 | 4개 동시 실행 |
| 3 | T9-T12 | `visual-engineering` x3, `quick` x1 | 4개 동시 실행 |
| 4 | T13-T16 | `visual-engineering` x2, `quick` x2 | 4개 동시 실행 |
| 5 | T17-T20 | `visual-engineering` x2, `quick` x2 | 4개 동시 실행 |
| 6 | T21-T24 | `visual-engineering` x2, `quick` x2 | 4개 동시 실행 |
| 7 | T25-T28 | `visual-engineering` x2, `deep` x1, `quick` x1 | 4개 동시 실행 |
| FINAL | F1-F4 | `oracle`, `unspecified-high` x2, `deep` | 4개 병렬 리뷰 |

**총 작업 수**: 28개 구현 + 4개 검증 = 32개
**최대 병렬 속도 향상**: 순차 대비 ~70% 단축
**임계 경로**: T1 → T5 → T6 → T9-T12 → F3 → 사용자 승인
