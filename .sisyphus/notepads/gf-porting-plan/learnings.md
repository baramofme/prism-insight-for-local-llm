# Notepad: GF Porting Plan - Learnings Log

## Wave 1 Completion Notes (2026-06-28)

### T1 - Theme Tokens
- **Files**: `beta/src/app/globals.css` (+31 lines)
- **Light mode tokens**: 10 CSS variables (--gf-color-rise, --gf-color-fall, etc.)
- **Dark mode tokens**: 10 CSS variables (adjusted lightness for dark mode)
- **Pattern**: oklch color format throughout, consistent with existing shadcn/ui theme

### T2 - Tailwind Utilities
- **Files**: `beta/src/app/globals.css` (@theme inline block, +7 lines)
- **Breakpoints**: gf-sm(760px), gf-md(1380px), gf-lg(1480px), gf-xl(1820px)
- **Nav widths**: collapsed(80px), expanded(320px)
- **Note**: Tailwind v4 uses `@theme inline`, NOT tailwind.config.ts

### T3 - Type Definitions
- **Files**: `beta/src/types/gf-types.ts` (NEW, +103 lines)
- **Types**: NavigationItem, TabProps, ContentTabItem, ChartConfig, BreakpointCategory
- **Utils**: getBreakpointCategory(), isNavVisible(), isNavExpanded(), calculateMainMargin()
- **Note**: Utility functions included in same file as types for co-location

## Wave 2 Completion Notes (2026-06-28)

### T4 - Test Utilities
- **Files created**: `beta/jest.config.js`, `beta/tests/setup.ts`, `beta/src/test/utils/gf-test-utils.ts`
- **jest.config.js**: Uses `next/jest` factory; ts-jest transform, jsdom environment, `@/` alias mapping via moduleNameMapper, CSS module mocking with identity-obj-proxy
- **setup.ts**: Imports @testing-library/jest-dom for custom matchers
- **gf-test-utils.ts**: Three pure utility exports: setViewport(), getElementBox(), compareColors()
- **package.json**: Added `"test": "jest"` script
- **Verification**: Jest 30.4.1, 7 tests passed (smoke test for all three utilities)
- **Note**: All required devDependencies were already present (jest ^30.4.2, ts-jest ^29.4.11, etc.) — no npm install needed

### T5 - Responsive Layout Container
- **Files modified**: `beta/src/app/globals.css` (+media queries), `beta/src/app/dashboard/layout.tsx` (import + GfLayout wrapper)
- **Files created**: `beta/src/components/layout/gf-layout.tsx` (NEW)
- **CSS variables on html element** (not :root): --main-margin-left set via media queries at 760px/1380px/1480px breakpoints; default value 0 on bare `html {}` selector before any @media rules
- **GfLayout component**: Server component (no hooks needed); uses `style={{ marginLeft: 'var(--main-margin-left)' }}` for dynamic margin; Tailwind classes for everything else (padding responsive with gf-sm breakpoint)
- **Container max-width**: `max-w-[1820px] mx-auto` centers the entire flex row at ≥1820px viewports
- **Right panel slot**: hidden below gf-md(1380px), visible with flex-grow above; conditional rendering via optional `rightPanel` prop
- **data-gf attributes**: "main-content" and "research-panel" for test selectors
- **Dashboard path bypass preserved**: `/dashboard` still returns children directly without layout wrapping (GF clone manages its own shell)
- **SidebarProvider untouched**: GfLayout wraps content inside SidebarInset, composing with existing sidebar infrastructure rather than replacing it

### T6 - Fixed Navigation Rail Component
- **Files created**: `beta/src/components/layout/gf-nav-rail.tsx` (NEW, ~189 lines)
- **Files modified**: `beta/src/app/dashboard/layout.tsx` (Sidebar → GfNavRail 교체, -105/+24 lines)
- **Pattern**: `position: fixed` 기반 네비 레일 (left:0, top:0, h-screen). 폭 전환은 inline style width + CSS transition 사용
- **Breakpoint detection**: `matchMedia` API 직접 사용 (760px, 1480px). 커스텀 훅 `useNavMode()`로 hidden/collapsed/expanded 상태 관리
- **Hover overlay**: collapsed 모드(760~1380px)에서 hover 시 너비 80→320px 확장, z-index 60으로 콘텐츠 위에 오버레이. expanded 모드에서는 호버 무시
- **Layout integration**: SidebarProvider/Sidebar/SidebarInset 완전히 제거. GfNavRail(fixed) + header(sticky, marginLeft=CSS 변수) + GfLayout(sibling) 구조로 재구성
- **Color tokens**: GF 토큰(`--gf-color-rise`, `--gf-color-fall`, `--gf-text-*`, `--gf-bg-hover`) 직접 적용. Tailwind arbitrary value `text-[var(--gf-color-rise)]` 패턴 사용
- **Text visibility**: `style={{ display: width > 100 ? undefined : 'none' }}` 패턴으로 collapsed(80px) 시 텍스트 숨김, expanded/hover 시 표시
- **data-gf attribute**: `"nav-rail"` 테스트용 식별자 추가
- **Note**: shadcn Sidebar 컴포넌트 파일(`sidebar.tsx`)은 유지 (다른 곳에서 참조 가능). layout.tsx에서만 import/use 제거
