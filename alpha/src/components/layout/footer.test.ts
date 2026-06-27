import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, 'footer.tsx'), 'utf-8');

describe('Footer — GF Style', () => {
  it('exports default Footer function', () => {
    expect(src).toContain("export default function Footer");
  });

  it('contains AI disclaimer text', () => {
    expect(src).toContain('reference purposes only');
    expect(src).toContain('does not constitute investment advice');
  });

  it('has Terms link with placeholder href', () => {
    expect(src).toContain('Terms');
  });

  it('has Privacy link with placeholder href', () => {
    expect(src).toContain('Privacy');
  });

  it('has Disclaimer link with placeholder href', () => {
    expect(src).toContain('Disclaimer');
  });

  it('all links use hash placeholder href', () => {
    const linkCount = (src.match(/href=['"]#['"]/g) || []).length;
    expect(linkCount).toBeGreaterThanOrEqual(3);
  });

  it('contains copyright notice', () => {
    expect(src).toContain('&copy; 2026 PRISM Insight');
    expect(src).toContain('All rights reserved');
  });

  it('uses max-w-[1820px] mx-auto for center alignment', () => {
    expect(src).toContain('max-w-[1820px]');
    expect(src).toContain('mx-auto');
  });

  it('has py-2 px-4 padding', () => {
    expect(src).toContain('py-2');
    expect(src).toContain('px-4');
  });

  it('uses text-xs text-muted-foreground text-center styling', () => {
    expect(src).toContain('text-xs');
    expect(src).toContain('text-muted-foreground');
    expect(src).toContain('text-center');
  });

  it('has border-t border-border top border', () => {
    expect(src).toContain('border-t');
    expect(src).toContain('border-border');
  });

  it('uses bg-background class', () => {
    expect(src).toContain('bg-background');
  });
});
