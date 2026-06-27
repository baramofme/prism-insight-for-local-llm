import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, 'version-switcher.tsx'), 'utf-8');

describe('VersionSwitcher', () => {
  it('exports VersionSwitcher function', () => {
    expect(src).toContain("export function VersionSwitcher");
  });

  it('is a client component', () => {
    expect(src).toContain("'use client'");
  });

  it('imports useAppMode from stores', () => {
    expect(src).toContain("from '@/stores/app-mode'");
  });

  it('imports Icons from components/icons', () => {
    expect(src).toContain("from '@/components/icons'");
  });

  it('uses DropdownMenu primitives', () => {
    expect(src).toContain('DropdownMenu');
    expect(src).toContain('DropdownMenuContent');
    expect(src).toContain('DropdownMenuItem');
    expect(src).toContain('DropdownMenuTrigger');
  });

  it('uses SidebarMenu primitives', () => {
    expect(src).toContain('SidebarMenu');
    expect(src).toContain('SidebarMenuButton');
    expect(src).toContain('SidebarMenuItem');
  });

  it('displays Dashboard for main mode', () => {
    expect(src).toContain('Dashboard');
  });

  it('displays Finance for finance mode', () => {
    expect(src).toContain('Finance');
  });

  it('calls setMode with main and finance values', () => {
    expect(src).toContain("setMode('main')");
    expect(src).toContain("setMode('finance')");
  });

  it('uses dashboard icon for main mode', () => {
    expect(src).toContain('Icons.dashboard');
  });

  it('uses trendingUp icon for finance mode', () => {
    expect(src).toContain('Icons.trendingUp');
  });

  it('shows chevronsUpDown chevron indicator', () => {
    expect(src).toContain('chevronsUpDown');
  });

  it('has Admin label for Dashboard mode', () => {
    expect(src).toContain("'Admin'");
  });

  it('has Markets label for Finance mode', () => {
    expect(src).toContain("'Markets'");
  });

  it('includes w-(--radix-dropdown-menu-trigger-width) width class', () => {
    expect(src).toContain('--radix-dropdown-menu-trigger-width');
  });
});
