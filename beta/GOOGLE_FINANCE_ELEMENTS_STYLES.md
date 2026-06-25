# Google Finance 요소별 스타일 상세 문서
## 000660:KRX SK하이닉스 - 4개 브레이크포인트별 분석

---

## 1. 요소 명명 규칙

### 1.1 기능적 이름 매핑

| Google Finance ref | 기능적 이름 | 설명 | 위치 |
|-------------------|------------|------|------|
| e3 | **Header** | 상단 헤더 영역 | x=0, y=0, width=843, height=80 |
| e80 | **LeftSidebar** | 좌측 사이드바 (아이콘/라벨) | x=0, y=80, width=69, height=925 |
| e397 | **MainContent** | 메인 콘텐츠 영역 | x=80, y=80, width=763, height=920 |
| e1166 | **TopTabs** | 상단 탭 (000660, 조사) | x=104, y=80, width=715, height=48 |
| e404 | **Breadcrumb** | 브레드크럼 (홈 > 000660:KRX) | x=104, y=148, width=715, height=40 |
| e1172 | **AddToListBtn** | "목록에 추가" 버튼 | x=663, y=188, width=156, height=36 |
| e416 | **StockHeader** | 종목 헤더 (이름, 가격, 변동) | x=104, y=188, width=715, height=404 |
| e420 | **StockName** | 종목명 (SK하이닉스) | x=104, y=188, width=97, height=26 |
| e422 | **PriceSection** | 가격 영역 (₩2,912,000.00) | x=104, y=220, width=447, height=50 |
| e435 | **ChartArea** | 차트 영역 | x=104, y=282, width=715, height=310 |
| e437 | **ChartControls** | 차트 컨트롤 (영역, 비교, 지표) | x=112, y=278, width=294, height=48 |
| e477 | **ChartSVG** | 차트 SVG 그래픽 | x=117, y=340, width=689, height=201 |
| e743 | **PeriodTabs** | 기간 탭 (1D, 5D, 1M, ...) | x=120, y=560, width=332, height=24 |
| e754 | **ContentSection** | 콘텐츠 섹션 | x=104, y=600, width=715, height=1288 |
| e755 | **ContentTabs** | 콘텐츠 탭 (개요, 실적, 금융) | x=104, y=600, width=715, height=48 |
| e763 | **ContentPanel** | 콘텐츠 패널 (개요 탭 내용) | x=104, y=648, width=715, height=1240 |
| e1060 | **Footer** | 하단 푸터 | x=0, y=908, width=843, height=92 |

### 1.2 내부 요소명

| 요소 경로 | 기능적 이름 | 설명 |
|----------|------------|------|
| StockHeader > StockName | **종목명** | "SK하이닉스" 텍스트 |
| StockHeader > PriceSection > Price | **현재가** | "₩2,912,000.00" |
| StockHeader > PriceSection > Change | **변동률** | "+5.35%" |
| StockHeader > PriceSection > Timestamp | **타임스탬프** | "6월 22일, 오전 10시 30분" |
| ChartControls > ChartTypeBtn | **차트 유형 버튼** | "영역" (드롭다운) |
| ChartControls > CompareBtn | **비교 버튼** | "비교" |
| ChartControls > IndicatorsBtn | **지표 버튼** | "지표" |
| PeriodTabs > Tab | **기간 탭** | 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, 최대 |
| ContentTabs > Tab | **콘텐츠 탭** | 개요, 실적, 금융 |
| ContentPanel > AIModule | **AI 모듈** | AI 전망 섹션 |
| ContentPanel > KeyMetrics | **핵심 지표** | 시가, 고가, 저가, 시가총액 등 |
| ContentPanel > RelatedStocks | **관련 주식** | 삼성전자, 한국전력 등 |
| ContentPanel > NewsSection | **뉴스 섹션** | 뉴스 기사 목록 |
| ContentPanel > ProfileSection | **프로필 섹션** | 기업 프로필 |

---

## 2. 브레이크포인트별 스타일 비교

### 2.1 Header (e3)

| 속성 | MOBILE (759px) | TABLET (1038px) | DESKTOP (1155px) | WIDE (1524px) |
|------|---------------|-----------------|------------------|---------------|
| **width** | 843px | 1038px | 1155px | 1524px |
| **height** | 80px | 80px | 80px | 80px |
| **display** | flex | flex | flex | flex |
| **backgroundColor** | white | white | white | white |
| **padding** | 0px 16px | 0px 16px | 0px 16px | 0px 16px |

