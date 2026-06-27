# Clerk → Better Auth 참조 정리

## TL;DR

> **Quick Summary**: Clerk에서 Better Auth로 마이그레이션된 프로젝트에서 남아있는 모든 Clerk 참조(env 변수, next.config, about/privacy 페이지, infoconfig 문서 문자열, 주석)를 일괄 정리
>
> **Deliverables**:
> - `.env.local`에서 빈 Clerk env 변수 2개 제거
> - `next.config.ts`에서 Clerk CDN 이미지 호스트 패턴 제거
> - `about/page.tsx` "Authentication by Clerk" → Better Auth 텍스트 변경
> - `privacy-policy/page.tsx` Clerk 참조 → Better Auth 텍스트 변경
> - `infoconfig.ts`에서 Clerk Organizations/Billing 문서 문자열 → Better Auth 대체
> - `use-nav.ts` JSDoc 주석 Clerk 참조 제거
>
> **Estimated Effort**: Quick (모든 변경이 텍스트/문자열 수정)
> **Parallel Execution**: YES — 3개 그룹 병렬 가능
> **Critical Path**: 없음 (모든 변경 독립적)

---

## Context

### Original Request
Priority 2 GF 포팅 작업 중 Clerk에서 Better Auth로 마이그레이션된 사실 발견. 남아있는 Clerk 참조를 모두 정리하여 코드베이스 일관성 확보.

### Current State Analysis
- **npm 패키지**: Clerk 패키지 없음 (`@clerk/*` 미존재) → migration 완료
- **Better Auth**: `better-auth`, `@better-auth/passkey`, `@better-auth/stripe` 설치 완료
- **실제 인증**: `src/lib/auth.ts`, `auth-client.ts`에서 Better Auth 설정 완료
- **Header**: Clerk import 없음 (이미 정리됨)
- **Sign-in/Sign-up**: Better Auth 페이지 정상 작동 (QA 검증 완료)

### Remaining Clerk References

| # | 파일 | 라인 | 내용 | 심각도 | 그룹 |
|---|------|------|------|--------|------|
| 1 | `.env.local` | 3-4 | 빈 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | HIGH | A |
| 2 | `next.config.ts` | 14-23 | `img.clerk.com`, `clerk.com` remotePatterns | MED | A |
| 3 | `Dockerfile` | 36-38 | Clerk ARG (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `SIGN_IN_URL`, `SIGN_UP_URL`) | MED | A |
| 4 | `Dockerfile.bun` | 31-33 | Clerk ARG (동일) | MED | A |
| 5 | `env.example.txt` | 1-43 | Clerk 전체 env 섹션 (API key, redirect URL, Organizations, webhooks) | MED | A |
| 6 | `about/page.tsx` | 43-56 | "Authentication by Clerk" 섹션 전체 | HIGH (사용자 노출) | B |
| 7 | `privacy-policy/page.tsx` | 39-63 | Clerk 인증 설명 + clerk.com 링크 | HIGH (사용자 노출) | B |
| 8 | `infoconfig.ts` | 9, 12-13, 43, 46-47, 60, 63-64, 77, 80-81, 112, 115-116, 123, 126-127, 134, 146, 152, 163 | Clerk Organizations/Billing 문서 문자열 | MED (워크스루 문서) | C |
| 9 | `use-nav.ts` | 6 | "This hook uses Clerk's client-side hooks" JSDoc | LOW (주석) | C |
| 10 | `docs/clerk_setup.md` | 전체 파일 | Clerk Organizations/Billing 설정 가이드 (~80줄) | MED | C |
| 11 | `docs/nav-rbac.md` | 7, 19, 79 | "Clerk's hooks", "useOrganization()" 등 | LOW | C |
| 12 | `CLAUDE.md` | 10-11 | clerk_setup.md 및 nav-rbac.md 참조 링크 | LOW | C |
| 13 | `AGENTS.md` | ~17군데 | 기술 스택, env 예시, auth 패턴, Docker 설정 등 | LOW (AI 참조 문서) | C |
| 14 | `README.md` | 여러 곳 | Tech Stack "Auth - Clerk", Pages 설명 | MED | C |

---

## Work Objectives

