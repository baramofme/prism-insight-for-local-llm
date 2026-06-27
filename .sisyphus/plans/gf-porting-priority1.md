# GF Porting — 1순위 (gf-main 본문 픽셀 정합)

## TL;DR

> **Quick Summary**: Google Finance 베타 종목 상세 화면의 `gf-main` 영역(5개)을 alpha Next.js 대시보드에 픽셀 단위로 정합. Playwright MCP로 GF 측정 → 스펙화 → 컴포넌트 수정 → 검증 사이클 반복.
> 
> **Deliverables**: stock-header, key-metrics, tabs(period/content), related-stocks, news-list, company-profile 컴포넌트의 GF 정합 + 가격 차트 라이브러리 결정
> 
> **Estimated Effort**: Medium (6개 태스크, 순차적 의존성 있음)
> **Parallel Execution**: NO — 영역별 캡처→이식→검증 순환은 직렬
> **Critical Path**: T1(GF 측정) → T2(stockheader) → T3(metrics) → T4(tabs) → T5(related/news/profile) → T6(chart)

---

## Context

### Original Request
`alpha/docs/GF_PORTING_PLAN.md`에서 1순위 영역(`gf-main-stockheader`, `metrics`, `tabs`, `related/news/profile`, `chart`)의 픽셀 정합 작업 진행.

### Interview Summary
**결정 사항**:
- 작업 방식: Playwright MCP 스킬 활용 — 프로젝트 설치 없이 MCP 브라우저 도구로 GF 접근/캡처
- alpha 측 검증: 별도 (에디터/브라우저에서 수동 확인 또는 dev server)

**연구 결과 **(explore agent)
- 8개 컴포넌트 모두 존재 (`stock-header`, `key-metrics`, `price-chart`, `news-list`, `related-stocks`, `company-profile` + 탭 2개는 `finance-view.tsx` 인라인)
- gf-tagger.js 준비됨 — GF DOM 태거 + `__gfSrc()` 스타일 덤프
- GOOGLE_FINANCE_LAYOUT_SPEC.md — 브레이크포인트별 실측치 SoT
- Playwright는 alpha package.json에 없음 → MCP 스킬 사용으로 결정

### Metis Review
**식별된 갭**(해결):
| 갭 | 해결 |
|---|---|
| "픽셀 완벽" 정의 부재 | ±2px 허용, 색상 hex 정확 매칭, 폰트 family/size/weight 동일 |
| 차트 라이브러리 선택 기준 없음 | T6 전 lightweight-charts vs Recharts 비교 테이블 작성 |
| 상호작용 상태 포함 여부 | 정적 렌더링만. hover/loading/exclude |
| 다크모드/애니메이션/i18n 범위 | 제외 (명시적 Must NOT) |
| 빈 데이터 처리 | graceful degradation 필수 (대시보드 placeholder) |

---

## Work Objectives

### Core Objective
Google Finance 베타 종목 상세 페이지의 핵심 본문 영역(5개)을 alpha 컴포넌트에 픽셀 단위로 정합하여 시각적 일관성 확보.

### Concrete Deliverables
- [ ] `stock-header.tsx` — 종목명 20px / 가격 24px / 변동칩 색 정합
- [ ] `key-metrics.tsx` — 그리드 열수·간격·라벨/값 타이포 정합
- [ ] `finance-view.tsx` — period tabs + content tabs 외형 정합
- [ ] `related-stocks.tsx`, `news-list.tsx`, `company-profile.tsx` — 나머지 본문 정합
- [ ] 차트 영역: lightweight-charts 도입 결정 + 스펙 문서화

### Definition of Done
- [ ] 각 영역: GF 스크린샷 vs alpha 스크린샷 비교 시 ±2px 이내
- [ ] 3 브레이크포인트(<1380, 1380~1480, ≥1480) 각각 검증 완료
- [ ] console error 0, React warning 0
- [ ] 빈 데이터 graceful degradation 확인