### 2.2 LeftSidebar (e80)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 69px | 232px | 232px | 232px |
| **height** | 925px | 925px | 925px | 925px |
| **display** | flex | flex | flex | flex |
| **flexDirection** | column | column | column | column |
| **visibility** | visible | visible | visible | visible |

### 2.3 MainContent (e397)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 763px | 681px | 752px | 651px |
| **height** | 920px | 920px | 920px | 920px |
| **display** | block | block | block | block |
| **marginLeft** | 80px | 104px | 104px | 344px |
| **backgroundColor** | white | white | white | white |

### 2.4 TopTabs (e1166)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 715px | 681px | 752px | 651px |
| **height** | 48px | 48px | 0px | 0px |
| **display** | block | block | block | block |
| **visibility** | visible | visible | hidden | hidden |
| **borderBottom** | 1px solid #e8eaed | 1px solid #e8eaed | none | none |

### 2.5 Breadcrumb (e404)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 715px | 681px | 752px | 651px |
| **height** | 40px | 40px | 40px | 40px |
| **display** | flex | flex | flex | flex |
| **fontSize** | 14px | 14px | 14px | 14px |
| **color** | rgb(10, 10, 10) | rgb(10, 10, 10) | rgb(10, 10, 10) | rgb(10, 10, 10) |
| **padding** | 8px 0px | 8px 0px | 8px 0px | 8px 0px |

### 2.6 AddToListBtn (e1172)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 156px | 156px | 156px | 156px |
| **height** | 36px | 36px | 36px | 36px |
| **display** | flex | flex | flex | flex |
| **fontSize** | 14px | 14px | 14px | 14px |
| **fontWeight** | 500 | 500 | 500 | 500 |
| **color** | #1a73e8 | #1a73e8 | #1a73e8 | #1a73e8 |
| **border** | 1px solid #dadce0 | 1px solid #dadce0 | 1px solid #dadce0 | 1px solid #dadce0 |
| **borderRadius** | 18px | 18px | 18px | 18px |
| **backgroundColor** | white | white | white | white |
| **cursor** | pointer | pointer | pointer | pointer |

### 2.7 StockHeader (e416)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 715px | 681px | 752px | 651px |
| **height** | 404px | 404px | 404px | 404px |
| **display** | block | block | block | block |
| **padding** | 16px 0px | 16px 0px | 16px 0px | 16px 0px |

### 2.8 StockName (e420)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 97px | 97px | 97px | 97px |
| **height** | 26px | 26px | 26px | 26px |
| **fontSize** | 16px | 16px | 16px | 16px |
| **fontWeight** | 500 | 500 | 500 | 500 |
| **color** | rgb(10, 10, 10) | rgb(10, 10, 10) | rgb(10, 10, 10) | rgb(10, 10, 10) |

### 2.9 PriceSection (e422)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 447px | 447px | 446px | 443px |
| **height** | 50px | 50px | 50px | 50px |
| **display** | flex | flex | flex | flex |
| **fontSize** | 24px | 24px | 24px | 24px |
| **fontWeight** | 500 | 500 | 500 | 500 |
| **color** | rgb(10, 10, 10) | rgb(10, 10, 10) | rgb(10, 10, 10) | rgb(10, 10, 10) |

### 2.10 ChartArea (e435)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 715px | 681px | 752px | 651px |
| **height** | 310px | 310px | 310px | 310px |
| **display** | block | block | block | block |

### 2.11 ChartControls (e437)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 294px | 294px | 294px | 294px |
| **height** | 48px | 48px | 48px | 48px |
| **display** | flex | flex | flex | flex |
| **gap** | 8px | 8px | 8px | 8px |

### 2.12 ChartSVG (e477)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 689px | 681px | 752px | 651px |
| **height** | 201px | 201px | 201px | 201px |
| **display** | block | block | block | block |

### 2.13 PeriodTabs (e743)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 332px | 332px | 332px | 332px |
| **height** | 24px | 24px | 24px | 24px |
| **display** | flex | flex | flex | flex |
| **gap** | 4px | 4px | 4px | 4px |
| **fontSize** | 12px | 12px | 12px | 12px |

### 2.14 ContentSection (e754)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 715px | 681px | 752px | 651px |
| **height** | 1288px | 1288px | 1288px | 1288px |
| **display** | block | block | block | block |

