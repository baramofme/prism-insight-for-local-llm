# Index Cards, Mobile Summary & Stock Tables Spec

## Index Cards

Rendered above scrollable content in the default view.

### Data
```typescript
interface IndexCardData {
  name: string;
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
}
const indices: IndexCardData[] = [
  { name: 'S&P 500', price: '5,654.72', change: '+15.88', changePercent: '+0.28%', up: true },
  { name: 'KOSPI', price: '2,745.83', change: '-12.35', changePercent: '-0.45%', up: false },
  { name: 'KOSDAQ', price: '864.21', change: '+3.21', changePercent: '+0.37%', up: true },
  { name: '원/달러', price: '1,312.50', change: '-4.20', changePercent: '-0.32%', up: false },
];
```

### Layout
| Property | Mobile (< 760px) | Desktop (>= 760px) |
|---|---|---|
| Grid | `grid-cols-2` | `grid-cols-4` |
| Gap | `gap-2` | `gap-3` |
| Card padding | `px-2 py-2.5` | `px-3 py-3` |

### Card Content
- **Title row**: `text-[11px] text-[#5f6368]` (mobile), `text-[12px]` (desktop)
- **Price**: `text-[14px]` (mobile), `text-[16px]` (desktop), `font-semibold`
- **Change row**: change text + changePercent
  - Up: `text-[#d93025]` (Korean red = up)
  - Down: `text-[#1a73e8]` (Korean blue = down)
- **Chart mini line**: small sparkline (spacer)
- **Chart gap**: `mt-0.5` (mobile), `mt-1` (desktop)
- **Abs change display**: hidden at < 760px (change percent only shown)

## Mobile Portfolio Summary Component

**Renders at:** `vp < 760` — portfolio summary card + watchlist table (between index cards and market summary)

### Portfolio Summary Card
```
총 평가금액: ₩52,340,000
평가손익: +₩1,234,567 (+5.42%)
```
- Text: `text-[13px]` with bold labels
- Border: `rounded-xl border border-[#e8eaed]`
- Clickable row: navigates to portfolio detail

### Watchlist Table
| Column | Content |
|---|---|
| 종목 | Name + Ticker |
| 현재가 | Price |
| 변동률 | Change% colored |
| 수익률 | Return% colored |

- Rows clickable → navigates to portfolio detail
- Bottom "내 포트폴리오 더보기 >" link

## News Section

| Property | Mobile (< 760px) | Desktop (>= 760px) |
|---|---|---|
| Items | max 4 | max 6 |
| Grid | `grid-cols-1` | `grid-cols-2` |
| "더보기" button | hidden | visible |

### News Item Layout
- Image: `rounded-md w-full h-28 object-cover`
- Title: `text-[14px]` mobile, `text-[15px]` desktop, `font-medium`
- Source + time: `text-[12px] text-[#5f6368]`

## Bottom Stock Ranking Tables

| Property | Mobile (< 760px) | Desktop (>= 760px) |
|---|---|---|
| Layout | `flex flex-col` vertical | `grid grid-cols-2` side-by-side |
| Title | `text-[20px]` | `text-[22px]`|

### Table Columns
**인기**: 1순위, 2순위, 3순위... (Popularity rank)
**상승**: 종목명, 현재가, 변동률 (Top gainers)
**하락**: 종목명, 현재가, 변동률 (Top losers)
