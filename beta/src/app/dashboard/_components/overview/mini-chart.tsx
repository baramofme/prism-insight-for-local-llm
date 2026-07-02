"use client";

import { useId } from "react";

export function MiniChart({ data, color, prevClose, fillWidth, small }: { data: number[]; color: string; prevClose?: number; fillWidth?: boolean; small?: boolean }) {
  const w = fillWidth ? 200 : small ? 55 : 96, h = fillWidth ? 56 : small ? 24 : 36, pad = 3;
  const gradientId = useId();
  if (!data || data.length < 2) return <svg width={w} height={h} className="flex-shrink-0" />;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return { x, y };
  });
  const prevY = prevClose !== undefined ? h - pad - ((prevClose - min) / range) * (h - pad * 2) : null;
  const linePath = `M${pts.map(p => `${p.x},${p.y}`).join(" L")}`;
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;
  const gradient = (
    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity="0.35" />
      <stop offset="100%" stopColor={color} stopOpacity="0" />
    </linearGradient>
  );
  return (
    <svg
      width={fillWidth ? "100%" : w}
      height={h}
      viewBox={fillWidth ? `0 0 ${w} ${h}` : undefined}
      // Inline size beats class-based sizing — shadcn Button injects
      // [&_svg:not([class*='size-'])]:size-4, which otherwise squashes this
      // chart to 16px when it sits inside a Button (e.g. SimpleStockNav).
      style={fillWidth ? undefined : { width: w, height: h, minWidth: w, flexShrink: 0 }}
      className={`gf-mini-chart ${fillWidth ? "overflow-visible block" : "block overflow-visible"}`}
    >
      <defs>
        {gradient}
      </defs>
      {prevY !== null && (
        <line x1={pad} y1={prevY} x2={w - pad} y2={prevY} stroke={color} strokeWidth={1} strokeDasharray="3,3" opacity={0.5} />
      )}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