### 2.15 ContentTabs (e755)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 715px | 681px | 752px | 651px |
| **height** | 48px | 48px | 48px | 48px |
| **display** | flex | flex | flex | flex |
| **borderBottom** | 1px solid #e8eaed | 1px solid #e8eaed | 1px solid #e8eaed | 1px solid #e8eaed |

### 2.16 ContentPanel (e763)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 715px | 681px | 752px | 651px |
| **height** | 1240px | 1240px | 1240px | 1240px |
| **display** | block | block | block | block |
| **padding** | 16px 0px | 16px 0px | 16px 0px | 16px 0px |

### 2.17 Footer (e1060)

| 속성 | MOBILE | TABLET | DESKTOP | WIDE |
|------|--------|--------|---------|------|
| **width** | 843px | 1038px | 1155px | 1524px |
| **height** | 92px | 92px | 92px | 92px |
| **display** | block | block | block | block |
| **padding** | 8px 16px | 8px 16px | 8px 16px | 8px 16px |
| **fontSize** | 12px | 12px | 12px | 12px |
| **color** | rgb(95, 99, 104) | rgb(95, 99, 104) | rgb(95, 99, 104) | rgb(95, 99, 104) |

---

## 3. 인터랙티브 요소 상세 스타일

### 3.1 "목록에 추가" 버튼 (AddToListBtn)

```css
/* 기본 스타일 */
display: flex;
align-items: center;
gap: 8px;
padding: 8px 16px;
font-size: 14px;
font-weight: 500;
color: #1a73e8;
border: 1px solid #dadce0;
border-radius: 18px;
background-color: white;
cursor: pointer;
transition: background-color 0.2s;

/* 호버 상태 */
&:hover {
  background-color: #f8f9fa;
}

/* 아이콘 */
icon: add (Material Icons)
icon-size: 18px
```

### 3.2 차트 유형 버튼 (ChartTypeBtn)

```css
/* 기본 스타일 */
display: flex;
align-items: center;
gap: 6px;
padding: 8px 12px;
font-size: 12px;
color: #5f6368;
border: 1px solid #dadce0;
border-radius: 18px;
background-color: white;
cursor: pointer;

/* 호버 상태 */
&:hover {
  background-color: #f8f9fa;
}

/* 드롭다운 */
position: absolute;
top: 100%;
left: 0;
margin-top: 4px;
background: white;
border: 1px solid #dadce0;
border-radius: 12px;
box-shadow: 0 2px 6px rgba(0,0,0,0.1);
min-width: 120px;
z-index: 10;
```

### 3.3 비교 버튼 (CompareBtn)

```css
/* 기본 스타일 */
display: flex;
align-items: center;
gap: 6px;
padding: 8px 12px;
font-size: 12px;
color: #5f6368;
border: 1px solid #dadce0;
border-radius: 18px;
background-color: white;
cursor: pointer;

/* 호버 상태 */
&:hover {
  background-color: #f8f9fa;
}
```

### 3.4 지표 버튼 (IndicatorsBtn)

```css
/* 기본 스타일 */
display: flex;
align-items: center;
gap: 6px;
padding: 8px 12px;
font-size: 12px;
color: #5f6368;
border: 1px solid #dadce0;
border-radius: 18px;
background-color: white;
cursor: pointer;

/* 호버 상태 */
&:hover {
  background-color: #f8f9fa;
}
```

### 3.5 기간 탭 (PeriodTabs)

```css
/* 탭 컨테이너 */
display: flex;
gap: 4px;
padding: 8px 0px;

/* 개별 탭 */
padding: 8px 12px;
font-size: 12px;
color: #5f6368;
border-radius: 16px;
cursor: pointer;
transition: all 0.2s;

/* 선택된 탭 */
background-color: #e8eaed;
color: #1f1f1f;
font-weight: 500;

/* 호버 상태 */
&:hover:not(.selected) {
  background-color: #f8f9fa;
}
```

### 3.6 콘텐츠 탭 (ContentTabs)

```css
/* 탭 컨테이너 */
display: flex;
border-bottom: 1px solid #e8eaed;

/* 개별 탭 */
padding: 16px 24px;
font-size: 14px;
font-weight: 500;
color: #5f6368;
border-bottom: 2px solid transparent;
cursor: pointer;
transition: all 0.2s;

/* 선택된 탭 */
color: #1f1f1f;
border-bottom-color: #1a73e8;

/* 호버 상태 */
&:hover:not(.selected) {
  color: #1f1f1f;
}
```

### 3.7 설정 드롭다운 (SettingsDropdown)

