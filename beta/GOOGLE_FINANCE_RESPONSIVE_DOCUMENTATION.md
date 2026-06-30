# Google Finance Responsive Layout Documentation
## Stock Detail Page Analysis - 000660:KRX SK하이닉스

---

## 1. Breakpoint Definitions

| Breakpoint | Name | Viewport Width | CSS Width | Behavior |
|------------|------|----------------|-----------|----------|
| <760px | MOBILE | <843px | <760px | Full-screen, no panels |
| 760~935px | TABLET | 843~1038px | 760~935px | Left sidebar only |
| 936~1370px | DESKTOP | 1039~1523px | 936~1370px | Left + right panels, tabs hidden |
| ≥1371px | WIDE | ≥1524px | ≥1371px | Full layout, sidebar shifted |

---

## 2. MOBILE Breakpoint (<760px Viewport <843px)

### 2.1 Header Area (e3)
- **Position**: x=0, y=0, width=843, height=80
- **Content**:
  - Logo + "Google Finance 베타" link (x=0, y=27, w=232, h=26)
  - Search button (x=497, y=16, w=346, h=48)
  - Settings button (x=691, y=20, w=40, h=40)
  - Feedback button (x=735, y=20, w=40, h=40)
  - User profile button (x=783, y=20, w=40, h=40)
- **Visibility**: Always visible
- **Layout**: Horizontal flex

### 2.2 Left Sidebar (e89)
- **Position**: x=0, y=80, width=69, height=925
- **Content**: Icon-only navigation (목록, 투자중, 관심 목록, 주식 업종)
- **Visibility**: Hidden (collapsed to icons)
- **Width**: 69px (icon-only mode)

### 2.3 Main Content Area (e406)
- **Position**: x=80, y=80, width=763, height=920
- **Top Tabs (e1170)**:
  - Position: x=104, y=80, width=715, height=48
  - Content: "000660" (selected), "조사"
  - Visibility: **VISIBLE**
  - Tab height: 47px
  - Tab styling: underline indicator

### 2.4 Stock Header (e425)
- **Stock Name (e429)**: SK하이닉스 (x=104, y=188, w=452, h=26)
- **Price (e432)**: ₩2,904,000.00 (x=104, y=220, w=452, h=32)
- **Change (e438)**: +5.07% (x=314, y=223, w=67, h=26)
- **Timestamp (e443)**: 6월 22일, 오전 10시 30분 35초 UTC+9 · KRW
- **Add to List Button (e1176)**: "목록에 추가" (x=663, y=188, w=156, h=36)
  - Border radius: 18px (pill shape)
  - Background: white/light
  - Icon: "add" + text + dropdown arrow

### 2.5 Chart Area (e444)
- **Chart Controls (e446)**: x=112, y=278, width=294, height=48
  - Chart Type button: "영역" (x=112, y=286, w=94, h=32)
  - Compare button: "비교" (x=210, y=286, w=94, h=32)
  - Indicators button: "지표" (x=308, y=286, w=94, h=32)
- **Chart SVG (e486)**: x=117, y=340, width=689, height=201
- **Period Tabs (e702)**: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, 최대
  - Position: x=120, y=560, width=332, height=24
  - **Visibility**: **VISIBLE**

### 2.6 Content Tabs (e713)
- **Tab Container (e714)**: x=104, y=600, width=715, height=48
- **Tabs**: 개요 (selected), 실적, 금융
- **Visibility**: **VISIBLE**
- **Tab height**: 47px

### 2.7 Content Panel (e722 - "개요" tab)
- **AI Summary (e742)**: x=120, y=698, width=693, height=72
  - Text: SK Hynix는 AI 메모리 슈퍼사이클에 힘입어...
- **Key Metrics Grid (e780)**: x=104, y=709, width=715, height=204
  - Layout: 3 columns × 5 rows
  - Column width: ~225px each
- **Related Stocks (e830)**: x=104, y=946, width=715, height=188
  - Layout: 4 items horizontal
  - Card width: ~170px each
- **News Section (e894)**: x=104, y=1166, width=715, height=404
- **Profile Section (e978)**: x=104, y=1602, width=715, height=306

### 2.8 Footer (e3683)
- **Position**: x=0, y=968, width=843, height=32
- **Content**: AI 콘텐츠에는 오류가 있을 수 있습니다, 도움말, 의견 보내기, 개인 정보 보호, 약관, 면책 조항

