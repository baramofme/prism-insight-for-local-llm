import React from "react";

export const SHAPE_TYPES = ['circle', 'triangle', 'square', 'pentagon', 'star'] as const;
export type ShapeType = typeof SHAPE_TYPES[number];

export type ShapeRenderer = (color: string, size: number) => React.ReactElement;

export const SHAPE_SVG: Record<ShapeType, ShapeRenderer> = {
  circle: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="5" fill={color} />
    </svg>
  ),
  triangle: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <polygon points="6,0.5 11.5,10 0.5,10" fill={color} />
    </svg>
  ),
  square: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <rect x="1" y="1" width="10" height="10" rx="1.5" fill={color} />
    </svg>
  ),
  pentagon: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <polygon points="6,0.5 11.3,4.5 9.1,11.3 2.9,11.3 0.7,4.5" fill={color} />
    </svg>
  ),
  star: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <polygon points="6,0.5 7.3,4.5 11.5,4.5 8.1,7.3 9.3,11.5 6,9 2.7,11.5 3.9,7.3 0.5,4.5 4.7,4.5" fill={color} />
    </svg>
  ),
};

export function AssetSymbol({ shape, color, size = 10 }: { shape: ShapeType; color: string; size?: number }) {
  return SHAPE_SVG[shape](color, size);
}

export function getAssetShape(assetId: string): ShapeType {
  let hash = 0;
  for (let i = 0; i < assetId.length; i++) {
    hash = ((hash << 5) - hash) + assetId.charCodeAt(i);
  }
  return SHAPE_TYPES[Math.abs(hash) % SHAPE_TYPES.length];
}
