# Left Sidebar System Spec

## Component: LeftSidebar

**Purpose:** Navigation sidebar with portfolio watchlist, appearing on left side of the 3-column layout.

## Modes

| Mode | Width | Positioning | Trigger |
|---|---|---|---|
| Collapsed | 81px | `flex-shrink-0` in flex flow | default state |
| Hover | 324px | `absolute` with shadow overlay, z-index | mouse enter on collapsed sidebar |
| Normal | 324px | `flex-shrink-0` in flex flow | click "..." menu in header |
| Expanded | 880px | `fixed top-[64px] left-0 bottom-0 z-50` | click expand icon |

**Desktop sidebar**: only rendered at `vp >= 760`.
**Mobile sidebar**: `<LeftSidebar mobile open={sidebarOpen} onClose={...}>` rendered always but controlled via hamburger menu.

## Normal Mode (3-Column Div Rows)

Each portfolio item renders as a div-based row with 3 columns:

| Column | Width | Content | Type |
|---|---|---|---|
| 1 | auto | Ticker symbol (e.g., "AAPL", "TSLA") | text |
| 2 | auto | Price (e.g., "$237.48", "$350.16") | text |
| 3 | auto | Change% (e.g., "+3.43%", "-0.45%") | colored text |

### Row Layout
```
[삼성전자   68,300   -0.15%]
[SK하이닉스  185,400  +2.32%]
[AAPL      237.48   +3.43%]
```

### Portfolio Section Headers
- 내 포트폴리오 (My Portfolio)
- 관심 (Watchlist)
- 최근본 (Recent)

### Row Styling
- Height: fixed row heights (120px header + 65px per row + 85px footer approximate)
- Border: `border-b border-[#e8eaed]`
- Hover: `hover:bg-[#f8f9fa]`
- Cursor: `cursor-pointer`
- Font: `text-[14px]` or `text-[13px]` for prices

## Expanded Mode (Table Layout)

When sidebar expands to 880px, normal div rows switch to a full `<table>` layout:

| Column | Header |
|---|---|
| 종목명 | Name |
| 현재가 | Price |
| 변동 | Change |
| 변동률 | Change% |
| 평가손익 | P&L |
| 수익률 | Return% |
| 비중 | Weight% |

- Table header: `bg-[#f8f9fa] font-medium text-[13px] text-[#5f6368]`
- Table rows: `border-b border-[#e8eaed]`
- Last row: 합계 (summary) row with bold totals

## Responsive Behavior
| Breakpoint | Collapsed | Normal | Expanded |
|---|---|---|---|
| < 760px | Mobile sidebar (hamburger) | N/A | N/A |
| 760-1039 | 80px | 324px | 880px (fixed, rightW=0) |
| 1040-1379 | 80px | 324px | 880px (fixed, rightW=0) |
| 1380-1479 | N/A | 324px | 880px (fixed) |
| 1480+ | N/A | 324px | 880px (fixed) |

### Collapsed Mode (80px)
- Only portfolio item tickers visible (first column of each row)
- Hovering over collapsed sidebar → expands to 324px with shadow overlay
- Auto-collapses on mouse leave

## Props
```typescript
interface LeftSidebarProps {
  centerBounds?: DOMRect | null;     // for hover overlay positioning
  sidebarMode?: SidebarMode;          // 'collapsed' | 'normal' | 'expanded'
  setSidebarMode?: (m: SidebarMode) => void;
  sidebarWidth?: number;
  mobile?: boolean;                    // renders as mobile overlay
  open?: boolean;                      // mobile toggle
  onClose?: () => void;               // mobile close
}
```
