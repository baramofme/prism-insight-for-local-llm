export function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, writable: true, configurable: true });
}

export function getElementBox(element: Element | null): DOMRect | null {
  if (!element) return null;
  return element.getBoundingClientRect();
}

export function compareColors(actual: string, expected: string, tolerance = 0.05): boolean {
  const a = parseColor(actual);
  const e = parseColor(expected);
  if (!a || !e) return false;
  const diff = Math.sqrt(
    Math.pow(a.r - e.r, 2) +
    Math.pow(a.g - e.g, 2) +
    Math.pow(a.b - e.b, 2)
  );
  return diff <= tolerance * 255 * Math.sqrt(3);
}

function parseColor(color: string): { r: number; g: number; b: number } | null {
  const hexMatch = color.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }
  const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }
  return null;
}