### 2.9 Interactive Elements Tested
- **"목록에 추가" Button**: Click opens dropdown menu
  - Dropdown size: 220×160px
  - Border radius: 20px
  - Background: white
  - Items: 테마 (기기 기본값, 어두운 테마, 밝은 테마), 가격 색상 시스템 (현지 시장, 국제)

---

## 3. TABLET Breakpoint (760~935px Viewport 843~1038px)

### 3.1 Header Area (e3)
- **Position**: x=0, y=0, width=1038, height=80
- **Content**: Same as MOBILE
- **Visibility**: Always visible

### 3.2 Left Sidebar (e89)
- **Position**: x=0, y=80, width=232, height=925
- **Content**: Full sidebar with labels (목록, 투자중, 관심 목록, 주식 업종)
- **Visibility**: **VISIBLE** (expanded from MOBILE)
- **Width**: 232px (full mode)
- **Sections**:
  - 투자중 (x=0, y=137, w=69, h=52)
  - 관심 목록 (x=0, y=206, w=69, h=52)
  - 주식 업종 (x=0, y=275, w=69, h=572)

### 3.3 Main Content Area (e406)
- **Position**: x=80, y=80, width=958, height=920
- **Top Tabs (e1170)**:
  - Position: x=104, y=80, width=879, height=48
  - Content: "000660" (selected), "조사"
  - Visibility: **VISIBLE**
  - Tab width: 86px (000660), 58px (조사)

### 3.4 Stock Header (e425)
- **Stock Name (e429)**: SK하이닉스 (x=104, y=188, w=452, h=26)
- **Price (e432)**: ₩2,904,000.00 (x=104, y=220, w=452, h=32)
- **Change (e438)**: +5.07% (x=314, y=223, w=67, h=26)
- **Add to List Button (e1176)**: "목록에 추가" (x=883, y=188, w=156, h=36)
  - **Position shifted right** to accommodate sidebar

### 3.5 Chart Area (e444)
- **Chart Controls (e446)**: x=112, y=278, width=294, height=48
- **Chart SVG (e486)**: x=117, y=340, width=800, height=201
  - **Width increased** from 689px to 800px
- **Period Tabs (e702)**: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, 최대
  - Position: x=120, y=560, width=332, height=24
  - **Visibility**: **VISIBLE**

### 3.6 Content Tabs (e713)
- **Tab Container (e714)**: x=104, y=600, width=879, height=48
- **Tabs**: 개요 (selected), 실적, 금융
- **Visibility**: **VISIBLE**

### 3.7 Content Panel (e722 - "개요" tab)
- **AI Summary (e742)**: x=120, y=698, width=853, height=72
  - **Width increased** from 693px to 853px
- **Key Metrics Grid (e780)**: x=104, y=709, width=879, height=204
  - **Width increased** from 715px to 879px
- **Related Stocks (e830)**: x=104, y=946, width=879, height=188
  - **Width increased** from 715px to 879px
- **News Section (e894)**: x=104, y=1166, width=879, height=404
- **Profile Section (e978)**: x=104, y=1602, width=879, height=306

### 3.8 Right Panel (e1064)
- **Position**: x=0, y=1000, width=1038, height=0
- **Visibility**: **HIDDEN** (height=0)

### 3.9 Footer (e3683)
- **Position**: x=0, y=968, width=1038, height=32
- **Content**: Same as MOBILE

### 3.10 Key Differences from MOBILE
1. **Left sidebar expanded**: 69px → 232px
2. **Main content shifted right**: x=80 (same, but wider)
3. **Content width increased**: 715px → 879px
4. **Top tabs still visible**: Same behavior
5. **Right panel still hidden**: No change

---

## 4. DESKTOP Breakpoint (936~1370px Viewport 1039~1523px)

### 4.1 Header Area (e3)
- **Position**: x=0, y=0, width=1155, height=80
- **Content**: Same as MOBILE/TABLET
- **Visibility**: Always visible

### 4.2 Left Sidebar (e89)
- **Position**: x=0, y=80, width=232, height=925
- **Content**: Full sidebar with labels
- **Visibility**: **VISIBLE** (same as TABLET)
- **Width**: 232px

### 4.3 Main Content Area (e406)
- **Position**: x=232, y=80, width=923, height=920
  - **Shifted right** by 152px from TABLET (x=80 → x=232)
