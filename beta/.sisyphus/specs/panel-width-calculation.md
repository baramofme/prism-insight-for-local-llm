# Panel Width Calculation System Spec

## Function: `calcPanelWidths`

**Location:** `page.tsx` (inline function, ~line 340)

**Purpose:** Determines left sidebar width (`leftW`), center max width (`centerW`), and right panel width (`rightW`) based on viewport width and sidebar state.

## Formula
```
leftW + centerW + rightW = vp (viewport width)
```

## Parameters
```typescript
interface CalcPanelWidthsParams {
  vp: number;          // viewport width
  sidebarMode: SidebarMode;  // 'collapsed' | 'normal' | 'expanded' | 'hover'
}
```

## Return Value
```typescript
{ leftW: number; centerW: number; rightW: number }
```

## Width Definitions
- `collapsedW` = 81
- `normalW` = 324
- `expandedW` = 880
- `rightMinW` = 344
- `rightMaxW` = 700 (at 1680+)

## Logic by Breakpoint + Mode

### vp < 760 (Mobile)
| Mode | leftW | rightW | centerW |
|---|---|---|---|
| any | 0 | 0 | vp |

Center takes full viewport. No left/right panels rendered.

### 760 <= vp < 1040
| Mode | leftW | rightW | centerW |
|---|---|---|---|
| collapsed | 80 | vp - 80 | 0 |
| normal | 324 | 0 | vp - 324 |
| expanded | 324 (fixed overlay) | 0 | vp - 324 |

Right panel hidden when sidebar is expanded (1040 breakpoint).

### 1040 <= vp < 1380
| Mode | leftW | rightW | centerW |
|---|---|---|---|
| collapsed | 80 | max(rightMinW, vp - 80 - centerMax) | min(800, vp - 80 - rightMinW) |
| normal | 324 | max(rightMinW, vp - 324 - 800) | min(800, vp - 324 - rightMinW) |
| expanded | 324 (fixed overlay) | max(rightMinW, vp - 324 - 800) | min(800, vp - 324 - rightMinW) |

### 1380 <= vp < 1480
| Mode | leftW | rightW | centerW |
|---|---|---|---|
| collapsed | 80 | vp - 80 - min(800, vp - 80 - rightMinW) | min(800, vp - 80 - rightMinW) |
| normal | 324 | vp - 324 - min(800, vp - 324 - rightMinW) | min(800, vp - 324 - rightMinW) |
| expanded | 324 (fixed) | vp - 324 - min(800, vp - 324 - rightMinW) | min(800, vp - 324 - rightMinW) |

### 1480 <= vp < 1680
| Mode | leftW | rightW | centerW |
|---|---|---|---|
| normal | 324 | vp - 1036 | 712 |

### vp >= 1680
| Mode | leftW | rightW | centerW |
|---|---|---|---|
| normal | 324 | min(vp - 1124, 700) | 800 |

## Margin Logic
```typescript
marginLeft: sidebarMode === "expanded" ? leftW : 0
```
- In flex-flow modes (collapsed/normal/hover): margin is 0 because flex layout naturally positions content
- In expanded (fixed overlay) mode: margin equals leftW to prevent center content from hiding behind the fixed sidebar

## Key Design Decisions
1. Right panel hidden (rightW=0) when:
   - Viewport < 760 (mobile)
   - Viewport < 1040 AND sidebar in normal/expanded mode
   - Right panel minimum width (344px) cannot be satisfied
2. Center width capped at 800px maximum (712px in 1480-1679 range)
3. Expanded sidebar uses `fixed` positioning, so center content needs left margin
