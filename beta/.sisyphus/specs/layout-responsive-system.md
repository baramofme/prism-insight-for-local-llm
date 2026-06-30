# Layout & Responsive System Spec

## Viewport Breakpoints

| Breakpoint | Condition | Behavior |
|---|---|---|
| Mobile | < 760px | Full-width center only. Left sidebar hidden (mobile sidebar via hamburger). Right panel hidden. Desktop sidebar not rendered. |
| Tablet narrow | 760–1039px | Left sidebar visible (collapsed: 80px or expanded: 324px). Right panel hidden (rightW=0) when sidebar expanded. Center fills remaining. |
| Tablet wide | 1040–1379px | Left sidebar: collapsed=80px, normal=324px. Right panel visible (min 344px). Center: max 800px. |
| Desktop | 1380–1479px | Left sidebar: 324px. Right panel: max(344, vp-324-center). Center: min(800, vp-668). |
| Desktop wide | 1480–1679px | Left: 324px. Center: 712px. Right: vp-1036. |
| Desktop XL | 1680+ | Left: 324px. Center: 800px. Right: min(vp-1124, 700). |

## 3-Column Layout Formula

```
leftW + centerW + rightW = viewport width
```

- `leftW` depends on sidebar mode: collapsed=80, normal/hover=324, expanded=324 (fixed overlay)
- `centerMaxW` caps center width: 712 (1480-1679) or 800 (else)
- `rightW` minimum: 344px, maximum: 700px (at 1680+)

## Center Content Modes

| Mode | Trigger | Content |
|---|---|---|
| Default | `mobileView === "default"` | Region tabs, index cards, portfolio summary, market summary, news, stock rankings |
| Portfolio Detail | `mobileView === "portfolio"` | `MobilePortfolioDetail` component (tab bar hidden < 760px, visible >= 760px) |

## Sidebar Modes
- `collapsed`: 81px, minimal icons
- `hover`: 324px, shadow overlay, auto-collapse on mouse leave
- `normal`: 324px, static in flex flow, `flex-shrink-0`
- `expanded`: 880px, `fixed top-[64px] left-0 bottom-0 z-50` overlay

## Portfolios and Holdings
The portfolio detail view replaces the default center content when the user clicks on the "투자중" portfolio row.

## Header
- Grid layout: `324px 1fr auto`
- Mobile hamburger: `md:hidden`
- Search bar: hidden on mobile, full-width on desktop
- User avatar: always visible

## Footer
- Sticky footer, border-top
- AI disclaimer + links (도움말, 피드백, 개인정보처리방침, 이용약관, 면책조항)