- **Top Tabs (e1170)**:
  - Position: x=256, y=80, width=676, height=0
  - Content: "000660", "조사"
  - Visibility: **HIDDEN** (height=0)
  - **Critical change**: Top tabs disappear at this breakpoint

### 4.4 Stock Header (e425)
- **Stock Name (e429)**: SK하이닉스 (x=256, y=188, w=452, h=26)
- **Price (e432)**: ₩2,904,000.00 (x=256, y=220, w=452, h=32)
- **Change (e438)**: +5.07% (x=466, y=223, w=67, h=26)
- **Add to List Button (e1176)**: "목록에 추가" (x=883, y=188, w=156, h=36)

### 4.5 Chart Area (e444)
- **Chart Controls (e446)**: x=264, y=278, width=294, height=48
- **Chart SVG (e486)**: x=269, y=340, width=663, height=201
  - **Width decreased** from 800px (TABLET) to 663px
- **Period Tabs (e702)**: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, 최대
  - Position: x=272, y=560, width=332, height=24
  - **Visibility**: **VISIBLE**

### 4.6 Content Tabs (e713)
- **Tab Container (e714)**: x=256, y=600, width=676, height=48
- **Tabs**: 개요 (selected), 실적, 금융
- **Visibility**: **VISIBLE**

### 4.7 Content Panel (e722 - "개요" tab)
- **AI Summary (e742)**: x=272, y=698, width=643, height=72
  - **Width decreased** from 853px (TABLET) to 643px
- **Key Metrics Grid (e780)**: x=256, y=709, width=676, height=204
  - **Width decreased** from 879px (TABLET) to 676px
- **Related Stocks (e830)**: x=256, y=946, width=676, height=188
  - **Width decreased** from 879px (TABLET) to 676px
- **News Section (e894)**: x=256, y=1166, width=676, height=404
- **Profile Section (e978)**: x=256, y=1602, width=676, height=306

### 4.8 Right Panel (e1064)
- **Position**: x=920, y=80, width=235, height=920
- **Content**: Research/analysis panel
- **Visibility**: **VISIBLE** (appears at DESKTOP)
- **Width**: 235px

### 4.9 Footer (e3683)
- **Position**: x=0, y=968, width=1155, height=32
- **Content**: Same as MOBILE/TABLET

### 4.10 Key Differences from TABLET
1. **Top tabs hidden**: Height=0 (most critical change)
2. **Right panel appears**: 0px → 235px
3. **Main content shifted right**: x=80 → x=232
4. **Content width decreased**: 879px → 676px
5. **Left sidebar unchanged**: Still 232px

---

## 5. WIDE Breakpoint (≥1371px Viewport ≥1524px)

### 5.1 Header Area (e3)
- **Position**: x=0, y=0, width=1533, height=80
- **Content**: Same as other breakpoints
- **Visibility**: Always visible

### 5.2 Left Sidebar (e89)
- **Position**: x=0, y=80, width=232, height=925
- **Content**: Full sidebar with labels
- **Visibility**: **VISIBLE** (same as DESKTOP)
- **Width**: 232px

### 5.3 Main Content Area (e406)
- **Position**: x=344, y=80, width=845, height=920
  - **Shifted right** by 112px from DESKTOP (x=232 → x=344)
  - **Content centered** in viewport
- **Top Tabs (e1170)**:
  - Position: x=368, y=80, width=676, height=0
  - Content: "000660", "조사"
  - Visibility: **HIDDEN** (same as DESKTOP)

### 5.4 Stock Header (e425)
- **Stock Name (e429)**: SK하이닉스 (x=368, y=188, w=452, h=26)
- **Price (e432)**: ₩2,904,000.00 (x=368, y=220, w=452, h=32)
- **Change (e438)**: +5.07% (x=578, y=223, w=67, h=26)
- **Add to List Button (e1176)**: "목록에 추가" (x=995, y=188, w=156, h=36)

### 5.5 Chart Area (e444)
- **Chart Controls (e446)**: x=376, y=278, width=294, height=48
- **Chart SVG (e486)**: x=381, y=340, width=580, height=201
  - **Width decreased** from 663px (DESKTOP) to 580px
- **Period Tabs (e702)**: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, 최대
  - Position: x=384, y=560, width=332, height=24
  - **Visibility**: **VISIBLE**

