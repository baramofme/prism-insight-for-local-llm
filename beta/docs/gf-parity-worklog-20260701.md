# GF 정합 작업 스펙 — 2026-07-01

> 목표: `beta/` 대시보드를 Google Finance 베타(`https://www.google.com/finance/beta`)와 시각·동작 정합
> 방법: Playwright MCP 로 GF 실측(getComputedStyle·snapshot·클릭 동작) → beta 코드에 반영
> 뷰포트 기준: 데스크톱 (research 패널 도킹 상태, `rightW > 0`)
> 관련 커밋: `5dc50c3` … `f7f62c9` (아래 각 항목에 명시)

---

## 0. 요약

| # | 요청 | 결과 | 커밋 |
|---|------|------|------|
| 테마 | 다크/라이트 | 설정 메뉴 토글(기기 기본/어두운/밝은) + 토큰 refactor, `dark` 클래스 실적용 | `8e80a0f` |
| 가격색 | 현지/국제 | `--gf-up`/`--gf-down` CSS 변수, 설정 메뉴 토글 | `bb181ed` |
| 1 | 차트 그라디언트 더 옅게 | fill `stopOpacity` 0.85→0.35→0 | `5dc50c3` |
| 2 | 서피스 배경 차등 | index-card `bg-muted/50 dark:bg-card` 등 서피스별 분리 | `5dc50c3` |
| 3 | 메인 콘텐츠 요소별 정합 | 종목 테이블 겹침 해결, 카드 클릭, 뉴스 링크 | `35e9404` 외 |
| 4 | 포트폴리오/관심종목 상세 | ₩ 총액, 차트 복구, 라벨, 탭 바, **통계 탭**, ⋮ 행 메뉴 | `afada8a`·`3aaaa29`·`4a63a71`·`f7f62c9` |
| 5 | 영역 배경 미세색 | 헤더 입력 bg, 상단 차트 bg, 버튼 강조색 토큰화 | `5dc50c3` |
| 후속 | 종목 상세 브레드크럼(직전 페이지) + 가운데 스크롤 | 관심목록→`홈`/홀딩→`포트폴리오`, `md:self-stretch` | `f882f2e` |
| 후속 | 자산 현황 시각화 이식 + 차트 GF화 | 트리맵 상시 노출·성과 온도 문단, 좌축·시간축·그리드·기준선 | `6b7fcc9` |
| 후속 | 수정 메뉴·툴바 칩 배경·브레드크럼 라벨 | 이름변경/투자수정/삭제, `bg-muted` 칩, `홈`→`포트폴리오` | `fd79e1e` |

> 상세: §5-5(브레드크럼·스크롤) / §5-6(시각화) / §5-7(차트) / §5-8(수정 메뉴) / §5-9(툴바·라벨)

---

## 1. 테마 (다크/라이트) — `8e80a0f`

- **설정 메뉴**(`finance-header.tsx`)에 GF 동일 옵션: `테마 = 기기 기본값 / 어두운 / 밝은`.
- `dashboard/page.tsx` 에 `theme`/`isDark` state + `useEffect` 로 `document.documentElement` 에 `dark` 클래스 토글 + `colorScheme` 설정.
- `globals.css` 의 `.dark` 커스텀 배리언트 토큰(shadcn) 활용. `#gf-root` 는 `bg-background text-foreground`.
- 색상 하드코딩 → 토큰(`var(--foreground)`, `var(--muted-foreground)`, `var(--border)`, `var(--muted)`, `bg-card`) 일괄 치환.

### ⚠️ 함정 (재발 방지)
- **lightweight-charts(canvas)는 CSS 변수·Tailwind 클래스를 색으로 못 읽는다.** `var(--gf-up)`, `hsl(var(--muted-foreground))`, `bg-purple-800` 을 차트 옵션에 넣으면 `Failed to parse color` → 차트 blank.
  - 차트 관련 색은 **반드시 concrete hex/rgb**. `mobile-portfolio-detail.tsx` 의 `textColor`/`portfolioColor`/`assetColorMap` 는 hex 유지.
- **Tailwind v4 는 `:root { --gf-up }` 같은 평범한 추가 변수를 emit 하지 않고 드롭한다.** → 가격색 변수는 `#gf-root` 에 **inline `style`** 로 정의(아래 §2).

---

## 2. 가격 색상 시스템 (현지/국제) — `bb181ed`

- 한국 관습: **현지(상승 red / 하락 blue)**, **국제(up green / down red)**.
- `dashboard/page.tsx` `#gf-root` inline style:
  ```tsx
  style={{
    ["--gf-up"]:   priceColor === "intl" ? "#0E9E4B" : "#FF4B4B",
    ["--gf-down"]: priceColor === "intl" ? "#FF4B4B" : "#1a73e8",
  }}
  ```