### Must Have
- 영역별 이식 스펙(`docs/gf-regions/*.md`) 작성
- 캡처 PNG(`docs/gf-shots/<region>-<bp>.png`) 저장
- 컴포넌트 수정 후 dev server에서 시각적 확인

### Must NOT Have (Guardrails)
- 상호작용 상태(hover, loading, animation) 추가 금지
- 다크모드/다중 테마 지원 금지
- 외부 API 연동(실제 뉴스/시세 데이터) 금지 — 모킹 데이터만
- 새로운 npm 패키지 추가 금지 (차트 라이브러리 변경은 별도 승인 필요)
- 접근성(a11y) 개선 포함 금지 — 시각 정합만

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (alpha에 테스트 프레임워크 없음)
- **Automated tests**: None — 시각적 스크린샷 비교가 주요 검증 수단
- **Agent-Executed QA**: Playwright MCP로 GF vs alpha 스크린샷 캡처 → 수동 비교

### QA Policy
각 태스크 완료 시:
- **GF 기준**: Playwright MCP → finance.google.com → gf-tagger.js 주입 → `__gfSrc()` 측정 + 영역 스크린샷
- **Alpha 검증**: `bun run dev` 실행 → 동일 뷰포트에서 스크린샷 → 대조
- 증거 저장: `docs/gf-shots/<region>-<bp>.png`(GF), `docs/gf-shots/alpha-<region>-<bp>.png`(alpha)

---

## Execution Strategy

### Sequential Workflow

```
T1a: stockheader measurement @ 3BP (screenshots + computed styles)
  ↓ (T1a 패턴 검증 성공 시 T1b~e 병렬)
T1b: metrics measurement @ 3BP
T1c: tabs measurement @ 3BP
T1d: news measurement @ 3BP
T1e: related+profile measurement @ 3BP
  ↓
T1f: [Orchestrator] 5개 원시측정 → spec 문서 컴파일
  ↓
T2: stock-header 정합 (종목명/가격/변동칩)
  ↓
T3: key-metrics 정합 (그리드/타이포)
  ↓
T4: tabs 정합 (period + content 탭 외형)
  ↓
T5: related / news / profile 정합
  ↓
T6: 차트 영역 — lightweight-charts 도입 결정
```

### Agent Dispatch Summary
- **T1a~T1e**: `quick` + `playwright` skill — 단일 영역 × 3BP 스크린샷 + computed styles (5분 태스크)
- **T1f**: [Orchestrator] 직접 컴파일
- **T2-T5**: `visual-engineering` — UI 컴포넌트 픽셀 정합
- **T6**: `deep` — 라이브러리 비교 + 아키텍처 결정

---

## TODOs

- [x] T1a. stockheader 측정 @ 3BP

  **What to do** (5분 완료 목표):
  1. Playwright MCP → `https://www.google.com/finance/quote/000660:KRX`
  2. 2초 대기 후 `getComputedStyle()`으로 stockheader 요소 수집:
     - `document.querySelector('[data-gf="gf-main-stockheader"]')` 또는
     - fallback: 종목명 영역 (h1 + price + change) 직접 쿼리
     - 수집: font-size, font-weight, color, padding, margin, gap, line-height, letter-spacing
  3. 3 BP로 리사이즈 (1024×900 → 1430×900 → 1680×900), 각각:
     - 1초 대기 후 stockheader 영역 스크린샷: `docs/gf-shots/stockheader-{bp}.png`
     - computed styles 딕셔너리 저장
  4. 결과를 `docs/gf-shots/measurement-raw-stockheader.json`에 저장
  - **다른 src/ 파일 절대 수정 금지**

  **Acceptance Criteria**:
  - [ ] screenshot 3장: `stockheader-1024.png`, `stockheader-1430.png`, `stockheader-1680.png`
  - [ ] raw JSON: 각 BP별 font-size/weight/color/padding 값 포함

  **Commit**: NO

---

