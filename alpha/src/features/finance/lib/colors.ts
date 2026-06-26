// KRX (Korea) local-market color convention: up = RED, down = BLUE.
// (International convention is the opposite; toggle later via settings.)
export const UP_COLOR = '#C0151D';
export const DOWN_COLOR = '#3364F0';

export function changeColorClass(n: number): string {
  return n >= 0 ? 'text-[#C0151D]' : 'text-[#3364F0]';
}
export function changeHex(n: number): string {
  return n >= 0 ? UP_COLOR : DOWN_COLOR;
}
export function formatPct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}
export function formatPrice(n: number, currency = 'KRW'): string {
  const sym = currency === 'KRW' ? '₩' : currency === 'JPY' ? '¥' : currency === 'USD' ? '$' : '';
  return `${sym}${n.toLocaleString('ko-KR', { minimumFractionDigits: currency === 'KRW' ? 0 : 2, maximumFractionDigits: 2 })}`;
}
