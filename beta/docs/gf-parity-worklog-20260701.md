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
