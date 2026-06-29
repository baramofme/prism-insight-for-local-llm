"use client";

import { useMemo } from "react";

export function formatPrice(price: string): string {
  return price.replace(/(₩[\d,]+)\.00$/, '$1');
}

export function getSparklineColor(isPositive: boolean): string {
  return isPositive ? "#0E9E4B" : "#FF4B4B";
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