### 5.6 Content Tabs (e713)
- **Tab Container (e714)**: x=368, y=600, width=676, height=48
- **Tabs**: 개요 (selected), 실적, 금융
- **Visibility**: **VISIBLE**

### 5.7 Content Panel (e722 - "개요" tab)
- **AI Summary (e742)**: x=384, y=698, width=643, height=72
  - **Width same** as DESKTOP (643px)
- **Key Metrics Grid (e780)**: x=368, y=709, width=676, height=204
  - **Width same** as DESKTOP (676px)
- **Related Stocks (e830)**: x=368, y=946, width=676, height=188
  - **Width same** as DESKTOP (676px)
- **News Section (e894)**: x=368, y=1166, width=676, height=404
- **Profile Section (e978)**: x=368, y=1602, width=676, height=306

### 5.8 Right Panel (e1064)
- **Position**: x=1230, y=80, width=235, height=920
- **Content**: Research/analysis panel
- **Visibility**: **VISIBLE** (same as DESKTOP)
- **Width**: 235px

### 5.9 Footer (e3683)
- **Position**: x=0, y=968, width=1533, height=32
- **Content**: Same as other breakpoints

### 5.10 Key Differences from DESKTOP
1. **Main content centered**: x=232 → x=344 (shifted right 112px)
2. **Left sidebar position unchanged**: Still x=0
3. **Right panel position shifted**: x=920 → x=1230 (shifted right 310px)
4. **Content width same**: 676px (no change)
5. **Overall layout centered** in wider viewport

---

## 6. Element Comparison Matrix

### 6.1 Visibility by Breakpoint

| Element | MOBILE | TABLET | DESKTOP | WIDE |
|---------|--------|--------|---------|------|
| Header | ✅ | ✅ | ✅ | ✅ |
| Left Sidebar | ❌ (icons) | ✅ (232px) | ✅ (232px) | ✅ (232px) |
| Top Tabs | ✅ | ✅ | ❌ (height=0) | ❌ (height=0) |
| Stock Header | ✅ | ✅ | ✅ | ✅ |
| Add to List Button | ✅ | ✅ | ✅ | ✅ |
| Chart Controls | ✅ | ✅ | ✅ | ✅ |
| Chart SVG | ✅ | ✅ | ✅ | ✅ |
| Period Tabs | ✅ | ✅ | ✅ | ✅ |
| Content Tabs | ✅ | ✅ | ✅ | ✅ |
| Content Panel | ✅ | ✅ | ✅ | ✅ |
| Right Panel | ❌ (height=0) | ❌ (height=0) | ✅ (235px) | ✅ (235px) |
| Footer | ✅ | ✅ | ✅ | ✅ |

### 6.2 Width Changes

| Element | MOBILE | TABLET | DESKTOP | WIDE |
|---------|--------|--------|---------|------|
| Main Content Width | 763px | 958px | 923px | 845px |
| Content Area Width | 715px | 879px | 676px | 676px |
| Chart Width | 689px | 800px | 663px | 580px |
| AI Summary Width | 693px | 853px | 643px | 643px |
| Key Metrics Width | 715px | 879px | 676px | 676px |

### 6.3 Position Shifts (x-coordinate)

| Element | MOBILE | TABLET | DESKTOP | WIDE |
|---------|--------|--------|---------|------|
| Main Content x | 80 | 80 | 232 | 344 |
| Stock Name x | 104 | 104 | 256 | 368 |
| Chart x | 117 | 117 | 269 | 381 |
| Content Tabs x | 104 | 104 | 256 | 368 |
| Right Panel x | N/A | N/A | 920 | 1230 |

---

## 7. Interactive Elements Documentation

### 7.1 "목록에 추가" Button
- **All Breakpoints**: Visible, same size (156×36px)
- **Border Radius**: 18px (pill shape)
- **Background**: White/light
- **Icon**: "add" + text + dropdown arrow
- **Click Action**: Opens dropdown menu (220×160px)
- **Dropdown Content**:
  - 테마 (기기 기본값, 어두운 테마, 밝은 테마)
  - 가격 색상 시스템 (현지 시장, 국제)
- **Dropdown Styling**:
  - Border radius: 20px
  - Background: white
  - Shadow: subtle elevation

