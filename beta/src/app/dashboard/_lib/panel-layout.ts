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
 * Calculate panel widths based on viewport and sidebar mode.
 * Ported verbatim from page.tsx to enable reuse and testability.
 */
export function calcPanelWidths(vp: number, mode: PanelMode): CalcPanelResult {
  // ── Expanded mode (overlay sidebar): Always show full layout ─────
  if (mode === "expanded") {
    if (vp >= BREAKPOINTS.WIDE) {
      const leftW = 300;
      const rightW = vp >= BREAKPOINTS.RIGHT_PANEL_WIDE ? 658 : 344;
      const centerW = 792;
      const wrapperMargin = (vp - Math.min(1800, vp - 48)) / 2;
      return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin };
    }
    // DESKTOP (936–1370px): Linear interpolation from min to max widths
    if (vp >= BREAKPOINTS.TABLET) {
      const progress = Math.min(1, Math.max(0, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)));
      const leftW = 252 + progress * (272 - 252);
      const rightW = vp >= BREAKPOINTS.RIGHT_PANEL_MIN ? 344 : 0;
      const centerW = Math.min(792, 644 + progress * (792 - 644));
      return { leftW, centerW, rightW, centerMaxW: Math.min(792, 644 + progress * (792 - 644)), wrapperMargin: 0 };
    }
    // TABLET (760–935px): Left sidebar only
    if (vp >= BREAKPOINTS.MOBILE) {
      const leftW = 232;
      const centerW = Math.min(800, vp - leftW - 48);
      return { leftW, centerW, rightW: 0, centerMaxW: Math.min(800, vp - leftW - 48), wrapperMargin: 0 };
    }
    return { leftW: 232, centerW: Math.min(800, vp - 232 - 48), rightW: 0, centerMaxW: Math.min(800, vp - 232 - 48), wrapperMargin: 0 };
  }

  // ── Normal mode: Full responsive layout ──────────────────────────
  if (mode === "normal") {
    if (vp >= BREAKPOINTS.WIDE) {
      // GF fills the row (nav 321 + center + research = min(vp,1820)). Center
      // holds ~760; research grows to take the slack and caps at 659, after
      // which center grows toward 840. Matches GF: 760/401 @1480, 760/571
      // @1650, 840/659 @1850.
      const leftW = 321;
      const available = Math.min(vp, 1820) - leftW;
      const rightW = Math.max(344, Math.min(659, available - 760));
      const centerW = available - rightW;
      const wrapperMargin = Math.max(0, (vp - 1820) / 2);
      return { leftW, centerW, rightW, centerMaxW: centerW, wrapperMargin };
    }
    // DESKTOP (936–1370px): Linear interpolation from min to max widths
    if (vp >= BREAKPOINTS.TABLET) {
      const progress = Math.min(1, Math.max(0, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)));
      const leftW = 252 + progress * (272 - 252);
      const rightW = vp >= BREAKPOINTS.RIGHT_PANEL_MIN ? 344 : 0;
      const centerW = Math.min(792, 644 + progress * (792 - 644));
      return { leftW, centerW, rightW, centerMaxW: Math.min(792, 644 + progress * (792 - 644)), wrapperMargin: 0 };
    }
    // TABLET (760–935px): Left sidebar only
    if (vp >= BREAKPOINTS.MOBILE) {
      const leftW = 232;
      const centerW = Math.min(800, vp - leftW - 48);
      return { leftW, centerW, rightW: 0, centerMaxW: Math.min(800, vp - leftW - 48), wrapperMargin: 0 };
    }
    return { leftW: 232, centerW: Math.min(800, vp - 232 - 48), rightW: 0, centerMaxW: Math.min(800, vp - 232 - 48), wrapperMargin: 0 };
  }

  // ── Hover mode: Partial sidebar + full layout ────────────────────
  if (mode === "hover") {
    if (vp >= BREAKPOINTS.WIDE) {
      const leftW = 80;
      const rightW = vp >= BREAKPOINTS.RIGHT_PANEL_WIDE ? 658 : 344;
      const centerW = 792;
      const wrapperMargin = (vp - Math.min(1800, vp - 48)) / 2;
      return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin };
    }
    // DESKTOP (936–1370px): Linear interpolation from min to max widths
    if (vp >= BREAKPOINTS.TABLET) {
      const progress = Math.min(1, Math.max(0, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)));
      const leftW = 80;
      const rightW = vp >= BREAKPOINTS.RIGHT_PANEL_MIN ? 344 : 0;
      const centerW = Math.min(792, 644 + progress * (792 - 644));
      return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin: 0 };
    }
    // TABLET (760–935px): Left sidebar only
    if (vp >= BREAKPOINTS.MOBILE) {
      const leftW = 80;
      const centerW = vp - 80;
      return { leftW, centerW, rightW: 0, centerMaxW: 800, wrapperMargin: 0 };
    }
    return { leftW: 80, centerW: vp - 80, rightW: 0, centerMaxW: 800, wrapperMargin: 0 };
  }

  // ── Collapsed mode (default): Minimal sidebar ────────────────────
  if (vp >= BREAKPOINTS.WIDE) {
    const leftW = 80;
    const rightW = vp >= BREAKPOINTS.RIGHT_PANEL_WIDE_B ? 658 : vp >= BREAKPOINTS.DESKTOP_SIDEBAR ? 344 : vp >= BREAKPOINTS.RIGHT_PANEL_WIDE_A ? 658 : vp >= BREAKPOINTS.RIGHT_PANEL_MIN ? 344 : 0;
    const centerW = 792;
    // collapsed: narrower left panel → larger wrapper margin for centering
    const wrapperMargin = (vp - Math.min(1800, vp - 48)) / 2 + 96;
    return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin };
  }
  // DESKTOP (936–1370px): Linear interpolation from min to max widths
  if (vp >= BREAKPOINTS.TABLET) {
    const progress = Math.min(1, Math.max(0, (vp - BREAKPOINTS.TABLET) / (BREAKPOINTS.WIDE - BREAKPOINTS.TABLET)));
    const leftW = 80;
    const rightW = vp >= BREAKPOINTS.RIGHT_PANEL_WIDE_A ? 658 : vp >= BREAKPOINTS.RIGHT_PANEL_MIN ? 344 : 0;
    const centerW = Math.min(792, 644 + progress * (792 - 644));
    return { leftW, centerW, rightW, centerMaxW: 792, wrapperMargin: 0 };
  }
  // TABLET (760–935px): Left sidebar only
  if (vp >= BREAKPOINTS.MOBILE) {
    const leftW = 80;
    const centerW = vp - 80;
    return { leftW, centerW, rightW: 0, centerMaxW: 800, wrapperMargin: 0 };
  }
  // MOBILE (<760px): No sidebar
  return { leftW: 80, centerW: vp - 80, rightW: 0, centerMaxW: 800, wrapperMargin: 0 };
}
