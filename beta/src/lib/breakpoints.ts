export const BREAKPOINTS = {
  MOBILE: 768,      // <768px: Full-screen (Tailwind md 기준과 통일)
  TABLET: 936,      // 768~935px: Left sidebar only
  RIGHT_PANEL: 936, // ≥936px: Right panel visible
  DESKTOP: 1371,    // 936~1370px: Left + right panels
  WIDE: 1371,       // ≥1371px: Full layout
} as const;