- 사용처: `text-[var(--gf-up)]` / `text-[var(--gf-down)]` (sparkline, 변동률, 화살표 등).
- 설정 메뉴 `가격 색상 = 현지 시장 / 국제`.

---

## 3. 차트 그라디언트 + 서피스 배경 — `5dc50c3`

- **그라디언트**: `overview/mini-chart.tsx` fill `stopOpacity` 0.85→0.45 였던 것을 **0.35→0** 으로. GF 처럼 위쪽만 옅게, 아래로 완전 투명.
- **서피스 차등**: `overview/index-card.tsx` 를 `bg-muted/50 dark:bg-card ... hover:bg-muted/80 dark:hover:bg-muted/40 border-transparent` — 회색 카드 서피스. 헤더 입력폼·툴팁(`bg-foreground text-background`)도 서피스별 분리.

---

## 4. 메인 콘텐츠 요소별 정합 (area 3)

### 4-1. 종목 테이블 겹침 해결 — `35e9404`
- 문제: `최다 거래/일 최대 상승/일 최대 하락` 테이블에서 회사명이 가격과 겹침(auto layout).
- 해결: `overview-content.tsx` `<table className="w-full table-fixed">` + `overview/stock-table-row.tsx`
  - 이름 셀 `flex items-center gap-1 min-w-0`, 티커 `Badge shrink-0`, 회사명 `truncate min-w-0`
  - 가격 `w-[74px]`, 변동 `w-[66px]`, 거래량 `w-[52px]`
- GF 행 포맷: `종목코드 + 회사명 + ₩가격 + 변동률%↑` (예: `001210 금호전기 ₩1,389.00 +18.31% ↑`).

### 4-2. 기타 배선
- `index-card.tsx` onClick → StockDetail 오픈(`overview-content.tsx` 가 `onStockClick` 전달).
- `news-item.tsx` Card 를 `<a href={news.google 검색} target="_blank">` 로 래핑.

---

## 5. 포트폴리오 상세 (area 4)

파일: `_components/portfolio/mobile-portfolio-detail.tsx`

### 5-1. 총액·차트·툴바 — `afada8a`
- 총액 `$` → `₩` (`₩19,653,380.00`, `+₩453,120.00`).
- drawing toolbar div `hidden` 처리(GF 미노출).
- **차트 blank 회귀 복구**: 차트 색을 concrete hex 로 되돌림 (`textColor: '#6b7280'`, `portfolioColor: '#1a73e8'`, `assetColorMap` hex). §1 함정 참조.

### 5-2. 라벨 — `3aaaa29`
- 하단 탭 `구성` → `투자`, 홀딩 테이블 th `종목` → `종목 코드`, `투자중` 제목 옆 `[수정]` 버튼.

### 5-3. 데스크톱 중복 탭 바 제거 — `4a63a71`
- 데스크톱(research 패널 도킹, `rightW > 0`)에서는 상세 탭 바에 `포트폴리오` 단독 탭만 남아 무의미 → GF 엔 없음.
- 조건을 **`vp >= MOBILE && rightW <= 0`** 로 좁혀, `조사` 탭이 필요한 좁은 폭에서만 탭 바 표시.
- 데스크톱은 브레드크럼(`← 홈 | 투자중`)만 노출.

### 5-4. 통계 탭 + ⋮ 행 메뉴 — `f7f62c9` (GF 실측)

**GF 실측 결과**:
- 서브탭 = **`투자` / `통계`(신규 배지)** 2개뿐. (beta 의 구 `활동`·`뉴스 및 이벤트` 는 GF 에 없음 → 제거)
- 홀딩 행 우측 액션 = **⋮ (more_vert)** — 🗑 아님.
- 상단 툴바 = `[✎ 수정]` + `[영역 ▾][비교 ▾]`.

**통계 탭 구현** (`bottomTab === "통계"`):
- 데이터는 포트폴리오 자체 holdings/`totalAmount` 에서 파생.
- **자산 배분**: 섹터 집계 도넛(SVG, `stroke-dasharray`) + 범례 + 구성 설명 + 후속 질문 칩 2개.
  - 섹터 매핑(모듈 상수 `SECTOR_MAP`, 알려진 종목만; 나머지 `기타`):
    `005930/000660/009150 → IT/반도체`, `006800 → 금융`, `329180 → 건설`, `005380 → 자동차`.
  - 섹터 색(`SECTOR_COLOR`, GF 팔레트): IT/반도체 `#34a853`, 건설 `#4285f4`, 자동차 `#b0511f`, 금융 `#ea4335`, 기타 `#9aa0a6`.
