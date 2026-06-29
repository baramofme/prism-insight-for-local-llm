# 반응형 구성

> Google Finance (finance.google.com) 반응형 레이아웃 분석 (2026-06-29)
> Playwright로 7개 breakpoint에서 측정한 데이터 기반

---

## 1. Breakpoint별 영역 넓이

### 레이아웃 영역 구성

Google Finance는 뷰포트 폭에 따라 3가지 레이아웃 모드로 전환된다:

- **모바일** (`< ~700px`): 사이드바 없음, 콘텐츠 전체 폭, 수직 스크롤
- **타블렛/중간** (`~768px ~ 1024px`): 좁은 네비 레일(81px) + 콘텐츠 영역
- **데스크톱** (`1280px+`): 좁은 네비 레일(81px, 1440px부터 301px로 확장) + 콘텐츠 + 우측 패널

### 영역별 넓이 표

| Breakpoint | 네비 사이드바 | 메인 콘텐츠 영역 | 우측 패널 | 헤더 |
|---|---|---|---|---|
| **360px** | 없음 | 360px (전체) | 없음 | 360x60px |
| **480px** | 없음 | 480px (전체) | 없음 | 480x60px |
| **768px** | 81px (fixed, @0,80) | 640px + padding 24px 양측 | 없음 | 768x80px |
| **1024px** | 81px (fixed, @0,80) | 800px + 중앙 정렬(m48) + pad 24px | 없음 | 1024x80px |
| **1280px** | 81px (fixed, @0,80) | 800px | 400px (우측) | 1280x80px |
| **1440px** | 301px (fixed, @0,80) | 796px | 344px (우측) | 1440x80px |
| **1920px** | 321px (fixed, @50,80) | 840px | 658px (우측) | 1820x80px (@50) |

### 네비게이션 사이드바 변화

| Breakpoint | 넓이 | 위치 | overflow-y | 설명 |
|---|---|---|---|---|
| 360px, 480px | 없음 | - | - | 사이드바 미표시 |
| 768px | 81px | 좌측 상단 고정(fixed), top=80 | auto | 아이콘만 표시 (collapsed) |
| 1024px | 81px | 좌측 상단 고정, top=80 | auto | 동일 |
| 1280px | 81px | 좌측 상단 고정, top=80 | auto | 동일 |
| 1440px | 301px | 좌측 상단 고정, top=80 | auto | **확장됨** - 텍스트 레이블 표시 |
| 1920px | 321px | 좌측 margin 50px, top=80 | auto | 확장 + 좌측 여백 |

### 우측 패널 (Watchlist) 변화

| Breakpoint | 넓이 | 높이 | overflow-y | 위치(x,y) |
|---|---|---|---|---|
| < 1280px | 없음 | - | - | 미표시 |
| 1280px | 400px | 861px | scroll | (880, 80) |
| 1440px | 344px | 861px | scroll | (1096, 80) |
| 1920px | 658px | 1041px | scroll | (1212, 80) |

### 헤더 변화

| Breakpoint | 넓이 | 높이 | 위치 | overflow-x |
|---|---|---|---|---|
| 360px | 360px | 60px | fixed top=0 | visible |
| 480px | 480px | 60px | fixed top=0 | visible |
| 768px | 768px | 80px | fixed top=0 | visible |
| 1024px | 1024px | 80px | fixed top=0 | visible |
| 1280px | 1280px | 80px | fixed top=0 | visible |
| 1440px | 1440px | 80px | fixed top=0 | visible |
| 1920px | 1820px | 80px | fixed top=0, 좌측 50px | visible |

> 1920px에서는 헤더가 전체 폭이 아닌 1820px로, 사이드바와 함께 50px 오프셋됨.

---

## 2. Breakpoint별 요소 패딩, 마진, 넓이, 높이

### 2.1 메인 콘텐츠 영역 (Scrollable Container)

| Breakpoint | 클래스 | 넓이 | 높이 | scrollW | scrollH | padding | margin |
|---|---|---|---|---|---|---|---|
| 768px | `Y8k45b lkrQle` | 688px | 820px | 688px | 1677px | 0,24,0,24 | - |
| 1024px | `Y8k45b lkrQle` | 944px | 820px | 944px | 1677px | 0,24,0,24 | - |
| 1280px | `Y8k45b lkrQle` | 800px | 820px | 800px | 1499px | 0,0,0,0 | - |
| 1440px | `Y8k45b lkrQle` | 796px | 820px | 796px | 1499px | 0,0,0,0 | - |
| 1920px | `Y8k45b lkrQle` | 840px | 1000px | 840px | 1499px | 0,0,0,0 | - |

