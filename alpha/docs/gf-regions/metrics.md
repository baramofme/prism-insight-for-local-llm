# Metrics — GF Measurement Spec

## Status: NEEDS FURTHER MEASUREMENT
The metrics section (market cap, EPS, PER, etc.) was not captured by gf-tagger.js
`__gfSrc('gf-main-metrics')` returned "(없음)" — no matching element found.

## What We Know
- GF displays financial metrics below the chart area in the Overview tab
- Content includes: Market cap, EPS, PE ratio, Dividend yield, etc.
- The tagger's sub-region matcher for `gf-main-metrics` looks for "시가총액" or "시가"
- On English GF, these labels may be different (e.g., "Market cap")

## Next Steps
- Check full-page screenshots in `docs/gf-shots/` for metrics visibility
- Re-measure if needed with English text matchers
- Will likely be a grid layout with label-value pairs (similar to current alpha key-metrics)
