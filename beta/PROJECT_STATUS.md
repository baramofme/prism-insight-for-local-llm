# beta — 작업 현황 및 로드맵

> 목적: prism-insight를 **로컬 LLM 친화 + Next.js 기반 `beta/`** 로 개조.
> react-starter-kit(kriasoft)의 백엔드 기능을 이식하고, Google Finance UI를 shadcn/ui로 재구성한다.
> 최종 갱신: 2026-06-25 · 기준 커밋 `ca946df`

---

## 0. 한눈에 보기

| 영역 | 상태 |
|---|---|
| 인증(Better Auth) | ✅ 이식 완료 (런타임 sign-up 검증됨) |
| DB(Drizzle + PGlite/Postgres) | ✅ 완료 (PGlite 부팅·마이그레이션·sign-up 저장 확인) |
| 이메일(React Email + Resend) | ✅ 완료 (미설정 시 콘솔 폴백) |
| 결제(Stripe 구독) | ✅ 배선 완료 / ⚠️ 키 없으면 비활성, UI 미구현 |
| shadcn UI 마이그레이션 | 🟡 핵심 완료 (Sidebar/Tabs/ToggleGroup/Item) |
| 실데이터 연결 | ❌ 대부분 mock |
| 인증 가드·세션 연동 | ❌ 미착수 |
| 테스트 | ❌ 없음 |

**검증**: `npx tsc --noEmit` 0 에러, `next build` 성공. 단 일부 클라이언트 인터랙션(콘텐츠 탭 전환)은 런타임 클릭 미검증(브라우저 락 + 클라이언트 마운트 뷰).

---

## 1. 완료된 작업 (이번 세션)

### 1-A. 백엔드 이식 (react-starter-kit → Next.js)

> react-starter-kit은 Cloudflare Workers + Hono + TanStack 기반. 백엔드 **라이브러리 계층**만 이식하고 마운트는 Next.js 방식으로 적응.

- **인증 — Better Auth** (`src/lib/auth.ts`, `src/lib/auth-client.ts`)
  - email/password, **email OTP**, **passkey(WebAuthn)**, **Google OAuth**, **organizations**(멤버/초대/역할) 플러그인
  - **Stripe 구독** 플러그인(starter/pro, 14일 트라이얼, org 빌링 authorizeReference)
  - `nextCookies()` 플러그인(서버 액션 쿠키)
  - 라우트: `src/app/api/auth/[...all]/route.ts` = `toNextJsHandler(auth)` (Node 런타임). Stripe 웹훅도 이 catch-all이 처리(`/api/auth/stripe/webhook`)
  - 로그인/회원가입 페이지를 Better Auth에 연결(`src/app/login`, `src/app/signup`) — email/password + Google
- **DB — Drizzle + Neon/PGlite** (`src/db/`)
  - 스키마 9테이블: user/session/identity/verification/organization/member/invitation/passkey/subscription, prefixed CUID2 ID(`usr_…`)
  - `src/db/index.ts` **분기형 백엔드**:
    - `DATABASE_URL` 있음 → postgres-js (Neon/실 Postgres) — **운영**
    - `DATABASE_URL` 없음 → **PGlite**(인프로세스 Postgres, `./.pglite` 파일) + 부팅 시 자동 마이그레이션 — **무설정 개발**
    - `next build` 중에는 PGlite 미생성(placeholder)
  - `drizzle.config.ts`, `drizzle/` 마이그레이션, npm 스크립트 `db:generate/migrate/push/studio`
- **이메일 — React Email + Resend** (`src/emails/`, `src/lib/email.ts`)
  - 템플릿: OTP / 이메일 검증 / 비밀번호 재설정 (+ BaseTemplate)
  - `RESEND_API_KEY` 미설정 시 콘솔 로그 폴백(개발 편의)
- **env**: `src/lib/env.ts`(빌드 안전 fallback), `.env.example`
- **런타임 검증됨**: `POST /api/auth/sign-up/email` → 200, user 테이블 저장 + prefixed ID 생성 확인

### 1-B. shadcn UI 마이그레이션 (Google Finance UI 재구성)

- shadcn 컴포넌트 **11종 추가**: sidebar, toggle-group, toggle, breadcrumb, carousel, resizable, item, empty, accordion, button-group, hover-card
- **대시보드 셸** (`src/app/dashboard/layout.tsx`): 수작업 사이드바(고정 aside + translate-x 슬라이드 + 오버레이 + 햄버거) → **shadcn `Sidebar`**(모바일 Sheet + 데스크톱 아이콘 collapse 자동)
- **기간 탭** ×2 (`main-content.tsx`): pill 버튼 → **`ToggleGroup`**(단일선택, 키보드/ARIA)
- **뉴스 목록**: 수작업 행 → **`Item`/`ItemGroup`**(media/title/description)
- **콘텐츠 탭(개요/실적/금융)**: 버튼 + `&&` 조건부 패널 → **`Tabs`(variant=line)** + `TabsContent`