### Core Objective
코드베이스에서 모든 Clerk 참조를 제거하고 Better Auth로 일관성 있게 대체

### Concrete Deliverables
- 14개 파일의 Clerk 참조 일괄 정리
- 사용자-facing 텍스트 (about, privacy-policy) 정확한 문구로 대체
- Dockerfile/설정 파일 Clerk ARG/env 제거
- 문서 파일 (docs, AGENTS.md, README.md) Clerk 참조 정리

### Definition of Done
- `grep -rn 'clerk|Clerk|CLERK' src/ --include='*.{ts,tsx}'` 결과 0건 (env 파일 제외)
- `.env.local`에 Clerk 변수 없음
- `bun run build` 통과
- `bun test` 통과

### Must Have
- 모든 Clerk npm 패키지 참조 제거 확인 (이미 완료)
- 사용자-facing 페이지 (about, privacy) Clerk 텍스트 → Better Auth로 변경
- 빈 Clerk env 변수 제거
- next.config 불필요 호스트 패턴 제거

### Must NOT Have
- Better Auth 관련 코드 수정 (정상 작동중)
- 실제 인증 로직 변경
- env.example.txt 등 템플릿 파일 수정 (템플릿 원본)

---

## Verification Strategy

### Test Decision
- **Automated tests**: None (환경/문서 변경만 있음)
- **Build verification**: `bun run build` 통과 확인
- **QA**: grep으로 Clerk 참조 완전 제거 확인

### QA Policy
모든 변경 후 grep 검증으로 완전 제거 확인.

---

## Execution Strategy

### Parallel Groups

```
Group A (env + config — 독립적):
├── T1: .env.local — 빈 Clerk 변수 제거
├── T2: next.config.ts — Clerk 이미지 호스트 제거

Group B (user-facing pages — 독립적):
├── T3: about/page.tsx — "Authentication by Clerk" → Better Auth
├── T4: privacy-policy/page.tsx — Clerk 참조 → Better Auth

Group C (internal docs — 독립적):
├── T5: infoconfig.ts — Clerk Organizations/Billing 문서 문자열 대체
├── T6: use-nav.ts — JSDoc 주석 Clerk 참조 제거

Wave FINAL (검증):
├── T7: grep 검증 + build 확인
```

---

## TODOs

