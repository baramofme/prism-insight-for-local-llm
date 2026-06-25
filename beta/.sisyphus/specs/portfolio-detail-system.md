# Portfolio Detail System Spec

## Component: MobilePortfolioDetail

**Purpose:** Full portfolio detail view for a selected portfolio from the watchlist. Renders in center area when `mobileView === "portfolio"`.

**Availability:** 
- Desktop (>= 760px): Tab bar visible, portfolio detail shown in center column with sidebar + right panel
- Mobile (< 760px): Tab bar hidden, portfolio detail takes full viewport width

**Prop:** `onBack: () => void` - resets `mobileView` to "default"

## Tab Bar (visible only at >= 760px)
```
[ 포트폴리오 | 조사 ]
```

| Property | Desktop (>= 760px) |
|---|---|
| Display | visible |
| Style | `border-b border-[#e8eaed]` |
| Active tab | `border-[#1a73e8] text-[#1f1f1f]` |
| Inactive tab | `border-transparent text-[#5f6368]` |

## Portfolio Tab Content

### Navigation Breadcrumb
```
홈 | 투자중
```
- "홈" link: calls `onBack` → `setMobileView("default")`
- "|" separator: `#5f6368`
- "투자중": bold, `#1f1f1f`

### Portfolio Summary Card
| Field | Format | Example |
|---|---|---|
| 총 평가손익 | `+/-₩XXX,XXX` colored text | `+₩1,234,567` |
| 수익률 | `+/-X.XX%` colored text | `+5.42%` |
| 총 평가금액 | `₩XX,XXX,XXX` | `₩52,340,000` |
| 매수금액 | `₩XX,XXX,XXX` | `₩48,950,000` |

Colors: positive = `#d93025` (red/up in Korean convention), negative = `#1a73e8` (blue/down)

### Period Filter Bar
Horizontal scrollable row: `[1일│5일│1개월│6개월│연초│1년│5년│최대]`
- Scrollable via `overflow-x-auto scroll-hide`
- Active filter: underline indicator

### Controls Row (above chart)
`[비교] [선형/영역▼]`
- `비교`: opens search modal for multi-asset comparison
- `선형`/`영역`: opens chart type selector popover

### Drawing Toolbar (left of chart)
Vertical column: `[╱] [―] [Fib] [✕] [🔒]`
- Each tool button with label to the right
- Active tool highlighted blue
- Lock button red when locked

### Portfolio Chart
- AreaSeries or LineSeries depending on chartType
- Multi-asset comparison overlays
- No-axis data display
- Height: `flex-1` within container

### Holdings Table
| Column | Content |
|---|---|
| 종목명 | Ticker + Name |
| 현재가 | Price |
| 변동 | Change |
| 변동률 | Change% |
| 평가손익 | Profit/Loss |
| 수익률 | Return% |
| 비중 | Weight% |

- Header row only
- Each row: `border-b border-[#e8eaed]` with last row being summary row (합계)
- Text sizes: `text-[13px]` mobile, `text-[14px]` desktop

## Research Tab Content ("조사")
- Placeholder state: 비어 있음

## Mobile Viewport Behavior (< 760px)
- Portfolio detail takes full width (no left/right panels)
- Tab bar completely hidden — portfolio is always shown
- Back navigation via "홈" breadcrumb link
- Even when `mobileView === "portfolio"`, the mobile sidebar (hamburger) remains accessible