### 7.2 Chart Type Button
- **Label**: "영역" (Area)
- **Icon**: area_chart
- **Click Action**: Opens chart type selector (likely dropdown)

### 7.3 Compare Button
- **Label**: "비교" (Compare)
- **Icon**: stacked_line_chart
- **Click Action**: Opens comparison selector

### 7.4 Indicators Button
- **Label**: "지표" (Indicators)
- **Icon**: monitoring
- **Click Action**: Opens indicators selector

### 7.5 Period Tabs
- **Options**: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, 최대
- **Default**: 1D (selected)
- **Click Action**: Changes chart time period

### 7.6 Content Tabs
- **Options**: 개요, 실적, 금융
- **Default**: 개요 (selected)
- **Click Action**: Switches content panel

### 7.7 Settings Button
- **Icon**: settings
- **Click Action**: Opens settings dropdown
- **Dropdown Content**:
  - 테마 (기기 기본값, 어두운 테마, 밝은 테마)
  - 가격 색상 시스템 (현지 시장, 국제)

### 7.8 Search Button
- **Icon**: search
- **Placeholder**: "검색 또는 질문하기"
- **Click Action**: Opens search panel

---

## 8. Layout Behavior Summary

### 8.1 Mobile → Tablet (760px)
- **Left sidebar expands**: 69px (icons) → 232px (full labels)
- **Main content remains**: x=80 (no shift)
- **Content width increases**: 715px → 879px
- **Top tabs remain visible**: No change
- **Right panel remains hidden**: No change

### 8.2 Tablet → Desktop (936px)
- **Top tabs disappear**: Height=0 (most critical)
- **Right panel appears**: 0px → 235px
- **Main content shifts right**: x=80 → x=232
- **Content width decreases**: 879px → 676px
- **Left sidebar unchanged**: Still 232px

### 8.3 Desktop → Wide (1371px)
- **Main content centers**: x=232 → x=344
- **Right panel shifts right**: x=920 → x=1230
- **Content width unchanged**: 676px (no change)
- **Left sidebar unchanged**: Still 232px
- **Overall layout centers** in wider viewport

---

## 9. CSS Values Reference

### 9.1 Common Values
- **Header height**: 80px
- **Tab container height**: 48px
- **Tab height**: 47px
- **Button height**: 36px
- **Border radius (buttons)**: 18px (pill)
- **Border radius (dropdown)**: 20px
- **Font sizes**: 
  - Stock name: 16px
  - Price: 24px
  - Change percentage: 16px
  - Tab text: 14px
  - Button text: 14px

### 9.2 Spacing
- **Content padding**: 16px horizontal
- **Section spacing**: 24px vertical
- **Tab gap**: 8px between tabs
- **Card padding**: 16px

