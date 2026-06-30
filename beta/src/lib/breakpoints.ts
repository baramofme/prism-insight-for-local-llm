export const BREAKPOINTS = {
  MOBILE: 768,             // <768px: Full-screen (Tailwind md 기준과 통일)
  TABLET: 936,             // 768~935px: Left sidebar only
  RIGHT_PANEL: 936,        // ≥936px: Right panel visible
  RIGHT_PANEL_MIN: 1040,   // ≥1040px: Research panel appears (344px)
  // ≥1750px: research panel widens to 658px. Must wait until the whole row
  // (nav 300 + center 792 + panel 658 = 1750) fits, or the panel gets clipped
  // — GF likewise keeps the panel ~344 until ~1800. (was 1225/1445, too early)
  RIGHT_PANEL_WIDE: 1750,
  RIGHT_PANEL_WIDE_A: 1225, // (deprecated, kept for compat)
  RIGHT_PANEL_WIDE_B: 1445, // (deprecated, kept for compat)
  DESKTOP: 1371,           // 936~1370px: Left + right panels
  WIDE: 1371,              // ≥1371px: Full layout
  DESKTOP_SIDEBAR: 1380,    // ≥1380px: Desktop sidebar visible, mobile sidebar hidden
} as const;
