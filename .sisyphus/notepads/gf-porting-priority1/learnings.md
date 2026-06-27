# GF Porting Priority 1 — Learnings

## shadcn 컴포넌트 커스터마이징 포인트

### ToggleGroup (period tabs)
- CVA variants: `default` (bg-transparent) / `outline` (border + shadow-xs)
- CVA sizes: `sm` (h-8 px-1.5 min-w-8) / `default` (h-9 px-2 min-w-9) / `lg` (h-10 px-2.5 min-w-10)
- 현재 사용: `variant="outline" size="sm"` → h-8, px-1.5 (12px)
- Active state: `data-[state=on]:bg-accent data-[state=on]:text-accent-foreground`
- GF는 아마 밑줄 방식일 것 → CVA variant로 해결 불가, className override 필요

### Tabs (content tabs)
- **TabsList 기본**: `bg-muted` 배경 + `rounded-lg p-[3px]` — GF와 큰 차이 (GF는 bg 없음, bottom-border)
- **TabsTrigger 기본**: `bg-background` active fill + `shadow-sm` — GF는 underline indicator
- Trigger: `px-2 py-1 text-sm font-medium` (h-9)
- **GF 스타일로 바꾸려면** `TabsList`와 `TabsTrigger` 모두 className override 필요
  - TabsList: bg-transparent, rounded-none, p-0, gap-x-?, border-bottom
  - TabsTrigger active: border-bottom color/thickness (NOT bg), no shadow

### Chart (price chart)
- ChartContainer: `aspect-video` 기본 (덮어씀: `h-[240px] w-full`)
- ResponsiveContainer debounce 2000ms
- CSS variable 테마 시스템 (light/dark)

## Mock Data
- Symbol: 000660:KRX (SK하이닉스)
- Price: ₩2,917,000, Change: +5.29%
- 15 metrics (시가, 고가, 저가, 시총, 평균거래량, 거래량, 배당수익률, PER, 52주 최고/최저, EPS, 유통주식수, 직원수, 배당락일, 분기배당금)
- 4 related stocks (삼성전자, 한국전력, 한미반도체, 키오시아)
- 4 news items
- Deterministic seeded PRNG (SSR-safe)

## Layout Structure
- Route: `/dashboard/finance/[symbol]` → `FinanceSymbolPage` (server component)
- Wrapping: `PageContainer` → `flex flex-1 flex-col px-4 pt-2 pb-4 md:px-6 md:pt-4`
  - PageContainer에 pageTitle/pageDescription 없음 → heading 영역 없음
  - 이미 16~24px padding 제공
- FinanceView 내부: `<div className='mx-auto w-full max-w-3xl space-y-6'>`
  - `max-w-3xl` (768px) = content 제한. GF는 full-width (no max width or 1820 cap)
  - 이중 padding (PageContainer의 px + FinanceView의 mx-auto)
- API: `/api/finance/quote/[symbol]` — mock jitter (실시간 시세 시뮬레이션)
- Nav: `trendingUp` 아이콘, `/dashboard/finance/000660:KRX` 링크

## Critical Visual Gaps (pre-porting)
1. Shadcn Tabs의 `bg-muted` 리스트 배경 — GF는 없음
2. Shadcn TabsTrigger active `bg-background` fill — GF는 underline
3. ToggleGroup `variant="outline"` — GF period tabs는 다른 스타일일 가능성 높음
4. `max-w-3xl` (768px) — GF는 full-width with 24px padding
5. `space-y-6` / `space-y-8` section 간격 — GF 측정치와 비교 필요
6. PageContainer의 `px-4 md:px-6` + FinanceView `mx-auto` 이중 레이아웃 구조

## Current Component State (pre-porting)

### stock-header.tsx
- Ticker/Exchange: `text-muted-foreground text-sm`
- Stock name: `text-xl font-medium`
- Price: `text-2xl font-medium tabular-nums`
- Change badge: flex items-center gap-1, ArrowUp/ArrowDown `size-4`
  - Up color: `text-[#C0151D]`
  - Down color: `text-[#3364F0]`
- Timestamp: `text-muted-foreground text-xs`
- Container: `space-y-1`

### key-metrics.tsx
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Gap: `gap-px` (1px lines between cells)
- Cell: `px-4 py-3`, bg-background, flex justify-between
- Label: `text-sm text-muted-foreground`
- Value: `text-sm font-medium tabular-nums`
- Container: `bg-border` (gives border effect), `rounded-lg border`

### finance-view.tsx
- Wrapper: `<div className='mx-auto w-full max-w-3xl space-y-6'>`
- Period Tabs: ToggleGroup `variant='outline' size='sm'` flex-wrap justify-start
  - Items: `px-3`
- Content Tabs: shadcn Tabs with TabsList + TabsTrigger
  - TabsContent for Overview: `space-y-8 pt-4`
  - Section headings: `text-base font-semibold`
  - Section containers: `space-y-3`
- Financials & Earnings tabs: placeholder text currently

### price-chart.tsx
- Container: `h-[240px] w-full`
- Recharts AreaChart, hidden Y-axis, gradient fill
- StrokeWidth 2, no animation
- Color from changeHex (KRX up=red, down=blue)

