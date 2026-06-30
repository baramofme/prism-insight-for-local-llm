# Chart System Spec (TradingView lightweight-charts)

## Dependency Versions
- `lightweight-charts@5.2.0`
- `lightweight-charts-react-components@2.4.0`
- `lightweight-charts-line-tools-core` (GitHub: difurious/lightweight-charts-line-tools-core, via npm install)

## Chart Component: PortfolioChart

**File:** `page.tsx` (inline component, ~line 1172)

### Props
```typescript
interface PortfolioChartProps {
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  compareAssets: ComparisonAsset[];
  onAddComparison: () => void;
  chartType: 'linear' | 'area';
  onChartTypeChange: (t: 'linear' | 'area') => void;
  currentTool: string | null;
  setCurrentTool: (t: string | null) => void;
  drawingLocked: boolean;
  setDrawingLocked: (v: boolean) => void;
}
```

### Refs
- `chartApiRef`: stores `ChartApi` from `onInit` callback (TradingView chart instance)
- `seriesApiRef`: stores series API from `<AreaSeries>`/`<LineSeries>` `ref.api()`
- `lineToolsRef`: stores line tools plugin instance

### Series Rendering

| Asset Type | Series Type | Period | Config |
|---|---|---|---|
| Primary (index 0) | AreaSeries | All | allowGaps: true |
| Primary (index 0) | LineSeries | All | allowGaps: true (when chartType='linear') |
| Comparison (index 1+) | LineSeries | All | color: #8e24aa, lineWidth: 2, pointMarkersVisible: false, allowGaps: true |

**Comparison series colors cycle:**
```
['#8e24aa', '#e67c26', '#2e7d32', '#c62828', '#1565c0', '#6a1b9a', '#00838f', '#f57c00']
```

### Chart Layout
- Height: `100%` of parent container with flex column
- Header row: chart type toggle + comparison button
- Chart area: flex-1 with `key={period}` to force re-mount on period change

### Chart Configuration
```typescript
{
  layout: { background: { type: ColorType.Solid, color: 'transparent' } },
  rightPriceScale: { visible: true, borderColor: '#e8eaed', scaleMargins: { top: 0.1, bottom: 0.05 } },
  timeScale: { visible: true, borderColor: '#e8eaed' },
  crosshair: { mode: CrosshairMode.Normal },
  grid: { vertLines: { visible: false }, horzLines: { color: '#f0f0f0' } },
}
```

### Data Generation
- `useGenerateChartData(period)` creates price data per period spec
- Prices scaled to portfolio value (~50M–55M KRW)
- YTD/1Y/5Y/최대: zero-anchor Y-axis (enableZeroAnchor: true)
- 1D/5D/1M/6M: auto-scale Y-axis (enableZeroAnchor: false)
- Comparison data scaled relatively using `getComparisonSparkline()`