```css
/* 드롭다운 메뉴 */
position: absolute;
top: 100%;
right: 0;
margin-top: 4px;
background: white;
border-radius: 20px;
box-shadow: 0 2px 8px rgba(0,0,0,0.15);
min-width: 200px;
padding: 8px 0;
z-index: 100;

/* 메뉴 항목 */
padding: 12px 16px;
font-size: 14px;
color: #1f1f1f;
cursor: pointer;
display: flex;
align-items: center;
gap: 12px;

/* 호버 상태 */
&:hover {
  background-color: #f8f9fa;
}

/* 섹션 구분 */
border-top: 1px solid #e8eaed;
margin: 4px 0;
```

---

## 4. 색상 팔레트

### 4.1 텍스트 색상

| 색상 | HEX | RGB | 용도 |
|------|-----|-----|------|
| **Primary Text** | #1f1f1f | rgb(31, 31, 31) | 종목명, 가격, 제목 |
| **Secondary Text** | #5f6368 | rgb(95, 99, 104) | 부가 설명, 시간, 라벨 |
| **Tertiary Text** | #9aa0a6 | rgb(154, 160, 166) | 구분선, 비활성 텍스트 |

### 4.2 상태 색상

| 색상 | HEX | RGB | 용도 |
|------|-----|-----|------|
| **Positive** | #0E9E4B | rgb(14, 158, 75) | 상승세, 긍정적 변동 |
| **Negative** | #FF4B4B | rgb(255, 75, 75) | 하락세, 부정적 변동 |
| **Neutral** | #5f6368 | rgb(95, 99, 104) | 중립적 변동 |

### 4.3 인터랙티브 색상

| 색상 | HEX | RGB | 용도 |
|------|-----|-----|------|
| **Primary** | #1a73e8 | rgb(26, 115, 232) | 링크, 선택된 탭, 버튼 |
| **Hover BG** | #f8f9fa | rgb(248, 249, 250) | 호버 배경 |
| **Active BG** | #e8eaed | rgb(232, 234, 237) | 선택된 탭 배경 |
| **Border** | #dadce0 | rgb(218, 220, 224) | 테두리, 구분선 |

### 4.4 배경 색상

| 색상 | HEX | RGB | 용도 |
|------|-----|-----|------|
| **Background** | #ffffff | rgb(255, 255, 255) | 메인 배경 |
| **Card BG** | #f8f9fa | rgb(248, 249, 250) | 카드, 섹션 배경 |
| **Chart BG** | #f7f8fa | rgb(247, 248, 250) | 차트 영역 배경 |

---

## 5. 타이포그래피

### 5.1 폰트 패밀리