- **768px~1024px**: 콘텐츠 내부에 padding 24px 양측 적용
- **1280px~**: padding 제거, 우측 패널이 별도로 표시됨
- 메인 콘텐츠의 높이는 뷰포트 높이에 맞춰짐 (820px or 1000px)

### 2.2 콘텐츠 직접 자식 (Main Content Sections)

768px breakpoint (3개 섹션):

| 섹션 | 클래스 | 넓이 | 높이 | x,y | padding | margin | 자식 수 |
|---|---|---|---|---|---|---|---|
| 상단 영역 | `Gbn51b` | 640px | 48px | (104,80) | 전부 0 | 전부 0 | 1 |
| 메인 콘텐츠 | `z1xtxd` | 640px | 1629px | (104,128) | 20,0,150,0 | 전부 0 | 1 |
| (하단 여백) | - | 640px | 0px | - | - | - | 0 |

- 메인 콘텐츠(`z1xtxd`): padding-top 20px, padding-bottom 150px (하단 여유 공간)
- 1024px: `z1xtxd`의 margin: 48px 양측 (중앙 정렬 효과)

1024px breakpoint:

| 섹션 | 클래스 | 넓이 | 높이 | padding | margin |
|---|---|---|---|---|---|
| 상단 영역 | `Gbn51b` | 896px | 48px | 0 | 0 |
| 메인 콘텐츠 | `z1xtxd` | 800px | 1629px | 20,0,150,0 | 48,0,48,0 |

### 2.3 콘텐츠 내부 그랜드차일드 (Content Sections)

768px / 1024px:

| 섹션 | 클래스 | 넓이(x) | 높이 | scrollable | 자식 수 |
|---|---|---|---|---|---|
| 상단 콘텐츠 블록 | `tYBjWe` | 640/800px | 732px | scrollable | 1 |
| 하단 영역 | `C-WIZ` | 640/800px | 275px | 아니오 | 2 |

- 콘텐츠가 flex column으로 배열되어 수직으로 쌓임
- 상단 블록은 scrollable (overflow:visible + 부모 컨테이너 스크롤)

### 2.4 탭 내비게이션

| Breakpoint | 탭바 넓이 | 탭바 높이 | display | flex | 자식(탭) 수 |
|---|---|---|---|---|---|
| 768px | 640px | 47px | flex | row | 2 |
| 1024px | 896px | 47px | flex | row | 2 |

각 탭 항목:

| 탭 | 넓이 | 높이 | font-size | font-weight | padding |
|---|---|---|---|---|---|
| Markets | 71px | 47px | 14px | 400 | 0,16,0,16 |
| Watchlists | 93px | 47px | 14px | 400 | 0,16,0,16 |

- 탭 간격: flex row, gap 없음, 각 탭 padding 좌우 16px
- 활성화된 탭은 하단 border로 표시 (별도 표시자)

### 2.5 검색 입력창

| Breakpoint | 넓이 | 높이 | font-size |
|---|---|---|---|
| 모든 BP (헤더 내) | ~200px | ~36px | 14px |

- 헤더 우측에 위치, 헤더 내에서 고정됨

### 2.6 시장 지표 스트립 (Market Indices)

| Breakpoint | 넓이 | 높이 | scrollW | overflow | 자식 수 |
|---|---|---|---|---|---|
| 360px | 360px | 116px | 600px | auto/auto | 35 |
| 480px | 480px | 116px | 600px | auto/auto | 35 |
| 1440px (우측 패널 내) | 252px | 53px | 260px | visible/visible | 13 |
| 1920px (우측 패널 내) | 272px | 53px | 280px | visible/visible | 13 |

모바일:
- 지표 아이템: 104x116px, padding 0
- 가로 스크롤 가능 (600px까지)
- 360px 뷰포트에서 약 3.4개 아이템 가시 (104*3=312, 양측 여백)

데스크톱 (우측 패널 내):
- 지표 아이템: ~76~109px x 53px, padding 좌측 0~12px
- 더 작은 카드 형태

### 2.7 주식 리스트

모바일 (`xm2hKd`):

