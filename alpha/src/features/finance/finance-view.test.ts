import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, 'finance-view.tsx'), 'utf-8');

describe('FinanceView', () => {
  it('exports FinanceView function', () => {
    expect(src).toContain('export function FinanceView');
  });

  it('uses max-w-[1820px] instead of max-w-3xl', () => {
    expect(src).toContain('max-w-[1820px]');
    expect(src).not.toContain('max-w-3xl');
  });

  it('has body breadcrumb above StockHeader with correct styling', () => {
    expect(src).toContain("text-sm text-muted-foreground");
    const idxBreadcrumb = src.indexOf("text-sm text-muted-foreground");
    const idxStockHeader = src.indexOf('<StockHeader');
    expect(idxBreadcrumb).toBeGreaterThan(-1);
    expect(idxStockHeader).toBeGreaterThan(-1);
    expect(idxBreadcrumb).toBeLessThan(idxStockHeader);
  });

  it('imports useInfobar and calls setContent with GF research content', () => {
    expect(src).toContain("import { useEffect } from 'react'");
    expect(src).toContain("useInfobar");
    expect(src).toContain("setContent");
    expect(src).toContain("연구");
  });

  it('cleans up infobar content on unmount by returning null in cleanup', () => {
    expect(src).toContain('return () =>');
    const lines = src.split('\n');
    let foundReturnCleanup = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('return () =>')) {
        const nextLine = lines[i + 1] || '';
        if (nextLine.includes('setContent(null)') || lines[i].includes('setContent(null)')) {
          foundReturnCleanup = true;
          break;
        }
      }
    }
    if (!foundReturnCleanup && src.includes('setContent(null)')) {
      foundReturnCleanup = true;
    }
    expect(foundReturnCleanup).toBe(true);
  });

  it('maintains single-column layout (no flex grid changes)', () => {
    const mainDivMatch = src.match(/<div className=['"]mx-auto w-full max-w-\[1820px\]/);
    expect(mainDivMatch).toBeTruthy();
  });

  it('does not modify info-sidebar.tsx import path', () => {
    expect(src).toContain("@/components/ui/infobar");
  });
});
