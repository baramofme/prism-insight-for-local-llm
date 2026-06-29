# Research Panel Responsive - Learnings

## T2: calcPanelWidths() rightW step function 변경 (2026-06-29)

### 변경 내용
- `beta/src/app/dashboard/page.tsx` line 173-277의 `calcPanelWidths()` 함수에서 모든 모드(expanded/normal/hover/collapsed)의 `rightW` 계산값을 step function으로 변경

### Step function 매핑
| Viewport | rightW | 비고 |
|----------|--------|------|
| <1040px | 0 | 패널 숨김 (기존 유지) |
| ≥1040px | 344 | 기본 너비 |
| ≥1225px | 658 | 넓어짐 |
| ≥1380px | 344 | sidebar 펼쳐짐 → 좁아짐 |
| ≥1445px | 658 | 다시 넓어짐 |

### 적용 패턴
- **WIDE 블록**: 4-step (`RIGHT_PANEL_WIDE_B → DESKTOP_SIDEBAR → RIGHT_PANEL_WIDE_A → RIGHT_PANEL_MIN`)
- **TABLET 블록**: 2-step (`RIGHT_PANEL_WIDE_A → RIGHT_PANEL_MIN`, 나머지 범위에서는 0)
- `progress` 변수는 centerW/leftW 계산에 필요하므로 유지
- leftW, centerW, wrapperMargin 계산은 원상 유지

### 검증 결과
- lsp_diagnostics: TypeScript 컴파일 오류 없음
- BREAKPOINTS 상수(`RIGHT_PANEL_MIN=1040`, `RIGHT_PANEL_WIDE_A=1225`, `RIGHT_PANEL_WIDE_B=1445`, `DESKTOP_SIDEBAR=1380`)는 T1에서 이미 breakpoints.ts에 추가됨

## F2: Code Quality Review (2026-06-29)

### 빌드 및 정적 분석
- **tsc --noEmit**: PASS (exit 0)
- **Anti-pattern scan** (`as any`, `@ts-ignore`, empty catch, console.log): commit 내 신규 도입 없음. main-content.tsx의 기존 `as any`는 타겟 라인 외부에 존재.

### 로직 트레이스 (rightW step function)
| vp | rightW | 기대값 | 결과 |
|----|--------|--------|------|
| 1039 | 0 | 0 | ✅ |
| 1040 | 344 | 344 | ✅ |
| 1225 | 658 | 658 | ✅ |
| 1380 | 344 | 344 | ✅ |
| 1445 | 658 | 658 | ✅ |

### 스코프 검증
- `git show HEAD --stat`: 정확히 3 파일 변경 (breakpoints.ts, page.tsx, main-content.tsx)
- CSS 클래스 `min-[936px]` → `min-[1040px]` 동기화 완료
- JS 렌더 조건 `rightW > 0` → `vp >= BREAKPOINTS.RIGHT_PANEL_MIN`으로 변경 동기화 완료

### VERDICT: APPROVE
Build: PASS | Lint: PASS | Files: [3 clean / 0 issues]