| Breakpoint | 넓이 | 높이 | scrollW | scrollH | overflow |
|---|---|---|---|---|---|
| 360px | 344px | 337px | 886px | 337px | scroll/auto |
| 480px | 464px | 337px | 1216px | 337px | scroll/auto |

- **가로 스크롤 가능** (886px ~ 1216px)
- 개별 행 넓이: 870px (360px) / 1200px (480px), 높이 33px
- 가로로 긴 테이블 형태로, 좌우 스크롤 필요

데스크톱 (우측 패널 내 `Njxgkf`):

| Breakpoint | 넓이 | 높이 | scrollW | scrollH |
|---|---|---|---|---|
| 1280px | 400px | 820px (전체) | 400px | 861px |
| 1440px | 344px | 820px (전체) | 344px | 861px |
| 1920px | 659px | 1000px (전체) | 658px | 1041px |

- 행 높이: 53px (데스크톱) — 모바일(33px)보다 큼

우측 패널 내 리스트 (Watchlist):

| Breakpoint | 넓이 | 높이 | scrollW | scrollH |
|---|---|---|---|---|
| 1280px | 400px | 772px | - | scroll |
| 1440px | 344px | 772px | - | scroll |
| 1920px | 658px | 952px | - | scroll |

### 2.8 네비게이션 사이드바 아이템

Collapsed 상태 (81px, 768~1280px):

| 아이템 | 넓이 | 높이 | font-size | padding |
|---|---|---|---|---|
| 아이콘 영역 | 32px | 49px | 16px(icon) | 0 |
| 리스트 영역 | 80px | 588~669px | 16px | 0 |

Expanded 상태 (301px~321px, 1440px~1920px):

| 아이템 | 넓이 | 높이 | font-size | padding |
|---|---|---|---|---|
| 아이콘 영역 | 252~272px | 49px | 16px | 0 |
| 리스트 영역 | 300~321px | 642~669px | 16px | 0,24,0,24 |

- Expanded 상태에서는 리스트 영역에 padding 24px 양측 적용
- 아이콘과 텍스트 레이블이 함께 표시됨

### 2.9 섹션 헤딩

| 스타일 | 넓이 | 높이 | font-size | font-weight |
|---|---|---|---|---|
| 메인 헤딩 (`YJu49d`) | 176~490px | 24~32px | 18~24px | 400~500 |
| 보조 헤딩 (`jhidhd`) | 296~668px | 16px | 12px | 400 |

- 모바일: 메인 헤딩 18px 500 → 더 큰 화면에서 24px 400으로 변경
- 보조 헤딩은 일관되게 12px 400

---

## 3. Breakpoint별 스크롤 가능 여부

### 모바일 (360px, 480px)

| 컨테이너 | overflow-x | overflow-y | scrollW | scrollH | 스크롤 가능? |
|---|---|---|---|---|---|
| BODY (`tQj5Y...`) | auto | scroll | 360px | 3530px | **수직 스크롤** (페이지 전체) |
| 시장 지표 (`o3EJCc`) | auto | auto | 600px | 116px | **가로 스크롤** |
| 주식 리스트 (`xm2hKd`) | scroll | auto | 886~1216px | 337px | **가로 스크롤** (주력) |
| 하단 탭 (`NBZP0e xbmkib`) | auto | hidden | 550px | 56px | **가로 스크롤** |

- 모바일에서는 **페이지 전체가 수직 스크롤**
- 내부에 **2개의 가로 스크롤 영역** 존재 (시장 지표, 주식 리스트)
- 뷰포트보다 콘텐츠가 5~7배 더 긺 (360px 뷰포트에 3530px)

### 타블렛 (768px, 1024px)

| 컨테이너 | overflow-x | overflow-y | scrollW | scrollH | 스크롤 가능? |
|---|---|---|---|---|---|
| 메인 영역 (`Y8k45b lkrQle`) | hidden | scroll | 688/944px | 1677px | **수직 스크롤** |
| 네비 사이드바 (`t4pbz ZkAH1b`) | auto | auto | - | - | overflow:auto |
| 하단 탭 (`NBZP0e xbmkib`) | auto | hidden | 542px | 56px | 가로 스크롤 |

- **뷰포트 자체는 스크롤 불가** (768x900, content fits)
- **메인 영역만 내부 수직 스크롤** (820px 높이 컨테이너, 1677px 콘텐츠)
- 사이드바는 auto → 필요시 내부 스크롤