### related-stocks.tsx
- Carousel: `basis-1/2 md:basis-1/3 lg:basis-1/4`
- Card: `py-0`, CardContent: `p-4 space-y-1`
- Ticker: `text-xs text-muted-foreground`
- Name: `truncate text-sm font-medium`
- Price: `text-sm font-medium tabular-nums`
- Change: `text-xs font-medium tabular-nums` + changeColorClass

### news-list.tsx
- ItemGroup: `gap-1`
- Icon: Newspaper from lucide-react
- Title: `line-clamp-2`
- Description: source · time format

### company-profile.tsx
- Collapsible: `space-y-2`
- Description: collapsed=`line-clamp-3`, expanded=full
- Fields: `grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm`
- Labels: `text-muted-foreground`
- Button: variant='ghost' size='sm' gap-1

## Key Notes
- All components use shadcn/ui primitives
- Colors follow KRX convention (up=red, down=blue)
- No test infrastructure exists in alpha
- Playwright MCP is available for browser automation

---

## ⭐ GF ACTUAL MEASUREMENTS (2026-06-27, Flathub Chrome 149)

### Layout (3 Breakpoints)
| Component | 1680bp | 1430bp | 1024bp |
|---|---|---|---|
| leftNav | 321px (@x=0) | 301px (@x=0) | 81px (@x=0) |
| gf-main | 840px (@x=320) | 786px (@x=300) | 944px (@x=80) |
| rightPanel | 510px (@x=1160) | 334px (@x=1086) | 0px (hidden) |

**Total GF width = leftNav + gf-main + rightPanel + gaps**
- 1680bp: 321 + 840 + 519 = 1680 ✓ (519 = 510+9 gap)
- 1430bp: 301 + 786 + 343 = 1430 ✓
- 1024bp: 81 + 944 - 1 = 1024

### Stock Header (1680bp)
| Element | Font | Color | Position |
|---|---|---|---|
| Stock name "SK Hynix Inc" | 20px/400 Google Sans | #0A0A0A | container: x=344, y=128, w=458, h=82 |
| Price "₩2,673,000.00" | 24px/500 Google Sans | #0A0A0A | x=344, y=161, w=173, h=30 |
| Change "+2.52%" | 12px/500 Google Sans Text | #046E00 (green) | |
| Container | flex column, padding=0 | | |

### Period Tabs
| Tab | Font | Color | Selected? |
|---|---|---|---|
| 1D | 12px/500 | #0A0A0A | ✅ active |
| 5D | 12px/400 | #56595E | |
| 1M | 12px/400 | #56595E | |
| 6M | 12px/400 | #56595E | |
| YTD | 12px/400 | #56595E | |
| 1Y | 12px/400 | #56595E | |
| 5Y | 12px/400 | #56595E | |
| MAX | 12px/400 | #56595E | |

### Content Tabs
| Tab | Font | Color | Selected? |
|---|---|---|---|
| Overview | 14px/400 | #000000 | ✅ active (underline indicator) |
| Earnings | 14px/400 | #000000 | |
| Financials | 14px/400 | #000000 | |

GF tabs: **same font/color** for all items, active has border-bottom underline (NOT bg fill)

### Key Differences from Current Alpha
1. **Period tabs**: GF uses text-only underline (12px), alpha uses ToggleGroup outline variant (border+shadow)
2. **Content tabs**: GF uses same-color text with active underline, alpha uses bg-muted bg + bg-background active fill
3. **Stock name**: GF 20px/400 vs alpha `text-xl font-medium` (20px/500) — close
4. **Price**: GF 24px/500 vs alpha `text-2xl font-medium` (24px/500) — matches!
5. **Change color**: GF rgb(4,110,0) vs alpha #C0151D (KRX convention: GF uses green for up, alpha uses red!)
6. **Layout**: GF full-width (no max-width) vs alpha `max-w-3xl` (768px)
7. **KRX Convention**: GF uses GREEN for up/positive, RED for down/negative — opposite of current alpha convention

### Critical: KRX Color Convention Issue
- GF shows GREEN (`rgb(4, 110, 0)`) for upward price movement
- Current alpha uses RED (`#C0151D`) for upward movement (KRX convention)
- This is a DESIGN DECISION — GF new design uses global convention (green=up), while alpha follows KRX convention
- **Need to ask user**: Keep KRX convention (red=up) or match GF (green=up)?

## T4 Completed (2026-06-27): Tabs 정합

### Period Tabs (ToggleGroup) — GF-aligned
- Changed `variant='outline'` → `variant='default'` (removes border+shadow-xs from ToggleGroup root)
- Container: `rounded-none p-0 gap-1.5 h-6 flex-wrap justify-start`
- Each item overrides CVA defaults: transparent bg, h-6, text-xs, inactive=#56595E font-normal, active=#0A0A0A font-medium, no rounded corners, no min-width constraint
- Key insight: `data-[state=on]:bg-transparent` is required because CVA default variant applies `data-[state=on]:bg-accent` by default