- [x] 1. `.env.local` — 빈 Clerk env 변수 제거 ✅ VERIFIED (grep clean)

  **What to do**:
  - `.env.local`에서 line 3 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""` 제거
  - `.env.local`에서 line 4 `CLERK_SECRET_KEY=""` 제거 (원래 line 3 제거 후 line 3이 됨)
  - 결과: 2줄 파일로 축소 (DATABASE_URL, NEXTAUTH_SECRET만 남음)

  **Must NOT do**:
  - `env.example.txt` 등 템플릿 파일 수정 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group A (with Task 2)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `.env.local`에 Clerk 변수 없음 확인

  **QA Scenarios**:
  ```
  Scenario: Clerk env 변수 제거 확인
    Tool: Bash
    Steps:
      1. grep -n 'CLERK' .env.local
    Expected Result: 출력 없음 (0 lines)
    Evidence: .sisyphus/evidence/clerk-cleanup/env-clean.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/clerk-cleanup/env-clean.txt`
  **Commit**: YES
  - Message: `chore: remove empty Clerk env variables`
  - Files: `.env.local`

---

- [x] 2. `next.config.ts` — Clerk 이미지 호스트 패턴 제거 ✅ VERIFIED (grep clean)

  **What to do**:
  - `next.config.ts`에서 lines 14-23 (`img.clerk.com`, `clerk.com` remotePatterns) 제거
  - `api.slingacademy.com`는 유지 (다른 용도)

  **Must NOT do**:
  - `api.slingacademy.com` 호스트 패턴 유지
  - Sentry 설정 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group A (with Task 1)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `next.config.ts`에 `clerk.com` 문자열 없음 확인
  - [ ] `api.slingacademy.com`는 남아있음 확인

  **QA Scenarios**:
  ```
  Scenario: Clerk 이미지 호스트 제거 확인
    Tool: Bash
    Steps:
      1. grep -n 'clerk' next.config.ts
    Expected Result: 출력 없음 (0 lines)
    
  Scenario: 다른 호스트 유지 확인
    Tool: Bash
    Steps:
      1. grep -n 'slingacademy' next.config.ts
    Expected Result: 1 line 출력 (api.slingacademy.com 유지)
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/clerk-cleanup/next-config-clean.txt`
  **Commit**: YES (with Task 1)
  - Message: `chore: remove empty Clerk env variables`
  - Files: `next.config.ts`

---

- [x] 3. `about/page.tsx` — "Authentication by Clerk" → Better Auth ✅ VERIFIED (grep clean)

  **What to do**:
  - Section heading: `Authentication by Clerk` → `Authentication`
  - 본문 텍스트: Clerk 설명 → Better Auth + PRISM 문맥에 맞는 설명으로 변경
  - `clerk.com` 링크 제거 (또는 Better Auth GitHub/docs 링크로 대체)
  - clerk.com 관련 텍스트 제거

  **변경 예시**:
  ```tsx
  // 변경 전
  <h2 className='...'>Authentication by Clerk</h2>
  <p>Authentication for this application is securely handled by{' '}
    <a href='https://clerk.com' ...>Clerk</a>, a modern authentication...</p>
  
  // 변경 후  
  <h2 className='...'>Authentication</h2>
  <p>Authentication for this application is securely handled by{' '}
    <a href='https://better-auth.com' ...>Better Auth</a>, a modern authentication...</p>
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group B (with Task 4)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `about/page.tsx`에 `Clerk` 또는 `clerk.com` 문자열 없음
  - [ ] `bun run build` 통과

  **QA Scenarios**:
  ```
  Scenario: Clerk 참조 제거 확인
    Tool: Bash
    Steps:
      1. grep -n 'Clerk\|clerk' src/app/about/page.tsx
    Expected Result: 출력 없음 (0 lines)
    
  Scenario: Build 통과 확인
    Tool: Bash
    Steps:
      1. cd alpha && bun run build 2>&1 | tail -5
    Expected Result: Build successful
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/clerk-cleanup/about-page-clean.txt`
  **Commit**: YES (with Task 4)
  - Message: `fix: update Clerk references to Better Auth in about and privacy pages`
  - Files: `src/app/about/page.tsx`, `src/app/privacy-policy/page.tsx`

---

- [x] 4. `privacy-policy/page.tsx` — Clerk 참조 → Better Auth ✅ VERIFIED (grep clean)

  **What to do**:
  - Section heading: `Authentication by Clerk` → `Authentication`
  - 본문: "Our application uses Clerk" → "Our application uses Better Auth"
  - 모든 `clerk.com` 링크 제거 또는 Better Auth 적절한 링크로 대체
  - "managed by Clerk" → "managed by Better Auth"
  - Clerk Privacy Policy 링크 → Better Auth Privacy Policy 또는 제거
  - line 39 주석 `{/* Auth handled by Clerk */}` → `{/* Auth handled by Better Auth */}`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group B (with Task 3)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `privacy-policy/page.tsx`에 `Clerk` 또는 `clerk.com` 문자열 없음
  - [ ] `bun run build` 통과

  **QA Scenarios**:
  ```
  Scenario: Clerk 참조 제거 확인
    Tool: Bash
    Steps:
      1. grep -n 'Clerk\|clerk' src/app/privacy-policy/page.tsx
    Expected Result: 출력 없음 (0 lines)
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/clerk-cleanup/privacy-page-clean.txt`
  **Commit**: YES (with Task 3)

---

