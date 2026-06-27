# Stock Header — GF Measurement Spec

## Layout
- Container: flex column, padding 0px
- Position (1680bp): x=344, y=128, w=458, h=82
- Tags: `<div class="KycIzb">`

## Typography
| Element | Font Family | Size | Weight | Color |
|---|---|---|---|---|
| Stock name | Google Sans, sans-serif | 20px | 400 | #0A0A0A |
| Price | Google Sans, sans-serif | 24px | 500 | #0A0A0A |
| Change % | Google Sans Text, sans-serif | 12px | 500 | #046E00 (up) / #xxx (down) |
| Ticker (breadcrumb) | - | 14px | 400 | #56595E |

## Spacing
- Stock name → Price: gap via flex column layout
- Price → Change: inline flex, gap ~4px
- Container inner padding: 0px

## Colors
- Background: transparent (no card/bg)
- Up: rgb(4, 110, 0) — GREEN (NOT KRX red convention)
- Price: rgb(10, 10, 10)
- Stock name: rgb(10, 10, 10)

## Breakpoints (gf-main width)
| BP | gf-main | stock header position |
|---|---|---|
| 1680px | 840px | same styles across all BPs |
| 1430px | 786px | same styles across all BPs |
| 1024px | 944px | same styles across all BPs |

## Notes
- Stock name element: `<div>` containing "SK Hynix Inc" text
- Price format: ₩2,673,000.00 (currency symbol + comma-separated + 2 decimals)
- Change includes percentage only (no dollar change amount visible in GF currently)
- No "as of" timestamp visible in GF new design
