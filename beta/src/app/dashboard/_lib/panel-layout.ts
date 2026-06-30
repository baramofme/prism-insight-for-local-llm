import { BREAKPOINTS } from "@/lib/breakpoints";

export interface CalcPanelResult {
  leftW: number;
  centerW: number;
  rightW: number;
  centerMaxW: number;
  wrapperMargin: number;
}

export type PanelMode = "minimized" | "hover" | "normal" | "expanded";

/**
 * Panel widths by viewport + sidebar mode — matched to Google Finance.
 *
 * Once the research panel is visible (>= RIGHT_PANEL_MIN) the three columns
 * always fill the row (min(vp, 1820)): the center holds ~760 while the research
 * panel grows to take the slack and caps at 659, after which the center grows
 * toward 840 (760/401 @1480, 760/571 @1650, 840/659 @1850). The sidebar is an
 * 80px rail when collapsed (minimized/hover) or ~321px when expanded — GF
 * collapses it below ~1380 and expands it above.
 */
export function calcPanelWidths(vp: number, mode: PanelMode): CalcPanelResult {
  // ── Expanded mode (overlay sidebar): keep its own handling ───────
  if (mode === "expanded") {
    if (vp >= BREAKPOINTS.WIDE) {
      const leftW = 300;
      const rightW = vp >= BREAKPOINTS.RIGHT_PANEL_WIDE ? 658 : 344;
      const centerW = 792;
      const wrapperMargin = (vp - Math.min(1800, vp - 48)) / 2;
      return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin };
    }
    if (vp >= BREAKPOINTS.TABLET) {
      const progress = Math.min(1, Math.max(0, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)));
      const leftW = 252 + progress * (272 - 252);
      if (vp >= BREAKPOINTS.RIGHT_PANEL_MIN) {
        const available = vp - leftW;
        const rightW = Math.max(344, Math.min(659, available - 760));
        return { leftW, centerW: available - rightW, rightW, centerMaxW: available - rightW, wrapperMargin: 0 };
      }
      const centerW = Math.min(792, 644 + progress * (792 - 644));
      return { leftW, centerW, rightW: 0, centerMaxW: centerW, wrapperMargin: 0 };
    }
    const leftW = 232;
    const centerW = Math.min(800, vp - leftW - 48);
    return { leftW, centerW, rightW: 0, centerMaxW: centerW, wrapperMargin: 0 };
  }

  // ── normal / hover / minimized — unified fill ────────────────────
  const rail = mode === "minimized" || mode === "hover";

  // Below MOBILE the desktop sidebar is an off-canvas sheet.
  if (vp < BREAKPOINTS.MOBILE) {
    const leftW = rail ? 80 : 232;
    return { leftW, centerW: vp - leftW, rightW: 0, centerMaxW: 800, wrapperMargin: 0 };
  }

  // Nav width: 80px rail when collapsed, else 321 (>=WIDE) / 252→272 below.
  let leftW: number;
  if (rail) {
    leftW = 80;
  } else if (vp >= BREAKPOINTS.WIDE) {
    leftW = 321;
  } else {
    const progress = Math.min(1, Math.max(0, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)));
    leftW = Math.round(252 + progress * (272 - 252));
  }

  // Below the research-panel threshold: a single content column.
  if (vp < BREAKPOINTS.RIGHT_PANEL_MIN) {
    const centerW = Math.min(800, vp - leftW - 48);
    return { leftW, centerW, rightW: 0, centerMaxW: centerW, wrapperMargin: 0 };
  }

  // Research visible: fill the row, cap at 1820, then center. GF anchors the
  // center differently by sidebar state — when the rail is collapsed the
  // center grows first (anchor 840, research stays ~min); when expanded the
  // research panel grows first (anchor 760, center holds ~760).
  const available = Math.min(vp, 1820) - leftW;
  const centerAnchor = rail ? 840 : 760;
  const rightW = Math.max(344, Math.min(659, available - centerAnchor));
  const centerW = available - rightW;
  const wrapperMargin = Math.max(0, (vp - 1820) / 2);
  return { leftW, centerW, rightW, centerMaxW: centerW, wrapperMargin };
}
