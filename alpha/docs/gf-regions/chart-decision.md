# Chart Library Decision — KEEP Recharts

**Date:** 2026-06-27
**Component:** `alpha/src/features/finance/components/price-chart.tsx`
**Decision:** KEEP Recharts

---

## Comparison Table

| Dimension | Recharts | lightweight-charts | Winner |
|-----------|----------|-------------------|--------|
| **Bundle size (minified)** | ~208 KB (incl. d3) | ~76 KB | lightweight-charts |
| **Bundle size (gzipped)** | ~59 KB | ~19 KB | lightweight-charts |
| **Already in project?** | Yes (`^2.15.4`) | No | **Recharts** |
| **Marginal cost for this chart** | **0 bytes** (already loaded) | +76 KB new dependency | **Recharts** |
| **Rendering engine** | SVG | Canvas | Depends on use case |
| **TypeScript support** | Community (@types/recharts) | Official, built-in | lightweight-charts |
| **GitHub stars** | ~46k | ~26k | Recharts |
| **Release frequency** | Monthly+ | Weekly+ | lightweight-charts |
| **Tree-shaking** | Partial (d3 limits it) | Good | lightweight-charts |
| **shadcn/ui integration** | Native via `ChartContainer` | None (custom wrapper needed) | **Recharts** |
| **Theme system compatibility** | CSS variable theming (light/dark) | Programmatic API only | **Recharts** |
| **Financial chart features** | Area/Line/Bar/Candlestick | Candlestick, OHLCV, volume, markers, scale precision | lightweight-charts |
| **Static rendering suitability** | Excellent (no animation = instant render) | Overkill (designed for live data) | **Recharts** |

## GF Feature Mapping

| GF Requirement | Current Implementation | Status |
|----------------|----------------------|--------|
| Gradient fill (stroke color to transparent) | `<linearGradient>` with 0.25 opacity at top, 0 at bottom | Already implemented |
| Line stroke width 2px | `strokeWidth={2}` | Matches |
| KRX color convention (up=red #C0151D, down=blue #3364F0) | `changeHex(up ? 1 : -1)` | Matches |
| Y-axis auto domain (min*0.998, max*1.002) | Custom `<YAxis domain={[...]} hide />` | Matches |
| No animation | `isAnimationActive={false}` | Matches |
| Fixed height ~240px | `h-[240px] w-full` on ChartContainer | Matches |
| Hidden axes, clean appearance | `hide` on YAxis, no XAxis rendered | Matches |
| Responsive width | `ResponsiveContainer` via ChartContainer | Matches |

All GF chart features are already correctly implemented with Recharts. Zero gaps remain.

## Decision: KEEP Recharts

### Rationale

1. **Zero marginal bundle cost.** Recharts is already a dependency used by 4 components (`area-graph.tsx`, `bar-graph.tsx`, `pie-graph.tsx`, `price-chart.tsx`). Adding lightweight-charts would add ~76 KB of new JavaScript to every page load, even for pages that don't use the stock detail view.

2. **Static rendering doesn't need canvas.** The price chart renders once per period tab click with `isAnimationActive={false}` — there's no live data streaming, zoom/pan interaction, or crosshair overlay. Canvas (lightweight-charts' advantage) provides zero benefit for this static use case. SVG (Recharts) is perfectly adequate and actually sharper at typical screen resolutions.

3. **shadcn/ui ecosystem integration.** The `ChartContainer` wrapper from shadcn/ui provides theme-aware CSS variable injection, responsive container, and context-based config management. Switching to lightweight-charts would require building a custom React wrapper from scratch, losing dark-mode auto-theming, and duplicating infrastructure we already have.

4. **No financial-specific features needed.** We're rendering a single-price-area line — not candlesticks, volume bars, moving averages overlays, or multi-scale axes. lightweight-charts excels at those; our chart doesn't need them.

5. **TypeScript coverage is sufficient.** While Recharts uses community types (`@types/recharts`), they cover all components we use (`Area`, `AreaChart`, `YAxis`). No type errors exist in the current implementation.

6. **Maintenance burden.** Adding a new chart library means: maintaining two chart stacks, documenting both APIs, handling two sets of breaking changes, and potentially migrating other charts later if lightweight-charts proves better elsewhere.

### When lightweight-charts WOULD be the right choice

- Live streaming price data (>1 update/sec)
- Interactive zoom/pan/crosshair on large datasets (10k+ points)
- Candlestick + volume + indicator overlays
- Multi-timeframe drill-down
- Real-time WebSocket-driven updates

None of these apply to this static stock detail view.

## Conclusion

Recharts is the correct choice for this component. The current implementation is GF-aligned across all measured dimensions. No code changes are required.
