# Multi-Asset Comparison System Spec

## Overview
Users can add comparison tickers to overlay on the portfolio chart. Each comparison asset renders as a colored LineSeries sharing the same time axis.

## State
```typescript
interface ComparisonAsset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const [compareAssets, setCompareAssets] = useState<ComparisonAsset[]>([]);
const [showSearch, setShowSearch] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
```

## Controls Row
Renders above chart, positioned below period filter bar:

```
[비교] [선형/영역▼]
```

- `비교` button: opens comparison search modal
- `선형`/`영역` button: toggles chart type (open chart type selector modal)

## Comparison Search Modal
| Property | Mobile (< 760px) | Desktop (>= 760px) |
|---|---|---|
| Position | Centered modal | Tooltip near button |
| Overlay | `bg-black/30` full-screen | none |
| Card | `rounded-xl mx-4 bg-white` | `rounded-lg shadow-xl bg-white` |
| Width | `w-[calc(100%-32px)] max-w-[400px]` | auto |
| Close | X button top-right | Click outside |
| Search input | `border-b border-[#e8eaed] w-full text-[16px] p-2` | same |

### Search Behavior
- Input filters ticker array in real-time
- Suggestions from predefined ticker list
- Click ticker → add to `compareAssets` → close modal → chart re-renders with new series
- Deduplication: if ticker already in compareAssets, suggestion is hidden

### Predefined Search Tickers
```
[S&P 500: SPY, 나스닥: QQQ, 코스피: KOSPI, 코스닥: KOSDAQ, 
 한국채권: 148070, 미국채권: TLT, 금: GLD, 원/달러: KRW=X, 
 비트코인: BTC/USD]
```

## Chart Type Selector Modal
| Property | Mobile (< 760px) | Desktop (>= 760px) |
|---|---|---|
| Position | Centered modal | Tooltip near button |
| Overlay | `bg-black/30` | none |
| Options | 선형 (LineSeries), 영역 (AreaSeries) | same |
| Active | `bg-[#e8f0fe] text-[#1a73e8]` | same |

## Comparison Data Table
When `compareAssets.length > 0`, a comparison table renders below the chart.

| Column | Content |
|---|---|
| 자산 | Ticker + Name |
| 현재가 | Price |
| 변동 | Change (up/down with colored arrow) |
| 변동률 | Change% (colored) |
| 제거 | X button → removes from compareAssets |

### Responsive: Comparison Table
- Mobile (< 760px): Smaller font (text-[13px]), tighter padding
- Desktop (>= 760px): text-[14px], more spacing
- Header row: `border-b border-[#e8eaed]`
- Remove button: `hover:text-red-600` color

## Data Generation for Comparison
```typescript
function getComparisonSparkline(seed: number, length: number): number
```
- Non-parallel seed PRNG for deterministic pseudo-random data
- Each comparison gets unique data via seed + index
- Multiplier factor: accumulated base + random walk for realistic appearance
