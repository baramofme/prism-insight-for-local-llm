# Google Finance → alpha 이식 작업 계획 (태거 기반)

> 목표: GF 베타 종목 상세 화면을 alpha(`src/features/finance/`)에 **픽셀 단위로 정합**.
> 방법: `docs/gf-tagger.js`로 GF 영역에 `data-gf` 이름을 부여 → 영역 단독 **스크린샷 + 소스/스타일 덤프** → alpha 컴포넌트에 반영 → Playwright로 GF vs alpha 비교.
> 기준 문서: `docs/GOOGLE_FINANCE_LAYOUT_SPEC.md`(반응형 스펙), 이 문서(이식 절차).

---

## 0. 원칙
- **결정적 우선**: 치수·색·간격 등 측정 가능한 값부터 정합. 데이터(시세)는 STAGE A(실데이터)에서 별도.
- **영역 단위**: `data-gf` 태그 1개 = 작업 1단위. 한 번에 한 영역.
- **두 환경 같은 태거**: GF와 alpha 양쪽에 동일 측정 스크립트를 돌려 **수치를 1:1 비교**.
- **브레이크포인트 3-tier**: <1380 / 1380~1480 / ≥1480 (스펙 문서 기준) 각각 확인.

---

## 1. 워크플로우 (영역 1개 처리 사이클)

```
① 태거 주입        : GF 종목페이지 콘솔에 gf-tagger.js → [data-gf="..."] 생성
② 캡처             : 영역 스크린샷 (Playwright: browser_take_screenshot target=[data-gf=...])
③ 소스/스타일 덤프 : __gfSrc('gf-main-metrics') → outerHTML(구조) + 계산 스타일(폭/패딩/그리드/색)
④ 스펙화           : ②③을 "영역 이식 스펙"(아래 §4 템플릿)으로 기록
⑤ 이식             : alpha 컴포넌트 수정/신설 (표준 shadcn)
⑥ 검증             : alpha에도 동일 측정 스크립트 → GF 수치와 대조 (3 tier)
```

> 핵심: 제(에이전트) Playwright는 **사용자 구글 계정으로 로그인**돼 있어 GF를 직접 띄워 ①~③·⑥을 수행 가능.

---

## 2. 캡처 프로토콜 (영역별 수집 항목)

각 `data-gf` 영역에서 수집:
- **스크린샷**: 영역 단독 PNG (각 브레이크포인트 1장)
- **박스**: x/y/width/height
- **레이아웃**: `display`(flex/grid/block), `flex g/s/basis` 또는 `grid-template-columns`, `gap`
- **간격**: `padding`, `margin`
- **상한**: `max-width`
- **색/타이포**: 텍스트 `color`/`font-size`/`font-weight`, 배경, 보더 (필요 시 자식 leaf 별)
- **구조**: `outerHTML` 앞부분으로 자식 블록 순서 파악
- **상태변화**: hover/selected 등 (탭·버튼)

수집 도구: `__gfSrc(name)`(스타일+HTML), 추가 측정은 별도 evaluate.

---

## 3. 영역 → alpha 컴포넌트 매핑 (현황)

| data-gf | GF 영역 | alpha 대상 | 상태 |
|---|---|---|---|
| `gf-header` | 상단 헤더(로고/검색/시장네비/프로필) | (신규) GF풍 헤더 or 기존 Header 개조 | ❌ 신규 |
| `gf-left-nav` | 좌측 목록 네비 | shadcn Sidebar (`app-sidebar.tsx`) | ✅ 정합됨(레일80/펼침300·320/호버) |
| `gf-main` | 종목 상세 본문 | `features/finance/finance-view.tsx` | 🟡 존재(정합 필요) |
| `gf-main-breadcrumb` | 홈 > 000660:KRX | (신규) Breadcrumb | ❌ 신규 |
| `gf-main-stockheader` | 종목명/가/변동/시각 | `components/stock-header.tsx` | 🟡 정합 |
| `gf-main-price` | 현재가 | StockHeader 내부 | 🟡 |
| `gf-main-chart` | 가격 차트 | `components/price-chart.tsx` | 🟡 (lightweight-charts 검토) |
| `gf-main-periodtabs` | 기간 탭 1D~최대 | ToggleGroup (finance-view) | 🟡 정합 |
| `gf-main-contenttabs` | 개요/실적/금융 | Tabs (finance-view) | 🟡 정합 |
| `gf-main-metrics` | 핵심 지표 그리드 | `components/key-metrics.tsx` | 🟡 정합(열수/간격) |
| `gf-main-related` | 관련 주식 | `components/related-stocks.tsx` | 🟡 |
| `gf-main-news` | 뉴스 | `components/news-list.tsx` | 🟡 |
| `gf-main-profile` | 프로필 | `components/company-profile.tsx` | 🟡 |
| `gf-right-panel` | 우측 조사/AI 패널 | (신규) Resizable 우측 패널 | ❌ 신규(후순위) |
| `gf-footer` | 푸터(AI 면책/링크) | (신규) Footer | ❌ 신규 |

---

## 4. 영역 이식 스펙 템플릿 (영역마다 1장 작성)

```
### [data-gf=gf-main-metrics] 핵심 지표
- 컨테이너: width 792(유동) · padding 0 · display grid · grid-cols ? · gap ?
- 셀: padding ? · 라벨(color/size) · 값(color/size/weight)
- 항목 수/순서: 시가·고가·저가·시총·…(N개)
- 브레이크포인트: <1380(?) / 1380~1480(?) / ≥1480(?) 차이
- 색: 상승 #C0151D / 하락 #3364F0 (KRX 현지)
- alpha 매핑: components/key-metrics.tsx — 변경점: ___
- 검증: alpha 측정값 == GF 측정값 (3 tier)
```

---

## 5. 우선순위 & 단계

**1순위 — gf-main 본문 정합** (이미 컴포넌트 존재, 수치만 맞춤)
1. gf-main-stockheader (종목명 20px/가 24px/변동칩 색)
2. gf-main-metrics (그리드 열수·간격·라벨/값 타이포)
3. gf-main-periodtabs / contenttabs (탭 외형·밑줄·선택색)
4. gf-main-related / news / profile
5. gf-main-chart (lightweight-charts 도입 여부 결정)

**2순위 — 신규 영역**
6. gf-main-breadcrumb
7. gf-footer (max-width 1820 정합 포함)
8. gf-header (GF풍 상단바)
9. gf-right-panel (Resizable, ~1000px↑ 등장) — 가장 큰 작업

**전역**
- 전체 컨테이너 max-width 1820 + 센터링 (스펙 §6)

---

## 6. 검증 (GF vs alpha 1:1 비교)

- **동일 측정 스크립트**를 GF와 alpha 양쪽 콘솔/Playwright에서 실행 → 영역별 width/padding/grid/color 표 비교.
- alpha 측정 시 `data-slot`(shadcn) 또는 `data-gf-alpha` 커스텀 속성으로 영역 식별.
- 3 브레이크포인트(<1380 / 1380~1480 / ≥1480) 각각 일치 확인.
- 차이 항목만 표로 남겨 수정 → 재측정.

---

## 7. 산출물
- 영역별 이식 스펙(§4) 누적 → 본 문서 또는 `docs/gf-regions/*.md`
- 캡처 PNG: `docs/gf-shots/<region>-<bp>.png`
- alpha 컴포넌트 변경(PR 단위 = 영역 단위)
- 검증 비교표(GF vs alpha)

---

*기준: docs/GOOGLE_FINANCE_LAYOUT_SPEC.md · docs/gf-tagger.js · 작성 2026-06-26*