- [x] 5. `infoconfig.ts` — Clerk Organizations/Billing 문서 문자열 대체 ✅ VERIFIED

  **What to do**:
  - `workspacesInfoContent` (3개 Clerk 참조):
    - "powered by Clerk Organizations" → "powered by Better Auth Organizations"
    - `Clerk Organizations Documentation` 링크 → `Better Auth Documentation` 적절한 링크로
    - `Multi-tenant Authentication Guide` → 적절한 Better Auth 가이드 링크로
    - "Clerk's recommended patterns" → "Better Auth recommended patterns"
  
  - `teamInfoContent` (3개 Clerk 참조):
    - "Clerk's OrganizationProfile component" → "Better Auth organization management"
    - `Clerk Organizations Documentation` 링크 → Better Auth 링크로
    - "Clerk Dashboard under Organizations" → "Better Auth admin dashboard"
  
  - `billingInfoContent` (9개 Clerk 참조):
    - "Clerk Billing for B2B" → "Better Auth with Stripe integration"
    - 모든 "Clerk Dashboard" → "admin dashboard" (또는 적절한 표현)
    - "Clerk Billing costs 0.7%" → 해당 내용 contextual하게 유지 또는 제거
    - "clerk-js package" → "better-auth package"
    - 모든 clerk.com/dashboard 링크 → 제거 또는 대체

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group C (with Task 6)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `infoconfig.ts`에 `Clerk` 또는 `clerk` 문자열 없음
  - [ ] `bun run build` 통과 (타입 체크)
  - [ ] 모든 InfoSidebar 콘텐츠가 문맥상 자연스러움

  **QA Scenarios**:
  ```
  Scenario: Clerk 참조 제거 확인
    Tool: Bash
    Steps:
      1. grep -n 'Clerk\|clerk' src/config/infoconfig.ts
    Expected Result: 출력 없음 (0 lines)
    
  Scenario: TypeScript 컴파일 확인
    Tool: Bash
    Steps:
      1. cd alpha && npx tsc --noEmit 2>&1 | head -5
    Expected Result: No errors (0 출력)
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/clerk-cleanup/infoconfig-clean.txt`
  **Commit**: YES
  - Message: `docs: replace Clerk references with Better Auth in infoconfig`
  - Files: `src/config/infoconfig.ts`

---

- [x] 6. `use-nav.ts` — JSDoc 주석 Clerk 참조 제거 ✅ VERIFIED

  **What to do**:
  - line 6: "This hook uses Clerk's client-side hooks to check permissions..." → "This hook uses Better Auth's client-side hooks to check permissions..."

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group C (with Task 5)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `use-nav.ts`에 `Clerk` 문자열 없음
  - [ ] `bun run build` 통과

  **QA Scenarios**:
  ```
  Scenario: Clerk 참조 제거 확인
    Tool: Bash
    Steps:
      1. grep -n 'Clerk' src/hooks/use-nav.ts
    Expected Result: 출력 없음 (0 lines)
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/clerk-cleanup/use-nav-clean.txt`
  **Commit**: YES
  - Message: `docs: update Clerk mention to Better Auth in use-nav JSDoc`
  - Files: `src/hooks/use-nav.ts`

---

- [x] 7. `Dockerfile` + `Dockerfile.bun` — Clerk ARG 제거 ✅ VERIFIED (grep clean)

  **What to do**:
  - `Dockerfile` lines 36-38: `ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` 제거
  - `Dockerfile.bun` lines 31-33: 동일하게 제거
  - 각 Dockerfile의 `--build-arg` 참조도 함께 제거

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group A (with Tasks 1-2)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `Dockerfile`에 `CLERK` 문자열 없음
  - [ ] `Dockerfile.bun`에 `CLERK` 문자열 없음

  **Commit**: YES (with Tasks 1-2)
  - Message: `chore: remove empty Clerk env variables`
  - Files: `Dockerfile`, `Dockerfile.bun`

---

- [x] 8. `env.example.txt` — Clerk env 섹션 제거 ✅ VERIFIED (grep clean)

  **What to do**:
  - `env.example.txt`에서 lines 1-43 (Clerk 환경변수 전체 섹션) 제거
  - Better Auth 관련 env vars (97-112줄)가 이미 존재하므로 그대로 유지

  **Must NOT do**:
  - Better Auth env vars 삭제 금지
  - 실제 `.env.local`이 아닌 `env.example.txt`만 수정

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group A (with Tasks 1-2, 7)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `env.example.txt`에 `CLERK` 또는 `clerk` 문자열 없음 (Better Auth env 제외)

  **Commit**: YES (with Tasks 1-2, 7)

---