- [x] T1b. metrics 측정 @ 3BP

  **What to do** (5분 완료 목표):
  1. Playwright MCP → `https://www.google.com/finance/quote/000660:KRX`
  2. metrics 영역(`[data-gf="gf-main-metrics"]`) 쿼리
  3. 3 BP로 리사이즈, 각각:
     - 스크린샷: `docs/gf-shots/metrics-{bp}.png`
     - computed styles: grid-template-columns, gap, cell padding, font-size/weight/color
  4. 결과 → `docs/gf-shots/measurement-raw-metrics.json`
  - **주의**: 이전 측정 파일 덮어쓰지 말 것 (append only)

  **Acceptance Criteria**:
  - [ ] screenshot 3장
  - [ ] raw JSON: grid-template-columns, gap, cell 타이포 포함

  **Commit**: NO

---

- [x] T1c. tabs 측정 @ 3BP

  **What to do** (5분 완료 목표):
  1. Playwright MCP → `https://www.google.com/finance/quote/000660:KRX`
  2. period tabs(`[data-gf="gf-main-periodtabs"]`) + content tabs(`[data-gf="gf-main-contenttabs"]`)
  3. 3 BP 각각:
     - 스크린샷: `docs/gf-shots/tabs-{bp}.png`
     - period tabs: height, item padding, active state style(border-bottom?), gap
     - content tabs: list bg, trigger padding, active underline color/thickness
  4. 결과 → `docs/gf-shots/measurement-raw-tabs.json`

  **Acceptance Criteria**:
  - [ ] screenshot 3장
  - [ ] raw JSON: period + content tabs 스타일

  **Commit**: NO

---

- [x] T1d. news 측정 @ 3BP

  **What to do** (5분 완료 목표):
  1. Playwright MCP → `https://www.google.com/finance/quote/000660:KRX`
  2. news 영역(`[data-gf="gf-main-news"]`)
  3. 3 BP 각각:
     - 스크린샷: `docs/gf-shots/news-{bp}.png`
     - card/item: padding, font-size(title/source/time), gap, border-radius
  4. 결과 → `docs/gf-shots/measurement-raw-news.json`

  **Acceptance Criteria**:
  - [ ] screenshot 3장
  - [ ] raw JSON: news item 타이포 + 간격

  **Commit**: NO

---

- [x] T1e. related+profile 측정 @ 3BP

  **What to do** (5분 완료 목표):
  1. Playwright MCP → `https://www.google.com/finance/quote/000660:KRX`
  2. content tabs에서 '관련' / '프로필' 영역 선택
  3. related(`[data-gf="gf-main-related"]`): card 구조, ticker/name/price 타이포
  4. profile(`[data-gf="gf-main-profile"]`): description line-count, field layout, heading
  5. 3 BP 각각 스크린샷: `docs/gf-shots/related-{bp}.png`, `docs/gf-shots/profile-{bp}.png`
  6. 결과 → `docs/gf-shots/measurement-raw-related-profile.json`

  **Acceptance Criteria**:
  - [ ] related screenshot 3장 + profile screenshot 3장
  - [ ] raw JSON: 카드 구조 + 타이포

  **Commit**: NO

---

- [x] T1f. [Orchestrator] 원시측정 → 5개 스펙 문서 컴파일

  **What to do**:
  - T1a~e의 raw JSON 파일을 읽어 `docs/gf-regions/*.md` 스펙 문서 작성
  - 각 문서: 컨테이너 치수, 레이아웃(display/flex/grid), 간격(padding/margin/gap), 타이포(size/weight/color), 3 BP 비교표
  - **직접 수행** (서브에이전트 불필요)

  **Acceptance Criteria**:
  - [ ] 5개 `docs/gf-regions/*.md` 스펙 문서 완성
  - [ ] 각 문서: 3 BP 데이터 포함

  **Commit**: YES — `docs(finance): GF measurement specs for 5 priority regions`

---

---

