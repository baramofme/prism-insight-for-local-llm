# Portfolio Chart System - Implementation Summary

## Multi-Asset Comparison & Period-Based Dynamic Chart

### Components
- **PortfolioChart**: TradingView lightweight-charts wrapper supporting multi-series (AreaSeries + LineSeries), period-driven axis scaling, zero-anchor normalization
- **MobilePortfolioDetail**: Full portfolio detail view with tabs, chart, comparison system, drawing tools
- **DrawingToolbar**: Left-side vertical toolbar with TrendLine, HorizontalLine, FibRetracement, Clear All, Lock

### States
- `mobileView`: "default" | "portfolio" - center content switching
- `period`: PeriodFilter (1D/5D/1M/6M/YTD/1Y/5Y/최대) - chart time range
- `compareAssets`: ComparisonAsset[] - multi-asset comparison list
- `chartType`: "area" | "linear" - chart style
- `currentTool`: string | null - active drawing tool
- `showSearch` / `styleOpen`: modal visibility toggles
- `drawingLocked`: drawing tool lock state

### Dependencies
- lightweight-charts@5.2.0
- lightweight-charts-react-components@2.4.0
- lightweight-charts-line-tools-core (GitHub: difurious/lightweight-charts-line-tools-core)

### Layout (Mobile < 760px / Desktop >= 760px)
- `< 760px`: Center-only layout, no sidebar/right panel, tab bar hidden
- `>= 760px`: Full 3-column layout, tab bar visible at top of portfolio detail
- Controls row (비교 + 선형/영역) above asset tokens
- Drawing toolbar on left of chart
- Period filter bar below chart
- Comparison data table (when compareAssets > 0)
- Holdings table at bottom

### Drawing Tools
- Uses `createLineToolsPlugin` from lightweight-charts-line-tools-core
- Tools: TrendLine, HorizontalLine, FibRetracement
- Serialization: localStorage save/load via `exportLineTools()`/`importLineTools()`
- Lock/unlock, clear all, auto-save on edit
