# alpha — 작업 현황 및 로드맵

> 목적: **kiranism/next-shadcn-dashboard-starter**(Next 16·React 19·Tailwind v4·표준 new-york shadcn)를
> 새 베이스로 삼아, beta의 백엔드를 이식하고 **구글 파이낸스(finance.google.com) 종목 상세 UI**를 구현한다.
> beta 위에 얹기가 힘들어 깨끗한 새 출발로 전환한 결과물.
> 최종 갱신: 2026-06-26 · 기준 커밋 main

---

## 0. 한눈에 보기

| 영역 | 상태 |
|---|---|
| 스캐폴드(스타터) | ✅ Phase 0 |
| 인증(Better Auth+PGlite, Clerk 제거) | ✅ Phase 1 (런타임 검증) |
| 구글 파이낸스 UI 피처 | ✅ Phase 2 (런타임 검증) |
| 데이터/상태(서버컴포넌트+nuqs+실시간 시세) | ✅ Phase 3 |
| 실데이터 연결 | ❌ mock |
| 결제/조직 UI | ❌ 플레이스홀더 |
| 테스트 | ❌ 없음 |

**검증**: `npx tsc --noEmit` 0, `next build` 성공. 런타임 — `/api/auth/ok`=200, 회원가입 200(PGlite 저장),
무인증 `/dashboard/finance/...` → 307 가드, 쿠키 시 페이지 렌더, `/api/finance/quote/[symbol]` 틱 동작.

---

## 1. 완료된 작업

### Phase 0 — 스캐폴드
- `degit kiranism/next-shadcn-dashboard-starter` → alpha. dev 포트 3040, Windows용 dev 스크립트 정리.
- 표준 new-york shadcn(Radix) → beta의 base-nova 마찰(`render`/`data-active`) 없음. 합성은 `asChild`.

### Phase 1 — Clerk 제거 + Better Auth/PGlite 이식
- 스타터 postinstall이 코어(providers/proxy/user-nav)를 이미 Better Auth로 전환해 둬서 beta 백엔드가 맞물림.
- beta의 `src/db`(Drizzle+PGlite), `src/lib/{auth,auth-client,env,email,stripe,plans}`, `src/emails`,
  `/api/auth/[...all]` 이식. 나머지 Clerk 14파일 정리(로그인/회원가입 폼 재작성, profile/org-switcher/데모 플레이스홀더).
- `proxy.ts`(미들웨어) = Better Auth 세션 쿠키 가드(`/dashboard` 보호).

### Phase 2 — 구글 파이낸스 UI (`src/features/finance/`)
- 라우트 `/dashboard/finance/[symbol]`(서버 컴포넌트 + `getStockDetail` mock).
- StockHeader · PriceChart(recharts area) · KeyMetrics(grid) · RelatedStocks(Carousel) ·
  NewsList(Item) · CompanyProfile(Collapsible).
- 기간(ToggleGroup)·콘텐츠탭(Tabs) = **nuqs URL 상태**(parseAsStringEnum).
- 색상: **KRX 현지 — 상승 #C0151D(빨강)/하락 #3364F0(파랑)**. 사이드바 nav에 Finance 추가.

### Phase 3 — 데이터/상태
- 초기 데이터 = 서버 컴포넌트. 기간/탭 = nuqs URL 상태.
- **실시간 시세**: `/api/finance/quote/[symbol]`(mock 지터) + `useLiveQuote`(React Query, 5초 폴링,
  서버 렌더값으로 시드). StockHeader가 5초마다 갱신.

---

## 2. 실행
```bash
cd alpha
npm install
npm run dev        # 무설정 → PGlite 자동 + 테이블 생성 → http://localhost:3040
```
운영 전환: `.env.local`에 `DATABASE_URL`, `BETTER_AUTH_SECRET`. (Google/Resend/Stripe는 선택)

---

## 3. 앞으로 할 작업

### P0 — 실데이터
- [ ] mock(`getStockDetail`) → 실제 시세/지표/뉴스 소스 연동(서버 컴포넌트 + React Query)
- [ ] 종목 검색 → `/dashboard/finance/[symbol]` 라우팅, 사이드바 watchlist 실데이터

### P1 — 인증/결제 마감
- [ ] OTP/passkey 로그인 UI, 세션 기반 사이드바 유저영역
- [ ] Stripe 구독 UI(체크아웃/포털) — 플러그인은 준비됨
- [ ] Better Auth organizations로 workspaces/team/org-switcher 실연동(현재 플레이스홀더)

### P2 — 구글 파이낸스 패리티
- [ ] 가격 차트 크로스헤어/툴팁 강화(또는 lightweight-charts 도입), 전일 종가선
- [ ] 재무/실적 탭 실데이터, 핵심지표 항목 정합, 국제/현지 색상 토글

### P3 — 운영 준비
- [ ] PGlite는 개발 전용 → 운영 실 Postgres
- [ ] 미사용 데모(kanban/chat/products) 정리 여부 결정, 테스트/CI

---

## 4. 규칙 (표준 new-york shadcn)
- 합성 = `asChild`(Radix Slot). 토글/탭 활성 = 표준 `data-state`.
- 상태: 서버 컴포넌트 우선 → 클라 데이터는 React Query → URL 상태는 nuqs → Zustand는 필요 시.
- 색상: KRX 현지(상승 빨강/하락 파랑). `src/features/finance/lib/colors.ts`.
