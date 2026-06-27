
## T3+T4 Verification (2026-06-27)
- about/page.tsx과 privacy-policy/page.tsx는 이미 Better Auth로 변경 완료되어 있음
- grep '[Cc]lerk' 결과 두 파일 모두 0건
- bun run build 정상 통과

## T11+T12+T13 Verification (2026-06-27)
### alpha/CLAUDE.md (~lines 10-11)
- clerk_setup.md 참조 제거, nav-rbac.md에서 Clerk integration → Better Auth로 변경
- grep '[Cc]lerk' 결과: 0건 ✅

### alpha/AGENTS.md (~27 locations)
- Tech stack: "Clerk (with Organizations/Billing)" → "Better Auth"
- Auth section: Clerk Organizations/Billing → Better Auth equivalent
- docs/clerk_setup.md 참조 제거
- Env vars: Clerk keys 제거, BETTER_AUTH_SECRET만 유지
- Auth patterns: @clerk/nextjs import들 → Better Auth equivalent 코드 예시
- Production env vars: CLERK_* → BETTER_AUTH_SECRET
- Docker build images: img.clerk.com, clerk.com 제거
- cleanup.js 명령어: clerk → better-auth
- Troubleshooting: Clerk keyless mode → Better Auth session persistence
- External docs: Clerk Next.js SDK → Better Auth Docs 링크
- grep '[Cc]lerk' 결과: 0건 ✅

### alpha/README.md (~15 locations)
- Sponsor badge: Clerk badge 제거
- Tech Stack: Clerk → Better Auth 링크
- Features: Clerk Organizations/Billing/RBAC → Better Auth equivalent
- Pages table: Signup/Signin URL, Profile, Workspaces, Team Management, Billing, Exclusive Page의 Clerk 참조 모두 제거
- Getting Started: Clerk setup → Better Auth setup
- Docker build/run: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY 제거, BETTER_AUTH_SECRET 사용
- grep '[Cc]lerk' 결과: 0건 ✅

### Note
- PROJECT_STATUS.md에도 Clerk 참조가 있으나 프로젝트 상태 추적 문서로 작업 범위 외
