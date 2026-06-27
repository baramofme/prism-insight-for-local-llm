# Tabs — GF Measurement Spec

## Period Tabs (Stock Chart Period Selector)
- Container: `<div class="mmIeZd l8C4ve" role="tablist">`
- Items: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX

### Typography
| State | Size | Weight | Color |
|---|---|---|---|
| Active (selected) | 12px | 500 | #0A0A0A |
| Inactive | 12px | 400 | #56595E |

### Active Indicator
- Not bg fill — likely bottom border or underline (not measured via computedStyle)
- Selected tab has `aria-selected="true"`
- No background color on active (text-only differentiation)

### Spacing
- Inline/flex layout with gap
- Individual tab padding: (need measurement from DevTools)

## Content Tabs (Overview / Earnings / Financials)
- Items: Overview, Earnings, Financials (3 items)
- All tabs same font regardless of state

### Typography
| State | Size | Weight | Color |
|---|---|---|---|
| Active | 14px | 400 | #000000 |
| Inactive | 14px | 400 | #000000 |

### Active Indicator
- **Bottom border underline** (NOT bg fill like shadcn)
- All items same font/color — only visual differentiator is the underline
- No background color on TabsList (GF has transparent bg, unlike shadcn `bg-muted`)

## GF vs Current Alpha (shadcn)

| Aspect | GF | Alpha (shadcn) |
|---|---|---|
| Period tab style | Text-only, active=bold(500)/darker | ToggleGroup outline variant with border+shadow |
| Period tab active | font-weight 500 + color #0A0A0A | bg-accent fill |
| Content tab list bg | transparent | bg-muted (gray background) |
| Content tab active | bottom-border underline | bg-background fill + shadow-sm |
| Content tab font | all same size/weight/color | text-muted-foreground (inactive) vs foreground (active) |