- **집중 위험**: 종목별 비중 가로 바(`#4285f4`) + 상위 2종목 비중 경고 문구.
- `통계` 탭 라벨에 `신규` 배지.

**⋮ 행 메뉴**:
- `rowMenu: string | null` state. 🗑 emoji → `<MoreVertical>` 아이콘 버튼(`aria-label={\`${name} 옵션\`}`).
- 클릭 시 `삭제`(`<Trash2>`) 드롭다운. `handleDeleteAsset` 연결.

**제거된 것**: `활동`/`뉴스 및 이벤트` 렌더 블록 + 미사용 `filteredSources` state (git 히스토리에 보존).

---

## 5-5. 종목 상세 브레드크럼(진입 경로별) + 가운데 페이지 스크롤

파일: `page.tsx`, `_components/stock/stock-detail.tsx`, `_components/portfolio/mobile-portfolio-detail.tsx`

### 브레드크럼 = 직전 페이지 (GF 실측)
- GF: 관심목록 종목 진입 → `← 홈 | 329180:KRX`, 포트폴리오 홀딩 진입 → `← 포트폴리오 | 329180:KRX`.
- beta 버그: 라벨이 `포트폴리오` 하드코딩 + 뒤로가기 항상 포트폴리오행 → 관심목록 진입도 `포트폴리오` 로 표시.
- 수정:
  - `page.tsx` 에 `stockOrigin: "home" | "portfolio"` state. `handleStockClick(stock, origin = "home")`.
  - 좌측 nav 관심목록·업종·홈 콘텐츠·헤더 검색 클릭 = origin `home` (기본) → `홈`.
  - 포트폴리오 상세 홀딩 **이름 클릭** = origin `portfolio` → `포트폴리오` (`onStockClick(asset, "portfolio")`, `stopPropagation` 으로 행 확장 토글과 분리).
  - `StockDetail` 에 `backLabel?: string` prop (기본 `홈`). 브레드크럼·`onBack` 이 origin 따라 분기(`포트폴리오`→포트폴리오 뷰, 그 외→홈).

### 가운데 페이지 스크롤 (근본 원인)
- 증상: 종목 상세/포트폴리오 상세 진입 시 가운데가 스크롤 안 됨. `#gf-main` 높이가 뷰포트를 초과(1966px)해도 클립/스크롤 안 됨.
- 원인: 상단 flex row(`page.tsx`)가 WIDE 에서 `items-start`(= `align-items: flex-start`) → 자식 컬럼이 **stretch 안 되고 콘텐츠 높이**를 가짐. 그래서 자식 내부 `overflow-y-auto` 가 클립할 대상이 없음.
- **홈 브랜치엔 `md:self-stretch` 가 있었지만 portfolio/stockDetail 브랜치엔 없었음** → 홈만 스크롤됐던 이유.
- 수정: portfolio(`mobileView==="portfolio"`)·stockDetail 래퍼 div 에 `md:self-stretch` 추가 → 컬럼이 뷰포트 높이로 clamp, 내부 스크롤 정상.
- 검증: `#gf-main` 1966→1232px, 스크롤러 `clientH(1179) < scrollH(1913)` → `canScroll=true`.

## 5-6. 자산 현황 시각화(투자 성과 트리맵) 이식 — 커밋 `6b7fcc9`

파일: `_components/portfolio/mobile-portfolio-detail.tsx`

- 완성돼 있으나 **onClick 없는 죽은 `시각화` 토글**(`showViz`) 뒤에 숨어 도달 불가였던 `VizTreemap` 을 투자 탭 하단 상시 섹션으로 이식.
- **투자 탭 전용**: `{bottomTab === "투자" && (...)}` 로 게이팅(홀딩 테이블 아래). 통계 탭에선 미표시(검증됨). 죽은 토글 버튼·`showViz` state 제거.
- **GF 실측 문구 반영**(사용자가 GF DOM 제공): 제목 **`자산 현황 시각화`**, 부제 **`상자 크기는 포트폴리오 내 자산의 비중을 나타냅니다. 색상은 오늘의 실적을 나타냅니다.`**
- **`오늘의 성과 온도` 인사이트 문단 + 후속 질문 칩 2개** 추가 — 포트폴리오 실데이터에서 파생(전체 일일손익 방향=상승/하락·뜨거운/차가운, 최대 비중 종목, 최고/최저 등락 종목). 칩은 좁은 폭에서 조사 탭으로 전환.
- 트리맵 색은 기존 heatmap(파랑 하락 ~ 빨강 상승, 현지 시장 관습)·`dailyProfitPercent` 기반 유지.

