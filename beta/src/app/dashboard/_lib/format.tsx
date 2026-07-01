"use client";

import { useMemo } from "react";

export function formatPrice(price: string): string {
  // KRW (₩/원): drop the decimal part entirely.
  // Other currencies & index points: keep decimals as-is.
  if (price.includes("₩") || price.includes("원")) {
    return price.replace(/\.\d+$/, "");
  }
  return price;
}

export function getSparklineColor(isPositive: boolean): string {
  return isPositive ? "var(--gf-up)" : "var(--gf-down)";
}

export function generateSparklineData(
  basePrice: number,
  points: number = 24,
  volatility: number = 0.02,
  seedOffset: number = 0
): number[] {
  const data: number[] = [];
  let price = basePrice;
  for (let i = points; i >= 0; i--) {
    const step = (i + seedOffset * 100) * 7919;
    const wiggle = ((step % 1000) - 500) / 500;
    price = price * (1 + wiggle * volatility);
    data.push(Math.round(price * 100) / 100);
  }
  return data;
}

export function useDeterministicSparkline(basePrice: number) {
  return useMemo(() => generateSparklineData(basePrice, 24, 0.02, basePrice), [basePrice]);
}