### 데스크톱 (1280px~1920px)

**1280px / 1440px:**

| 컨테이너 | overflow-x | overflow-y | scrollW | scrollH | 스크롤 가능? |
|---|---|---|---|---|---|
| 메인 영역 (`Y8k45b lkrQle`) | hidden | scroll | 800/796px | 1499px | **수직 스크롤** |
| 우측 패널 (`t4pbz Njxgkf`) | auto | scroll | 400/344px | 861px | **수직 스크롤** |

**1920px:**

| 컨테이너 | overflow-x | overflow-y | scrollW | scrollH | 스크롤 가능? |
|---|---|---|---|---|---|
| 메인 영역 (`Y8k45b lkrQle`) | hidden | scroll | 840px | 1499px | **수직 스크롤** |
| 우측 패널 (`t4pbz Njxgkf`) | auto | scroll | 658px | 1041px | **수직 스크롤** |
| 시장 지표 (우측 패널 내) | visible | visible | 280px | 53px | 내부 overflow (가로) |
| 주식 리스트 (우측 패널 내) | visible | visible | 280px | 582px | 내부 overflow (가로) |

- 데스크톱에서는 **메인 영역과 우측 패널이 각각 독립적으로 수직 스크롤**
- 뷰포트 자체는 스크롤 불가
- 우측 패널 내 시장 지표와 주식 리스트는 overflow:visible이므로 부모를 따라감

### 스크롤 동작 요약

| Breakpoint | 페이지 스크롤 | 메인 영역 스크롤 | 우측 패널 스크롤 | 가로 스크롤 영역 |
|---|---|---|---|---|
| 360px | 수직 O | (페이지 스크롤) | 없음 | 시장지표, 주식리스트 |
| 480px | 수직 O | (페이지 스크롤) | 없음 | 시장지표, 주식리스트 |
| 768px | 없음 | 수직 O (내부) | 없음 | 하단 탭 |
| 1024px | 없음 | 수직 O (내부) | 없음 | 하단 탭 |
| 1280px | 없음 | 수직 O (내부) | 수직 O | 없음 |
| 1440px | 없음 | 수직 O (내부) | 수직 O | 없음 |
| 1920px | 없음 | 수직 O (내부) | 수직 O | 우측 패널 내 |

---

## 4. Alpha와의 차이점

### 4.1 Breakpoint 비교

| 항목 | Google Finance | Alpha |
|---|---|---|
| 모바일 중단점 | ~700px 미만 사이드바 없음 | 760px (`--breakpoint-gf-sm`) |
| 타블렛 중단점 | 768px부터 사이드바 등장 | 760px부터 네비 표현 |
| 데스크톱 중단점 | 1280px부터 우측 패널 등장 | 1380px (`--breakpoint-gf-md`) |
| 네비 확장 중단점 | 1440px (81px→301px) | 1480px (`--breakpoint-gf-lg`, 80px→320px) |
| 최대 폭 | ~1820px (중앙 정렬) | 1820px (`--breakpoint-gf-xl`) |
| 네비 축소 폭 | 81px | 80px (`--nav-width-collapsed`) |
| 네비 확장 폭 | 301~321px | 320px (`--nav-width-expanded`) |

**차이점**: Alpha의 breakpoint 값은 GF와 매우 유사하지만, 우측 패널 등장 시점에서 차이가 있다.
- GF: 우측 패널이 **1280px**부터 등장
- Alpha: 우측 패널(ResearchChatPanel)이 `w-80`으로 **고정적으로 표시**됨 (breakpoint 조건 없음)

### 4.2 레이아웃 구조 비교

| 구성 요소 | Google Finance | Alpha |
|---|---|---|
| **네비 사이드바** | fixed 포지션, z-index 높음 | fixed/sticky, 유사함 |
| **헤더** | 60~80px, fixed, 내부에 검색창 포함 | 별도 Header 컴포넌트, 레이아웃 상단 |
| **메인 콘텐츠** | padding 24px 양측 or 여백 없음 | `px-4 md:px-6 pt-2 md:pt-4 pb-4` |
| **우측 패널** | 1280px부터 표시, 344~658px | 항상 표시, `w-80` (320px) 고정 |
| **최대 너비** | ~1820px 중앙 정렬 | `max-w-[1820px]` (FinanceView) |
| **콘텐츠 여백** | 1280px 미만: padding 24px | 유동적 padding |

