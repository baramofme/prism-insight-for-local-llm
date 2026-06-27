import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, 'finance-sidebar.tsx'), 'utf-8');

describe('FinanceSidebar', () => {
  it('exports FinanceSidebar function', () => {
    expect(src).toContain('export function FinanceSidebar');
  });

  it('is a client component', () => {
    expect(src).toContain("'use client'");
  });

  it('imports getAllSectors and getWatchlist', () => {
    expect(src).toContain('getAllSectors');
    expect(src).toContain('getWatchlist');
  });

  it('uses Select component for view switching', () => {
    expect(src).toContain('<Select ');
    expect(src).toContain('SelectTrigger');
    expect(src).toContain('SelectContent');
    expect(src).toContain('SelectItem');
  });

  it('has equity sectors view option', () => {
    expect(src).toContain('Equity Sectors');
  });

  it('has watchlist view option', () => {
    expect(src).toContain('Watchlist');
  });

  it('has empty state watchlist placeholder', () => {
    expect(src).toContain('No stocks in your watchlist');
  });

  it('uses UserAvatarProfile in footer', () => {
    expect(src).toContain('UserAvatarProfile');
    expect(src).toContain('SidebarFooter');
  });

  it('links to finance detail pages', () => {
    expect(src).toContain('/dashboard/finance/');
  });

  it('shows price with positive/negative color classes', () => {
    expect(src).toContain('text-green-600');
    expect(src).toContain('text-red-600');
  });

  it('imports Sidebar primitives from ui/sidebar', () => {
    expect(src).toContain("from '@/components/ui/sidebar'");
    expect(src).toContain('SidebarContent');
    expect(src).toContain('SidebarGroup');
    expect(src).toContain('SidebarMenuButton');
  });

  it('imports Icons from components/icons', () => {
    expect(src).toContain("import { Icons } from '@/components/icons'");
  });

  it('uses trendingUp icon for sectors option', () => {
    expect(src).toContain('Icons.trendingUp');
  });

  it('uses search icon for watchlist option', () => {
    expect(src).toContain('Icons.search');
  });

  it('uses authClient for session data', () => {
    expect(src).toContain('authClient.useSession');
  });

  it('maps sectors with ticker key and displays name, ticker, price, changePercent', () => {
    expect(src).toContain('sector.ticker');
    expect(src).toContain('sector.name');
    expect(src).toContain('sector.price');
    expect(src).toContain('sector.changePercent');
  });

  it('maps watchlist items with symbol key and displays name, symbol, price, changePercent', () => {
    expect(src).toContain('item.symbol');
    expect(src).toContain('item.name');
    expect(src).toContain('item.price');
    expect(src).toContain('item.changePercent');
  });
});