```css
font-family: 'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 5.2 폰트 크기 스케일

| 크기 | 용도 | 예시 |
|------|------|------|
| **24px** | 현재가 | ₩2,912,000.00 |
| **16px** | 종목명, 탭 텍스트, 본문 | SK하이닉스, 개요 |
| **14px** | 버튼 텍스트, 부가 설명 | 목록에 추가, 상승세 전망 |
| **12px** | 차트 컨트롤, 기간 탭 | 영역, 1D, 5D |
| **11px** | 라벨, 타임스탬프 | 시가총액, 6월 22일 |

### 5.3 폰트 웨이트

| 웨이트 | 용도 | 예시 |
|--------|------|------|
| **500 (Medium)** | 종목명, 가격, 선택된 탭 | SK하이닉스, ₩2,912,000.00 |
| **400 (Regular)** | 본문, 라벨, 비활성 탭 | 시가총액, 개요 |

---

## 6. 간격 및 레이아웃

### 6.1 패딩 스케일

| 크기 | 용도 |
|------|------|
| **4px** | 컴팩트 간격 |
| **8px** | 버튼 내부 패딩, 탭 간격 |
| **12px** | 카드 패딩 |
| **16px** | 섹션 패딩, 페이지 사이드 패딩 |
| **24px** | 탭 내부 패딩 |

### 6.2 마진 스케일

| 크기 | 용도 |
|------|------|
| **0px** | 요소 간 간격 없음 |
| **4px** | 드롭다운 오프셋 |
| **8px** | 컴팩트 요소 간격 |
| **16px** | 섹션 간 간격 |
| **24px** | 큰 섹션 간 간격 |

### 6.3 보더 라디우스

| 크기 | 용도 | 예시 |
|------|------|------|
| **4px** | 미니멀 둥글기 | 입력 필드 |
| **8px** | 카드, 드롭다운 항목 | 뉴스 카드 |
| **12px** | 드롭다운 메뉴 | 차트 유형 드롭다운 |
| **16px** | 탭 배경 | 기간 탭 |
| **18px** | 버튼 (pill shape) | "목록에 추가" 버튼 |
| **20px** | 큰 드롭다운 메뉴 | 설정 드롭다운 |

---

## 7. 현재 구현 비교

### 7.1 완료된 요소

| 요소 | Google Finance 스타일 | 현재 구현 상태 | 차이점 |
|------|---------------------|---------------|--------|
| **Header** | flex, 80px 높이 | ✅ 구현됨 | 유사 |
| **LeftSidebar** | 232px (TABLET+) | ✅ 구현됨 | 유사 |
| **TopTabs** | MOBILE/TABLET만 표시 | ✅ 구현됨 | 유사 |
| **StockHeader** | 16px 폰트 | ✅ 구현됨 | 유사 |
| **AddToListBtn** | 18px pill shape | ✅ 구현됨 | 유사 |
| **ChartControls** | 3개 버튼 | ✅ 구현됨 | 유사 |
| **ChartSVG** | SVG 그래픽 | ✅ 구현됨 | 유사 |
| **PeriodTabs** | 8개 기간 | ✅ 구현됨 | 유사 |
| **ContentTabs** | 3개 탭 | ✅ 구현됨 | 유사 |
| **ContentPanel** | 개요 탭 내용 | ✅ 구현됨 | 유사 |

### 7.2 부분 구현된 요소

| 요소 | Google Finance 스타일 | 현재 구현 상태 | 필요한 작업 |
|------|---------------------|---------------|-----------|
| **AddToListBtn Dropdown** | 200px 드롭다운 | ❌ 미구현 | 드롭다운 메뉴 구현 |
| **SettingsDropdown** | 200px 드롭다운 | ❌ 미구현 | 설정 메뉴 구현 |
| **Footer** | 12px 텍스트 | ⚠️ 부분 구현 | 텍스트 추가 |

### 7.3 미구현 요소

| 요소 | Google Finance 스타일 | 현재 구현 상태 | 필요한 작업 |
|------|---------------------|---------------|-----------|
| **AI Module** | AI 전망 섹션 | ⚠️ 부분 구현 | 스타일 조정 |
| **KeyMetrics** | 3열 그리드 | ⚠️ 부분 구현 | 레이아웃 조정 |
| **RelatedStocks** | 4개 카드 | ⚠️ 부분 구현 | 레이아웃 조정 |
| **NewsSection** | 뉴스 기사 목록 | ⚠️ 부분 구현 | 스타일 조정 |
| **ProfileSection** | 기업 프로필 | ⚠️ 부분 구현 | 스타일 조정 |

---

## 8. 구현 가이드라인

### 8.1 CSS 변수 정의

```css
:root {
  /* 색상 */
  --color-primary: #1a73e8;
  --color-positive: #0E9E4B;
  --color-negative: #FF4B4B;
  --color-text-primary: #1f1f1f;
  --color-text-secondary: #5f6368;
  --color-text-tertiary: #9aa0a6;
  --color-border: #dadce0;
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #e8eaed;
  
  /* 간격 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  
  /* 보더 라디우스 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 18px;
  --radius-dropdown: 20px;
  
  /* 폰트 */
  --font-family: 'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 24px;
}
```

### 8.2 유틸리티 클래스

```css
/* 텍스트 */
.text-primary { color: var(--color-text-primary); }
.text-secondary { color: var(--color-text-secondary); }
.text-tertiary { color: var(--color-text-tertiary); }
.text-positive { color: var(--color-positive); }
.text-negative { color: var(--color-negative); }

/* 배경 */
.bg-primary { background-color: var(--color-bg-primary); }
.bg-secondary { background-color: var(--color-bg-secondary); }
.bg-tertiary { background-color: var(--color-bg-tertiary); }

/* 테두리 */
.border { border: 1px solid var(--color-border); }
.border-b { border-bottom: 1px solid var(--color-border); }

/* 둥글기 */
.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-xl { border-radius: var(--radius-xl); }
.rounded-pill { border-radius: var(--radius-pill); }
.rounded-dropdown { border-radius: var(--radius-dropdown); }
```

---

*문서 생성일: 2026-06-22*
*브라우저: Chrome (Playwright)*
*대상: Google Finance (000660:KRX SK하이닉스)*