### 4.3 탭/네비게이션 차이

| 항목 | Google Finance | Alpha |
|---|---|---|
| 탭 수 | 2개 (Markets, Watchlists) | 3개 (Overview, Financials, Earnings) |
| 탭 스타일 | padding 16px, font 14px 400, 하단 border | padding, border-bottom 2px 액티브 표시 |
| 탭 위치 | 사이드바 하단, 메인 상단 | 메인 콘텐츠 내부 Tabs 컴포넌트 |
| 기간 선택 | 없음 (메인 페이지) | ToggleGroup (1D, 1W, 1M, 3M, 1Y, 5Y) |

### 4.4 콘텐츠 구성 차이

| 항목 | Google Finance | Alpha |
|---|---|---|
| **시장 지표 스트립** | 가로 스크롤, 104x116px 카드 | 별도 MarketOverview, grid 5열 |
| **주식 리스트** | 가로 스크롤 테이블 (886px+) | data-table 형태 (TanStack Table) |
| **우측 패널** | Watchlist + 시장 지표 | ResearchChatPanel (AI 채팅) |
| **차트** | 없음 (메인 페이지) | PriceChart 컴포넌트 (종목 상세) |
| **뉴스** | 없음 (메인 페이지) | NewsList 컴포넌트 (종목 상세) |
| **관련 주식** | 없음 (메인 페이지) | Carousel 형태 (종목 상세) |

### 4.5 스크롤 동작 차이

| 항목 | Google Finance | Alpha |
|---|---|---|
| **모바일** | 페이지 전체 스크롤 + 내부 가로 스크롤 | 페이지 전체 스크롤 |
| **데스크톱** | **독립적 영역 스크롤** (메인/우측 각각) | **페이지 단일 스크롤** |
| **가로 스크롤** | 시장 지표, 주식 리스트에서 사용 | Carousel에서만 사용 |
| **스크롤바** | 브라우저 기본 | 커스텀 (thin, rounded) |

### 4.6 우측 패널 비교

| 항목 | Google Finance (Watchlist) | Alpha (ResearchChatPanel) |
|---|---|---|
| 표시 조건 | 1280px 이상에서만 표시 | 항상 표시 (finance 모드) |
| 넓이 | 344~658px (반응형) | 320px (`w-80`, 고정) |
| 콘텐츠 | 주식 리스트 + 시장 지표 | AI 채팅 인터페이스 |
| 스크롤 | 독립적 수직 스크롤 | 페이지 스크롤에 종속 |

### 4.7 네비게이션 사이드바 차이

| 항목 | Google Finance | Alpha |
|---|---|---|
| Collapsed 넓이 | 81px | 80px |
| Expanded 넓이 | 301~321px | 320px |
| 확장 시점 | 1440px | 1480px |
| Collapsed 표시 | 아이콘만 | 아이콘만 |
| Expanded 표시 | 아이콘 + 텍스트 | 아이콘 + 텍스트 |
| 전환 방식 | 점진적(81→301px) | abrupt(80→320px) |

### 4.8 헤더 차이

| 항목 | Google Finance | Alpha |
|---|---|---|
| 높이 | 60px(모바일) / 80px(데스크톱) | 고정값 |
| fixed 여부 | 항상 fixed | depends on layout |
| 검색창 포함 | 예 (우측) | 별도 search-input 컴포넌트 |
| 폭 | 360~1820px (반응형) | 전체 폭 |

### 4.9 주요 개선 제안

1. **우측 패널 조건부 표시**: Alpha의 ResearchChatPanel을 1280px 미만에서 숨기거나 접을 수 있게 함
2. **독립적 영역 스크롤**: 데스크톱에서 메인 콘텐츠와 우측 패널을 각각 scrollable하게 분리
3. **네비 확장 시점 조정**: 1440px에서 네비 확장 (Alpha는 1480px)
4. **모바일 가로 스크롤 영역**: 시장 지표 지수들을 가로 스크롤 카드 스트립으로 변경
5. **중앙 정렬 최대 폭**: 1920px에서 50px 좌측 여백 (중앙 정렬) — Alpha는 미적용
6. **콘텐츠 패딩 일관성**: breakpoint별 padding/margin 체계 통일