### 1-C. Google Finance 문서 갱신 (3종)

`GOOGLE_FINANCE_{ELEMENTS_STYLES,GRANULAR_ELEMENTS,RESPONSIVE_DOCUMENTATION}.md` — 라이브 재조사로 **베타 레이아웃 기본 전환** 반영:
- 한국 현지 시장 색상: **상승=#C0151D(빨강) / 하락=#3364F0(파랑)** (구 문서의 국제 색상 정정)
- 타이포(종목명 20px/400 등), 기간탭 선택 radius 8px, 헤더 fixed·무border, ref ID 휘발성 등

### 1-D. 프로젝트 규칙 (중요 — 이 repo는 base-nova = Base UI 기반)

| 항목 | Radix(일반 shadcn) | **이 프로젝트(base-nova/Base UI)** |
|---|---|---|
| 합성 | `asChild` + child | **`render={<Link/>}`** prop |
| 토글 활성 셀렉터 | `data-state=on` | **`data-[pressed]:`** |
| 탭 활성 셀렉터 | `data-state=active` | **`data-active:`** |
| 밑줄 탭 | 커스텀 | **`<TabsList variant="line">`** (after: 언더라인) |

---

## 2. 실행 / 런타임 설정

```bash
cd beta
npm install
npm run dev        # 무설정 → PGlite 자동 기동 + 테이블 생성 → http://localhost:3039
```

운영/실 DB 전환 시 `.env.local`(.env.example 참고):
1. `DATABASE_URL`(Neon/Postgres), `BETTER_AUTH_SECRET`(`openssl rand -base64 32`)
2. `npm run db:push` (실 DB에 스키마 적용)
3. (선택) Google OAuth: redirect `http://localhost:3039/api/auth/callback/google`
4. (선택) `RESEND_API_KEY`, Stripe 4키 + 웹훅 `…/api/auth/stripe/webhook`

---

## 3. 앞으로 할 작업 (우선순위)

### P0 — 인증 실사용 연결
- [ ] **세션 가드/미들웨어**: 비로그인 시 `/dashboard/*` → `/login` 리다이렉트 (Next middleware 또는 layout 서버 체크)
- [ ] **세션 사용**: 대시보드 헤더/사이드바 유저 영역을 `authClient.useSession()` 실데이터로 (현재 "사용자/Free Plan" placeholder)
- [ ] **로그아웃** 버튼/액션 (`signOut`)
- [ ] **email OTP / passkey** 로그인 UI 추가 (현재 페이지는 email+pw, Google만)

### P1 — 데이터 연결 (mock → 실데이터)
- [ ] 사이드바 watchlist, 관련 주식, 뉴스, 핵심 지표 — 현재 하드코딩 → API/DB 연동
- [ ] 종목 차트 데이터 소스 연결 (차트 라이브러리는 lightweight-charts 유지)

### P1 — 결제(Stripe) UI
- [ ] 구독 체크아웃/관리(Customer Portal) 버튼, 현재 플랜 표시 (백엔드 플러그인은 준비됨)

### P2 — shadcn 마이그레이션 잔여 (선택 · 측면적)
- [ ] 관련 주식 → `Carousel` (현재 반응형 grid도 적절 — 취향)
- [ ] 빈 상태 → `Empty`, 종목 호버 → `HoverCard`
- [ ] 브레드크럼/차트는 **현행 유지 권장**(Breadcrumb는 의미상 부적합, 차트는 lightweight-charts가 우수)
- [ ] **콘텐츠 탭 전환 런타임 클릭 검증** (이번엔 브라우저 락으로 미수행 — tsc/build는 통과)

### P2 — Google Finance 패리티 (문서 비교표 기준)
- [ ] 핵심 지표 9개 → 15개 확장, 전일 종가 표시, 푸터 링크(AI 면책/도움말/약관 등)
- [ ] KRX 현지 시장 색상(상승=빨강/하락=파랑) 토글 — 현재 앱 watchlist는 녹/적 유지 중, 정책 통일 필요

### P3 — 운영 준비
- [ ] **PGlite는 개발 전용** → 운영은 반드시 실 Postgres(`DATABASE_URL`) (동시성·영속성)
- [ ] 테스트(인증 플로우 E2E, 컴포넌트), CI 빌드 게이트
- [ ] 시크릿 관리(.env.local 비커밋 — 현재 .env.example placeholder만)

---

## 4. 참고 / 결정 트레일
- 이식 원본: `github.com/kriasoft/react-starter-kit` (TanStack 기반, 백엔드만 이식)
- DB 드라이버: Better Auth가 트랜잭션을 쓰므로 Neon HTTP 대신 **postgres-js**(Node 런타임) 채택, 개발은 PGlite
- shadcn 스타일: `components.json` style = **base-nova** (Base UI). §1-D 규칙 준수