- [x] 9. `docs/clerk_setup.md` — 파일 삭제 또는 Better Auth 가이드로 대체 ✅ DELETED

  **What to do**:
  - `docs/clerk_setup.md`는 Clerk Organizations/Billing 설정 가이드 (~80줄)
  - Better Auth equivalent가 없으므로 파일 삭제하거나, `docs/better-auth-setup.md`로 대체
  - `CLAUDE.md`와 `AGENTS.md`에서 참조 링크도 함께 업데이트 필요

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group C (with Task 10)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `docs/clerk_setup.md` 삭제 또는 내용에서 Clerk 문자열 제거
  - [ ] 참조하는 파일의 링크도 함께 업데이트

  **Commit**: YES (with Task 10)
  - Message: `docs: remove Clerk setup guide and update nav-rbac references`
  - Files: `docs/clerk_setup.md`, `docs/nav-rbac.md`

---

- [x] 10. `docs/nav-rbac.md` — Clerk 참조 문구 수정 ✅ VERIFIED (grep clean)

  **What to do**:
  - line 7: "Clerk's hooks" → "Better Auth hooks"
  - line 19: "useOrganization()" → contextually appropriate
  - line 79: Clerk 참조 제거

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group C (with Task 9)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `docs/nav-rbac.md`에 `Clerk` 문자열 없음

  **Commit**: YES (with Task 9)

---

- [x] 11. `CLAUDE.md` — Clerk 참조 링크 수정 ✅ VERIFIED (grep clean)

  **What to do**:
  - lines 10-11: `clerk_setup.md` 및 `nav-rbac.md` 참조 링크 업데이트 (또는 제거)

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group C (with Tasks 12-13)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `CLAUDE.md`에 `Clerk` 또는 `clerk` 문자열 없음

  **Commit**: YES (with Tasks 12-13)
  - Message: `docs: remove Clerk references from project documentation`
  - Files: `CLAUDE.md`, `AGENTS.md`, `README.md`

---

- [x] 12. `AGENTS.md` — 17개 Clerk 참조 일괄 수정 ✅ VERIFIED (grep clean)

  **What to do**:
  - 기술 스택 설명: "Clerk" → "Better Auth"
  - env 예시: Clerk env vars → Better Auth 설명으로 대체
  - auth 패턴: Clerk `auth()`, `<Protect>`, `has()` → Better Auth equivalent
  - Docker 이미지 설정: Clerk ARG 관련 설명 제거
  - 외부 문서 링크: "Clerk Next.js SDK" → "Better Auth Next.js"

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group C (with Tasks 11, 13)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `AGENTS.md`에 `Clerk` 또는 `clerk` 문자열 없음

  **Commit**: YES (with Tasks 11, 13)

---

- [x] 13. `README.md` — Clerk 참조 문구 수정 ✅ VERIFIED (grep clean)

  **What to do**:
  - Tech Stack 섹션: "Clerk" → "Better Auth"
  - Pages 설명: Clerk 관련 페이지 문구 업데이트
  - Docker 빌드 예시: Clerk ARG 환경변수 예시 제거
  - `go.clerk.com` 스폰서 링크 → GitHub 링크 또는 제거

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Group C (with Tasks 11-12)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `README.md`에 `Clerk` 또는 `clerk` 문자열 없음

  **Commit**: YES (with Tasks 11-12)

---

## Execution Strategy (Updated)

### Parallel Groups

```
Group A (env/config/build — 독립적):
├── T1: .env.local — 빈 Clerk 변수 제거
├── T2: next.config.ts — Clerk 이미지 호스트 제거
├── T7: Dockerfiles — Clerk ARG 제거
└── T8: env.example.txt — Clerk env 섹션 제거

Group B (user-facing pages — 독립적):
├── T3: about/page.tsx — "Authentication by Clerk" → Better Auth
└── T4: privacy-policy/page.tsx — Clerk 참조 → Better Auth

Group C (internal/docs — 독립적):
├── T5: infoconfig.ts — Clerk Organizations/Billing 문서 대체
├── T6: use-nav.ts — JSDoc 주석 수정
├── T9-T10: docs/ — clerk_setup 삭제, nav-rbac 수정
└── T11-T13: CLAUDE/AGENTS/README — 프로젝트 문서 Clerk 정리
```

---

