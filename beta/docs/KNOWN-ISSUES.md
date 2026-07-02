# Known Issues — beta (GF clone)

> GF(finance.google.com) 정합 작업 중 발견됐으나 아직 미해결인 항목 기록.
> 새 이슈는 위에 추가(최신 순). 해결 시 `상태: 해결(커밋)` 로 갱신.

---

## ISSUE-001 — 반응형 분기가 "기기(터치/모바일) 여부"를 반영하지 않음 (GF와 불일치)

- **상태**: 미해결
- **발견일**: 2026-07-02
- **영역**: 반응형 레이아웃 / 좌측 네비게이션 축소 임계

### 증상
- **beta**: 좌측 네비 축소가 **순수 너비(768px)** 기준. Chrome *Toggle device toolbar* 를 켜도 임계가 그대로 768px.
- **GF(finance.google.com)**: 데스크톱(툴바 OFF)에선 ~768px, 모바일 에뮬레이션(툴바 ON)에선 **~1000px** 에서 이미 네비가 접힘 → **같은 픽셀 너비라도 분기가 달라짐**.

### 원인
GF 는 반응형을 **너비 단독**이 아니라 **기기/터치 신호와 조합**해 판단한다. Chrome device toolbar 는 단순 리사이즈가 아니라 모바일 기기를 에뮬레이션하며 다음 신호를 뒤집는다:

| 신호 | 데스크톱(OFF) | 기기 툴바(ON) |
|---|---|---|
| User-Agent | 데스크톱 UA | 모바일 UA |
| 터치 | `maxTouchPoints = 0` | `maxTouchPoints > 0` |
| CSS 포인터 | `(pointer: fine)`/`(hover: hover)` | `(pointer: coarse)`/`(hover: none)` |

→ GF 는 터치/모바일로 인식되면 모바일 튜닝 분기(더 이른 폭에서 사이드바 숨김)로 전환.

beta 는 [`src/app/dashboard/page.tsx`](../src/app/dashboard/page.tsx) 에서 `window.innerWidth`(`vp`) + Tailwind `md:`(768px)만 사용하고 UA/터치/`pointer` 분기가 없음 → device toolbar 에서 동작이 GF 와 다름.

### 재현
1. finance.google.com/finance/beta 접속.
2. DevTools → Toggle device toolbar(Ctrl+Shift+M) OFF 상태에서 창 너비를 줄이며 좌측 네비 축소 지점 확인(~768px).
3. 툴바 ON(모바일 기기/터치) 후 동일 확인 → ~1000px 에서 축소.
4. 툴바에서 UA 를 Desktop 으로 바꾸거나 터치를 끄면 임계가 다시 768px 로 복귀 → UA/터치 기반 분기 확증.

### 해결 방향 (제안)
- `(pointer: coarse)` / `(hover: none)` 또는 `navigator.maxTouchPoints > 0` 를 감지하는 훅(`useCoarsePointer`) 추가.
- 터치/모바일로 감지되면 좌측 네비 축소 임계를 상향(예: `BREAKPOINTS.MOBILE` → 터치 시 ~1000px)하도록 `page.tsx` 분기 보강.
- 순수 SSR 안전성 위해 초기값은 데스크톱 가정 후 mount 시 보정(현행 `vp` 패턴과 동일).
- 관련 상수: [`src/lib/breakpoints.ts`](../src/lib/breakpoints.ts).
