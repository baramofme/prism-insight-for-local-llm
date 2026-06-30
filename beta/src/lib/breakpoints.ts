export const BREAKPOINTS = {
  MOBILE: 768,             // <768px: Full-screen (Tailwind md 기준과 통일)
  TABLET: 936,             // 768~935px: Left sidebar only
  RIGHT_PANEL: 936,        // ≥936px: Right panel visible
  RIGHT_PANEL_MIN: 1040,   // ≥1040px: Research panel minimum
  RIGHT_PANEL_WIDE_A: 1225, // ≥1225px: Panel widens to 658px
  RIGHT_PANEL_WIDE_B: 1445, // ≥1445px: Sidebar 후 다시 넓어짐 (658px)
  DESKTOP: 1371,           // 936~1370px: Left + right panels
  WIDE: 1371,              // ≥1371px: Full layout
  DESKTOP_SIDEBAR: 1380,    // ≥1380px: Desktop sidebar visible, mobile sidebar hidden
} as const;