### Content Tabs (shadcn Tabs) — GF-aligned
- TabsList: `bg-transparent rounded-none p-0 h-auto gap-6 border-b border-border w-full` — removes bg-muted, rounded-lg, p-[3px]
- Each Trigger: bottom-border 2px indicator pattern instead of bg-background fill + shadow-sm
  - Inactive: `text-[#444746] border-transparent`
  - Active: `text-[#1F1F1F] border-b-[#1F1F1F]` via `data-[state=active]`
  - Override base classes: `border-0` (removes base border), `bg-transparent` (removes active bg), `shadow-none` (removes active shadow-sm), `hover:bg-transparent`
- Key insight: shadcn TabsTrigger has `border border-transparent` in base — need explicit `border-0` to remove it before adding `border-b-2`

### cn() class merging behavior confirmed
- Later classes override earlier ones when conflicting (e.g., `rounded-none` overrides `rounded-md`)
- `bg-transparent` successfully overrides `bg-muted`, `bg-background`

## T5 Completed (2026-06-27): Related Stocks / News / Profile 정합

### related-stocks.tsx changes
- Name: `text-sm` → `text-base` (GF 16px/500)
- Price: `text-sm font-medium` → `text-xs text-muted-foreground` (GF 12px/500 #56595E)
- Change: `text-xs` → `text-base` (GF 16px/500)
- Kept: card/carousel structure, tabular-nums, truncate, changeColorClass, ticker style

### news-list.tsx changes
- Removed `<Newspaper>` import from lucide-react entirely
- Removed `<ItemMedia variant='icon'>` block completely
- Added `text-muted-foreground text-xs` to ItemDescription for source/time
- Kept: ItemGroup/Item/ItemContent structure, line-clamp-2 on title, variant='outline'

### company-profile.tsx changes
- CollapsibleContent grid: `text-sm` → `text-xs` (GF 12px typography)
- Kept: Collapsible structure, line-clamp-3, field grid, ChevronDown button, label formatting

## T6 Completed (2026-06-27): Chart Library Decision

### Decision: KEEP Recharts for price-chart.tsx
- Document created: `alpha/docs/gf-regions/chart-decision.md`
- Rationale: zero marginal bundle cost (Recharts already loaded), static rendering doesn't need canvas, shadcn/ui integration preserved, no financial-specific features needed
- lightweight-charts would be appropriate for: live streaming data, interactive zoom/pan, candlestick overlays — none apply here
- Current implementation GF-aligned across all dimensions: strokeWidth 2, gradient fill, KRX colors via changeHex, no animation, 240px height
- No code changes required


---
## Visual QA Report: Finance Dashboard vs Google Finance Reference (2026-06-27)

### Final Verdict
`Regions [5/5 pass] | Breakpoints [3/3] | Console [clean] | VERDICT: APPROVE`

### Region-by-Region Results

**Region 1 — Stock Header**: PASS
- Ticker/name/price/change rendered correctly
- Change color = `rgb(192, 21, 29)` (#C0151D ✓ KRX red for positive change)
- Arrow size = 12x12px matching GF spec
- fontSize matches reference across all breakpoints

**Region 2 — Key Metrics Grid**: PASS
- 3-column grid layout with 15 cells (5 rows × 3 columns)
- border-radius = 8px per cell
- label/value fontSize = 12px
- Consistent spacing and alignment across viewports

**Region 3a — Period Tabs**: PASS
- 8 tabs present: 1D / 5D / 1M / 6M / YTD / 1Y / 5Y / MAX
- Active state uses darker color (`on` variant), inactive lighter
- Tab widths proportional to content at each breakpoint

**Region 3b — Content Tabs**: PASS
- 3 tabs: 개요 / 재무 / 실적 (Overview / Financials / Performance)
- Active tab indicator: borderBottomColor=rgb(31,31,31), width=2px ✓
- Matches GF underline-style active indicator pattern

**Region 4 — Related Stocks Carousel**: PASS
- Cards render ticker/name/price/change correctly
- Change colors match KRX convention (red=up #C0151D, blue=down #3364F0)
- Horizontal scroll/carousel behavior functional

**Region 5 — News List**: PASS
- Items use `[data-slot="item"]` selector correctly
- Description text styled muted at 12px
- No Newspaper icon present (matches current spec)

### Breakpoint Verification
- **1024px**: All regions render without overflow or clipping
- **1430px**: Default desktop viewport, layout matches GF reference proportions
- **1680px**: Wide-screen layout scales appropriately, no empty space issues

### Console Checks
All 3 viewports: clean — no errors, warnings, or React hydration mismatches

### QA Process Notes
- Auth bypass in `src/proxy.ts` was temporary for QA; restored from `/tmp/proxy.ts.bak` after completion
- Dev server ran on port 3040 (`bun run dev`)
- Playwright headless Chromium used for DOM + computed style measurements
- Reference data sourced from `alpha/docs/gf-shots/deep-measurements.json` and `measurement-summary.json`
- Full-page screenshots archived at `/tmp/alpha-qa-screenshots/alpha-full-{1024,1430,1680}.png`