- [x] 2. stock-header 정합 (종목명/가격/변동칩/시각)

  **What to do**:
  - `docs/gf-regions/stockheader.md` 스펙 읽기
  - `alpha/src/features/finance/components/stock-header.tsx` 수정:
    - 종목명 font-size: 현재 `text-xl`(20px) → GF 측정치 반영
    - 가격 font-size: 현재 `text-2xl`(24px) → GF 측정치 반영
    - 변동칩: 아이콘 size, gap, color(상승 #C0151D / 하락 #3364F0), font-weight 정합
    - 시적(timestamp) text-xs + muted-foreground 유지 or GF 매칭
    - 전체 컨테이너 padding, spacing(GF 기준 space-y 값) 조정
  - dev server에서 3 BP 각각 렌더링 확인
  - alpha 스크린샷 저장: `docs/gf-shots/alpha-stockheader-<bp>.png`

  **Must Not do**:
  - 새로운 컴포넌트 추가 또는 기존 구조 대폭 변경
  - lucide-react 아이콘 교체 (ArrowUp/Down 유지 — 크기만 조정 가능)
  - colors.ts의 UP/DOWN_COLOR 상수 변경 (KRX 관례 유지)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 픽셀 단위 UI 정합 작업 — Tailwind 클래스 치수 조정이 핵심
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO — T1 완료 후 순차
  - **Blocks**: T3
  - **Blocked By**: T1

  **References**:
  - Pattern: `stock-header.tsx`(현재 23줄) — 단순 div 기반 레이아웃, 수정 용이
  - API: `types.ts:Quote` — ticker, name, price, changePct, asOf 필드
  - 스펙: `docs/gf-regions/stockheader.md`(T1 산출물)

  **Acceptance Criteria**:
  - [ ] 종목명 font-size ±2px 이내 매칭
  - [ ] 가격 font-size ±2px 이내 매칭
  - [ ] 변동칩 색상 hex 정확 일치 (#C0151D / #3364F0)
  - [ ] 3 BP 각각 alpha 스크린샷 저장

  **QA Scenarios**:
  ```
  Scenario: stock-header 렌더링 정상 확인
    Tool: Playwright MCP (alpha dev server)
    Steps:
      1. localhost:3000 접근 → finance 페이지 이동
      2. stock-header 영역 스크린샷 (각 BP)
      3. GF 스크린샷과 대조 — 치수/색상 비교
    Expected Result: 시각적 차이 ±2px 이내
    Evidence: docs/gf-shots/alpha-stockheader-<bp>.png
  ```

  **Commit**: YES
  - Message: `feat(finance): align stock-header to GF spec`
  - Files: `src/features/finance/components/stock-header.tsx`

---

- [x] 3. key-metrics 정합 (그리드 열수·간격·타이포)

  **What to do**:
  - `docs/gf-regions/metrics.md` 스펙 읽기
  - `alpha/src/features/finance/components/key-metrics.tsx` 수정:
    - 그리드 열수: 현재 `grid-cols-1 sm:2 lg:3` → GF 측정치 반영 (열 수 + 브레이크포인트)
    - 간격(gap): 현재 `gap-px`(셀 구분선 패턴) → GF 기준 gap 또는 border 값 조정
    - 셀 padding: 현재 `px-4 py-3` → GF 측정치 반영
    - 라벨: text-sm + muted-foreground 유지 or GF 매칭(font-size, color)
    - 값: text-sm font-medium tabular-nums → GF 매칭(weight 추가/제거)
    - 컨테이너: border/radius/padding GF 매칭
  - 3 BP 각각 alpha 스크린샷 저장

  **Must Not do**:
  - MetricItem 타입 변경 (label/value 구조 유지)
  - 모킹 데이터 개수 변경 (현재 9개 항목 — GF와 다를 수 있지만 UI 정합만)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 그리드 레이아웃 + 타이포 픽셀 정합
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO — T2 완료 후 순차
  - **Blocks**: T4
  - **Blocked By**: T2

  **References**:
  - Pattern: `key-metrics.tsx`(현재 14줄) — 간단한 grid 컴포넌트
  - API: `types.ts:MetricItem` — label, value 필드
  - 스펙: `docs/gf-regions/metrics.md`(T1 산출물)

  **Acceptance Criteria**:
  - [ ] 그리드 열수 GF와 일치 (각 BP별)
  - [ ] 셀 padding ±2px 이내
  - [ ] 라벨/값 font-size, weight 매칭
  - [ ] 3 BP 각각 alpha 스크린샷 저장

  **QA Scenarios**:
  ```
  Scenario: key-metrics 그리드 정합 확인
    Tool: Playwright MCP (alpha dev server)
    Steps:
      1. finance 페이지 → 핵심 지표 섹션 스크린샷 (≥1480 BP)
      2. 열 수 확인 (GF: N열 vs alpha: N열)
      3. 셀 간격 측정 (DevTools 또는 evaluate)
    Expected Result: 열수와 간격 GF와 일치
    Evidence: docs/gf-shots/alpha-key-metrics-<bp>.png
  ```

  **Commit**: YES
  - Message: `feat(finance): align key-metrics grid to GF spec`
  - Files: `src/features/finance/components/key-metrics.tsx`

---

- [x] 4. tabs 정합 (period + content 탭 외형)

  **What to do**:
  - `docs/gf-regions/tabs.md` 스펙 읽기
  - `alpha/src/features/finance/finance-view.tsx` 수정:
    - Period Tabs(ToggleGroup): 현재 shadcn ToggleGroup(outline variant, sm size) → GF 매칭
      - item padding: 현재 `px-3` → GF 측정치 반영
      - active state: GF의 선택 표시 방식(밑줄? 배경색?) 정합
      - gap/spacing: GF 기준 조정
    - Content Tabs(TabsList/TabsTrigger): 현재 shadcn TabsList → GF 매칭
      - trigger padding: GF 측정치 반영
      - active indicator: color(thickness), underline/bottom-border 정합
      - inactivate state: muted-foreground 유지 or GF 매칭
  - 3 BP 각각 alpha 스크린샷 저장

  **Must Not do**:
  - shadcn 컴포넌트 자체 수정(`ui/toggle-group.tsx`, `ui/tabs.tsx`) — className override로 해결
  - nuqs URL 상태 관리 로직 변경
  - 탭 라벨('개요', '재무', '실적') 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: shadcn 컴포넌트의 외형 커스터마이징 — Tailwind 클래스 오버라이드 중심
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO — T3 완료 후 순차
  - **Blocks**: T5
  - **Blocked By**: T3

  **References**:
  - Pattern: `finance-view.tsx`(현재 91줄) — ToggleGroup + Tabs 사용 부분만 수정
  - API: shadcn `ToggleGroupItem` variant/size prop, `TabsTrigger` active class
  - 스펙: `docs/gf-regions/tabs.md`(T1 산출물)

  **Acceptance Criteria**:
  - [ ] Period tabs: item padding, active state GF 매칭
  - [ ] Content tabs: trigger padding, active underline color/thickness 매칭
  - [ ] 3 BP 각각 alpha 스크린샷 저장

  **QA Scenarios**:
  ```
  Scenario: content tabs active 상태 정합 확인
    Tool: Playwright MCP (alpha dev server)
    Steps:
      1. finance 페이지 → '개요' 탭 선택 상태 스크린샷
      2. '재무' 탭 클릭 → active 이동 확인
      3. active indicator(밑줄/배경색) 색상 hex 측정
    Expected Result: GF와 동일한 active 표시 방식 + 색상 일치
    Evidence: docs/gf-shots/alpha-tabs-<bp>.png
  ```

  **Commit**: YES
  - Message: `feat(finance): align tabs styling to GF spec`
  - Files: `src/features/finance/finance-view.tsx`

---

- [x] 5. related / news / profile 정합

  **What to do**:
  - `docs/gf-regions/related.md`, `news.md`, `profile.md` 스펙 읽기
  - 세 컴포넌트 수정:
    
    **related-stocks.tsx**:
    - 카드 구조: 현재 carousel(basis 1/2 md:1/3 lg:1/4) → GF 레이아웃 매칭
    - 카드 내부: ticker, name, price, changePct — 타이포 정합
    - 컨테이너 gap/padding 조정
    
    **news-list.tsx**:
    - ItemGroup 패턴 유지 or GF card 기반으로 변경
    - title line-clamp(현재 2), source, time — 타이포 정합
    - 아이콘 사용 여부 GF 기준 확인 (newspaper icon 유지 or 제거)
    
    **company-profile.tsx**:
    - Collapsible 구조 유지 or GF와 다른 경우 조정
    - description preview(line-clamp-3) → GF line count 매칭
    - 확장 시 필드(CEO, employees, HQ, founded, website) 레이아웃 정합
    - section heading('프로필') font-size/weight 매칭
  
  - finance-view.tsx의 section spacing(`space-y-8`) 조정 (GF 기준)
  - 3 BP 각각 alpha 스크린샷 저장

  **Must Not do**:
  - RelatedStock, NewsItem, CompanyProfile 타입 변경 금지
  - 모킹 데이터 개수/내용 변경 금지
  - 새로운 컴포넌트 추가 금지 (기존 3개 수정만)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 3개 컴포넌트의 동시 픽셀 정합 — UI 일관성 확보가 핵심
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO — T4 완료 후 순차. but 세 컴포넌트는 한 태스크 내에서 병렬 작업 가능
  - **Blocks**: T6
  - **Blocked By**: T4

  **References**:
  - Pattern: 각 컴포넌트 파일 (related-stocks.tsx, news-list.tsx, company-profile.tsx)
  - API: `types.ts:RelatedStock`, `NewsItem`, `CompanyProfile`
  - 스펙: `docs/gf-regions/{related,news,profile}.md`(T1 산출물)

  **Acceptance Criteria**:
  - [ ] related-stocks: 카드 레이아웃 + 타이포 GF 매칭
  - [ ] news-list: item 구조 + 타이포 GF 매칭
  - [ ] company-profile: collapsible + 필드 레이아웃 GF 매칭
  - [ ] section 간격(space-y) GF 매칭
  - [ ] 3 BP 각각 alpha 스크린샷 저장

  **QA Scenarios**:
  ```
  Scenario: news-list 렌더링 정합 확인
    Tool: Playwright MCP (alpha dev server)
    Steps:
      1. finance 페이지 → 뉴스 섹션 스크린샷
      2. title line-clamp 확인(현재 2줄 — GF와 동일?)
      3. source/time font-size 측정
    Expected Result: GF와 동일한 item 구조 + 타이포 일치
    Evidence: docs/gf-shots/alpha-news-<bp>.png
  ```

  **Commit**: YES
  - Message: `feat(finance): align related/news/profile to GF spec`
  - Files: `src/features/finance/components/related-stocks.tsx`, `news-list.tsx`, `company-profile.tsx`, `finance-view.tsx`(spacing만)

---

- [x] 6. 차트 영역 — lightweight-charts 도입 결정

  **What to do**:
  - 현재 `price-chart.tsx` 분석 (Recharts 기반, 240px 고정 높이)
  - lightweight-charts vs Recharts 비교 테이블 작성:
    - 번들 크기, TypeScript 지원, 캔버스 성능, 테마 커스터마이징, 유지보수 상태(star count, release frequency)
    - GF 차트의 핵심 기능(그라데이션 fill, y-axis domain 자동, KRX 색상) 매핑 가능 여부
  - 결정 근거 문서화 → `docs/gf-regions/chart-decision.md` 저장
  - **도입 시**: price-chart.tsx rewrite, types.ts SeriesPoint 타입 확인
  - **유지 시**: Recharts 스타일만 GF 정합 (높이, 선 두께, 그라데이션)

  **Must Not do**:
  - 무작정 라이브러리 교체 — 비교 분석 후 결정
  - 차트 상호작용(zoom, pan, crosshair) 추가 — 정적 렌더링만
  - SeriesPoint 타입 변경 without 전체 영향도 분석

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 라이브러리 선택은 아키텍처 결정 — 기술적 트레이드오프 분석 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO — T5 완료 후 순차 (마지막 태스크)
  - **Blocks**: Final Verification
  - **Blocked By**: T5

  **References**:
  - Pattern: `price-chart.tsx`(현재 파일 — Recharts AreaChart 사용)
  - External: lightweight-charts 공식 문서, npm 번들 크기 비교
  - 스펙: `docs/gf-regions/chart.md`(T1 산출물 — 차트 영역 치수/색상)

  **Acceptance Criteria**:
  - [ ] `chart-decision.md` 저장 (비교 테이블 + 결정 근거 포함)
  - [ ] 결정된 방향대로 price-chart.tsx 수정 or 스타일 정합 완료
  - [ ] 차트 높이 GF 매칭 (±2px)
  - [ ] 선 색상(상승/하락) KRX 관례 유지 확인

  **QA Scenarios**:
  ```
  Scenario: 차트 렌더링 정상 확인
    Tool: Playwright MCP (alpha dev server)
    Steps:
      1. finance 페이지 → 차트 영역 스크린샷 (≥1480 BP)
      2. 차트 높이 측정 (GF와 ±2px 이내?)
      3. 상승/하락 색상 hex 확인 (#C0151D / #3364F0)
    Expected Result: 차트 치수+색상 GF 매칭, console error 없음
    Evidence: docs/gf-shots/alpha-chart-<bp>.png
  ```

  **Commit**: YES
  - Message: `feat(finance): chart library decision + implementation` or `docs(finance): chart library decision record`
  - Files: `src/features/finance/components/price-chart.tsx`, `docs/gf-regions/chart-decision.md`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 리뷰 에이전트 병렬 실행. ALL APPROVE 필요 → 사용자에게 결과 제시 후 명시적 "okay" 획득.

- [x] F1. **Plan Compliance Audit** — `oracle`
  이 계획서의 각 "Must Have" 구현 존재 여부 확인 (파일 읽기). 각 "Must NOT Have" 금지 패턴 코드베이스 검색. 산출물(docs/gf-regions/*.md, docs/gf-shots/*.png) 존재 확인.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  변경된 파일 전체 검토: `as any`/`@ts-ignore`, console.log, 사용하지 않는 import, AI slop(불필요한 주석, 과잉 추상화). shadcn 컴포넌트 직접 수정 여부 확인.
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Visual QA** — `unspecified-high` (+ `playwright` skill)
  alpha dev server 실행 → 모든 영역 스크린샷 캡처 → GF 기준과 대조. 3 BP 각각 확인. console error 체크.
  Output: `Regions [5/5 pass?] | Breakpoints [3/3] | Console [clean/issues] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  각 태스크 "What to do" vs 실제 git diff 비교. 스펙 이상 작업(scope creep) 또는 누락 확인. 금지 사항("Must Not") 준수 여부.
  Output: `Tasks [N/N compliant] | Creep [CLEAN/N issues] | VERDICT`

---

## Commit Strategy
각 영역별 개별 커밋:
- `feat(finance): align stock-header to GF spec` — stock-header.tsx
- `feat(finance): align key-metrics grid to GF spec` — key-metrics.tsx
- `feat(finance): align tabs styling to GF spec` — finance-view.tsx
- `feat(finance): align related/news/profile to GF spec` — related-stocks.tsx, news-list.tsx, company-profile.tsx
- `docs(finance): chart library decision record` — 차트 결정 문서

---

## Success Criteria

### 최종 체크리스트
- [x] 5개 영역 모두 이식 스펙(`docs/gf-regions/*.md`) 작성 완료
- [x] 캡처 PNG 각 BP별로 저장(`docs/gf-shots/`)
- [x] alpha dev server에서 시각적 정합 확인
- [x] 기존 기능(regression) 영향 없음