## 5-7. 차트 영역 GF 유사화 — 커밋 `6b7fcc9`

**포트폴리오 차트**(`PortfolioChart`, lightweight-charts):
- **좌측 값 축**(GF와 동일, `leftPriceScale` + 시리즈 `priceScaleId:'left'`, `rightPriceScale` 숨김), **하단 시간축**(`timeScale.visible`), **옅은 수평 그리드만**(`horzLines` `rgba(128,128,128,0.12)`), **더 옅은 영역 fill**(`topColor` alpha `0x61`→`0x26`).
- ⚠️ `borderColor:'var(--border)'`(canvas 파싱 불가 CSS 변수) → concrete grey 로 교체(§1 footgun).

**종목 차트**(`renderChart`, 손수 만든 SVG):
- 공유 지오메트리 `chartGeo` 도입(플롯·그리드·기준선·라벨 정렬). area/line 에 **옅은 그리드 + 온캔버스 전일종가 점선 기준선 + 더 옅은 fill**.
- ⚠️ SVG 가 `preserveAspectRatio="none"` 로 stretch → **텍스트 왜곡**. 축 라벨은 **HTML 오버레이**로: 좌측 `₩` 가격축(그리드 정렬), 전일종가 라벨(기준선 위), 하단 시간축. 수평선/점선은 왜곡 없어 SVG 유지.

## 5-8. 포트폴리오 수정 메뉴(GF 3항목) — 커밋 `fd79e1e`

- GF 실측: `수정` = 드롭다운 3항목 `포트폴리오 이름 바꾸기` / `투자 수정` / `포트폴리오 삭제`.
- 구현: `editMenuOpen` 드롭다운 + `portfolioName` state.
  - **이름 바꾸기** → 모달(Input + 저장/Enter) → `portfolioName` 갱신 → 제목·브레드크럼 즉시 반영(검증: `투자중`→`성장주 포트폴리오`).
  - **투자 수정** → 매매(+투자) 모달 오픈.
  - **삭제** → `window.confirm` → `onBack()`.

## 5-9. 차트 툴바 칩 배경 + 브레드크럼 라벨 — 커밋 `fd79e1e`

- **툴바 버튼 배경**(사용자 요청 "finance.google.com 처럼 배경색"): 포트폴리오 `비교`/`영역`, 종목 `영역·선형`/`금융 기관과 비교`/`기술 지표 선택` 을 투명 outline → **옅은 채운 칩(`bg-muted` borderless)**. (GF 원본은 투명+호버 배경이나 사용자 요청대로 상시 배경 부여.)
- **포트폴리오 상세 브레드크럼 라벨**: `← 홈 | 투자중` → **`← 포트폴리오 | 투자중`** (사용자 지정, GF 원본 `홈` 오버라이드).

---

## 6. 로컬 서브에이전트(토큰 절감) MCP

- `~/.claude/local-llm-mcp/server.py` — FastMCP stdio 서버. OpenAI 호환 `/v1/chat/completions` 로 로컬 모델 오프로드.
  - `ask_dense` → `http://pg4-ubuntu:8081/v1` (Dense)
  - `ask_moe` → `http://pg4-ubuntu:8082/v1` (Moe)
- 실행: `uv run --no-project --with "mcp[cli]" --with httpx python server.py` (`.mcp.json` 의 `local-llm` 서버).
- 워크플로: 메인(Anthropic)이 GF 실측·파일 읽기·편집을 하고, **분석/생성만** 로컬 모델에 오프로드(로컬은 파일 접근 없음, self-contained 프롬프트 필요).

---

## 7. 재현·검증 방법

1. `cd beta && npm run dev` (PGlite 로컬 DB — `.env.local` 의 `DATABASE_URL` 주석 처리 상태, `033ce4a`).
2. Playwright MCP: `browser_navigate http://localhost:3039/dashboard`.
3. `투자중` 포트폴리오 클릭 → 상세.
4. 검증 포인트:
   - 데스크톱: 상단 브레드크럼만(`포트폴리오` 탭 바 없음).
   - 하단 탭 `투자 / 통계[신규]`. `통계` → 자산 배분 도넛 + 집중 위험 바.
   - `투자` 탭 각 행 우측 ⋮ → `삭제` 드롭다운.
   - 콘솔 에러 0 (`browser_console_messages onlyErrors`).

> ⚠️ GF 포트폴리오 실측은 Google 로그인 필요(세션: baram204@gmail.com). 미로그인 시 §5-4 실측값은 본 문서 참조.
