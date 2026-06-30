# Period Filter System Spec

## Period Definitions (`PeriodFilter` type)

```typescript
type PeriodFilter = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | '최대';
```

## Period Spec Map

| Period | Display | Data Points | allowGaps | enableZeroAnchor | minPercent | maxPercent | Grid Interval |
|---|---|---|---|---|---|---|---|
| 1D | 1일 | ~42 (3분봉) | false | false | -0.5 | 0.5 | 1 hour |
| 5D | 5일 | ~60 (30분봉) | false | false | -2 | 2 | 1 day |
| 1M | 1개월 | ~22 (일봉) | false | false | -3 | 3 | 1 week |
| 6M | 6개월 | ~130 (일봉) | false | false | -5 | 5 | 1 month |
| YTD | 연초 | ~130 (일봉) | true | true | -10 | 10 | 1 month |
| 1Y | 1년 | ~250 (일봉) | true | true | -15 | 15 | 2 months |
| 5Y | 5년 | ~1250 (일봉) | true | true | -30 | 30 | 6 months |
| 최대 | 전체 | ~2500 (주봉) | true | true | -50 | 50 | 1 year |

### Axis Formatting
| Period | tickFormat |
|---|---|
| 1D | `%H:%M` |
| 1M–최대 | `%m/%d` |
| 5Y–최대 | `%Y` |

### allowGaps
When `true`: gaps allowed — time axis can show empty space between data points (non-uniform time scale).
When `false`: series data is padded to fill gaps — uniform time appearance.

### enableZeroAnchor
When `true`: Y-axis anchored at 0% — percentage change from period start, showing performance relative to start date.
When `false`: Y-axis auto-scales to data min/max with offset.

## Bar Buttons Row
- Horizontal scrollable row of period buttons
- Active period: blue underline + bold text (`border-[#1a73e8] text-[#1f1f1f]`)
- Inactive: transparent underline (`text-[#5f6368]`)
- Sizes: text-[14px], button height 28px
- Horizontal scroll container: `overflow-x-auto scroll-hide`