### 9.3 Colors
- **Background**: White (#FFFFFF)
- **Text primary**: Dark gray (#202124)
- **Text secondary**: Medium gray (#5F6368)
- **Positive change**: Green (#0D652D)
- **Negative change**: Red (#C5221F)
- **Tab indicator**: Blue (#1A73E8)
- **Button background**: White with border
- **Dropdown background**: White with shadow

---

## 10. Recommendations for Implementation

### 10.1 Breakpoint Constants
```typescript
const BREAKPOINTS = {
  MOBILE: 760,    // <760px: Full-screen, no panels
  TABLET: 936,    // 760~935px: Left sidebar only
  DESKTOP: 1371,  // 936~1370px: Left + right panels, tabs hidden
  WIDE: 1371,     // ≥1371px: Full layout, sidebar shifted
} as const;
```

### 10.2 Critical Behavior Changes
1. **760px**: Left sidebar expands (icons → full labels)
2. **936px**: Top tabs disappear, right panel appears
3. **1371px**: Content centers in viewport

### 10.3 Element Visibility Rules
- **Always visible**: Header, Stock Header, Chart, Period Tabs, Content Tabs, Content Panel, Footer
- **Conditional**: Left sidebar (TABLET+), Right panel (DESKTOP+), Top tabs (MOBILE/TABLET only)

### 10.4 Responsive Patterns
1. **Sidebar**: Expand/collapse at 760px
2. **Right panel**: Appear/disappear at 936px
3. **Content width**: Adjust based on available space
4. **Centering**: Content centers at 1371px+

---

## 11. Files to Modify

### 11.1 Primary File
- **`beta/src/app/dashboard/page.tsx`**: Main dashboard with StockDetail component

### 11.2 Key Sections
- **StockDetail component** (lines 1673-2290): Main responsive layout
- **calcPanelWidths function**: Panel width calculations
- **BREAKPOINTS constants**: Breakpoint definitions
- **All responsive CSS/styling logic**

### 11.3 Implementation Priority
1. Update BREAKPOINTS constants (already done)
2. Update calcPanelWidths function (already done)
3. Implement top tabs visibility toggle at 936px
4. Implement right panel visibility at 936px
5. Implement content centering at 1371px
6. Test all interactive elements at each breakpoint

---

## 12. Testing Checklist

### 12.1 Visual Testing
- [ ] MOBILE: Full-screen layout, no panels
- [ ] TABLET: Left sidebar expanded, content wider
- [ ] DESKTOP: Top tabs hidden, right panel visible
- [ ] WIDE: Content centered, panels shifted

### 12.2 Interactive Testing
- [ ] "목록에 추가" button opens dropdown at all breakpoints
- [ ] Chart type selector works at all breakpoints
- [ ] Compare selector works at all breakpoints
- [ ] Indicators selector works at all breakpoints
- [ ] Period tabs switch chart at all breakpoints
- [ ] Content tabs switch panels at all breakpoints
- [ ] Settings dropdown works at all breakpoints
- [ ] Search panel works at all breakpoints

### 12.3 Responsive Testing
- [ ] Resize from MOBILE → TABLET → DESKTOP → WIDE
- [ ] Resize from WIDE → DESKTOP → TABLET → MOBILE
- [ ] Verify no layout jumps or flickers
- [ ] Verify smooth transitions

---

*Document generated from Playwright investigation of Google Finance (000660:KRX)*
*Date: 2026-06-22*

---

## 13. Update (2026-06-25) — Beta Layout Is Now Default

> Live `www.google.com/finance/quote/000660:KRX` **redirects to `/finance/beta/quote/...`**. The beta layout is the default (classic/beta toggle still in header). Sections 1–12 (2026-06-22) are retained as the **classic-layout** reference. Verified deltas below (Playwright; viewports 700 / 1280 / 1500).

### 13.1 What still holds (macro responsive behavior)
- **WIDE (≥1371px)**: main content still centers at **x≈344** (matches §5.3), left sidebar expanded (~232–286px). ✓
- 4-breakpoint model (MOBILE/TABLET/DESKTOP/WIDE) and the "sidebar expands at 760 / right panel at 936 / content centers at 1371" pattern remains broadly valid.

### 13.2 What changed in beta
| Item | Classic (§1–12) | Beta (live 2026-06-25) |
|------|-----------------|------------------------|
| **MOBILE sidebar** | 69px icon-only rail; content x=80 | **Fully hidden**; content **x=16** (full-width, 16px padding) |
| **MOBILE top tabs (조사)** | Visible | Not shown as before |
| **Header** | 80px, border-bottom 1px #e8eaed | 80px, **position: fixed, no border-bottom** |
| **Vertical rhythm** | name y=188, period y=560, tabs y=600 | **More compact**: name y≈128, period y≈500, tabs y≈554 |
| **Semantic landmarks** | (implied) | No `<header>/<nav>/<main>/<footer>` — all divs |
| **ref (eNN) IDs** | listed | **Volatile — do not rely on them** |

### 13.3 Color reference correction (§9.3)
KRX live default uses **local-market (Korea) colors**, not the international palette:

| | Live beta (KRX local default) | §9.3 old value |
|--|------------------------------|----------------|
| **Positive (up)** | **#C0151D** rgb(192,21,29) — RED | Green #0D652D ❌ |
| **Negative (down)** | **#3364F0** rgb(51,100,240) — BLUE | Red #C5221F ❌ |
| Text primary | **#0a0a0a** | #202124 |
| Text secondary | **#444746** | #5F6368 |
| Tab indicator (selected period) | bg **#E9EBF0**, radius **8px** | — |

→ Implementation must branch the up/down colors by **price-color system (local vs international)**; do not hardcode green-up/red-down for KRX.

### 13.4 Period tabs
`1D 5D 1M 6M YTD 1Y 5Y 최대` — 8 tabs, unchanged. ✓

*Update date: 2026-06-25 · Beta layout (`/finance/beta`) · Playwright (700/1280/1500)*