## Commit Strategy (Updated)

| Commit | Message | Files |
|--------|---------|-------|
| 1 | `chore: remove empty Clerk env variables` | `.env.local`, `next.config.ts`, `Dockerfile`, `Dockerfile.bun` |
| 2 | `chore: update env.example.txt Clerk section` | `env.example.txt` |
| 3 | `fix: update Clerk references to Better Auth in about and privacy pages` | `about/page.tsx`, `privacy-policy/page.tsx` |
| 4 | `docs: replace Clerk references with Better Auth in infoconfig` | `infoconfig.ts` |
| 5 | `docs: update Clerk mention to Better Auth in use-nav JSDoc` | `use-nav.ts` |
| 6 | `docs: remove Clerk setup guide and update nav-rbac references` | `docs/clerk_setup.md`, `docs/nav-rbac.md` |
| 7 | `docs: remove Clerk references from project documentation` | `CLAUDE.md`, `AGENTS.md`, `README.md` |

---

## Final Verification Wave

- [x] F1. **Clerk 참조 완전 제거 검증** ✅ VERIFIED — src/, config, env, docs 모두 CLEAN. PROJECT_STATUS.md 3건(상태 기록)만 예외
  Run: `grep -rn 'clerk\|Clerk\|CLERK' alpha/src/ --include='*.{ts,tsx}'`
  Run: `grep -n 'CLERK\|clerk' alpha/.env.local`
  Run: `grep -n 'clerk' alpha/next.config.ts`
  Expected: 모두 0 lines
  Output: `VERDICT: APPROVE / REJECT`

- [x] F2. **Build + Test 검증** ✅ VERIFIED — Build SUCCESS, Tests 34/34 PASS
  Run: `cd alpha && bun run build`
  Run: `cd alpha && bun test`
  Expected: Build success, Tests pass (34/34)
  Output: `VERDICT: APPROVE / REJECT`

---

## Commit Strategy

| Task | Message | Files |
|------|---------|-------|
| T1 | `chore: remove empty Clerk env variables` | `.env.local` |
| T1 | (same commit) | `next.config.ts` |
| T3+T4 | `fix: update Clerk references to Better Auth in about and privacy pages` | `about/page.tsx`, `privacy-policy/page.tsx` |
| T5 | `docs: replace Clerk references with Better Auth in infoconfig` | `infoconfig.ts` |
| T6 | `docs: update Clerk mention to Better Auth in use-nav JSDoc` | `use-nav.ts` |

---

## Success Criteria

### Verification Commands
```bash
# 1. 소스 코드 Clerk 참조 검증
cd alpha && grep -rn 'clerk\|Clerk\|CLERK' src/ --include='*.{ts,tsx}' --include='*.{js,jsx}'
# Expected: 0 matches

# 2. env 파일 검증
grep -n 'CLERK\|clerk' alpha/.env.local
# Expected: 0 matches
grep -n 'CLERK\|clerk' alpha/env.example.txt
# Expected: 0 matches

# 3. Config/빌드 파일 검증
grep -rn 'CLERK\|clerk' alpha/next.config.ts alpha/Dockerfile alpha/Dockerfile.bun
# Expected: 0 matches

# 4. 문서 파일 검증
grep -rn 'Clerk\|clerk' alpha/docs/ alpha/AGENTS.md alpha/CLAUDE.md alpha/README.md
# Expected: 0 matches

# 5. Build + Test
cd alpha && bun run build
# Expected: Build successful

cd alpha && bun test
# Expected: All tests pass (34/34)
```

### Final Checklist
- [ ] 모든 `src/` 파일에서 Clerk 문자열 0건 (소스 코드)
- [ ] `.env.local`, `env.example.txt`에 Clerk 변수 없음
- [ ] `next.config.ts`에 Clerk 호스트 없음
- [ ] `Dockerfile`/`Dockerfile.bun`에 Clerk ARG 없음
- [ ] `docs/`, `AGENTS.md`, `CLAUDE.md`, `README.md`에 Clerk 문자열 없음
- [ ] `bun run build` 통과
- [ ] `bun test` 통과 (34/34)
- [ ] Better Auth 관련 코드 변경 없음
