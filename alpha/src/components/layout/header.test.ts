import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, 'header.tsx'), 'utf-8');

describe('Header — GF Style Redesign', () => {
  it('exports default Header function', () => {
    expect(src).toContain("export default function Header");
  });

  it('preserves SidebarTrigger at the left side', () => {
    expect(src).toContain('SidebarTrigger');
    expect(src).toContain('-ml-1');
  });

  it('has PRISM logo branding element', () => {
    expect(src).toContain('PRISM');
  });

  it('integrates Breadcrumbs component in header', () => {
    expect(src).toContain('<Breadcrumbs />') || expect(src).toContain('<Breadcrumbs');
  });

  it('has search input with rounded-full bg-muted (GF style)', () => {
    expect(src).toContain('rounded-full');
    expect(src).toContain('bg-muted');
  });

  it('includes stock search placeholder text', () => {
    expect(src).toContain('Search stocks');
  });

  it('has market navigation toggle (KR | US chip)', () => {
    expect(src).toContain('KR');
    expect(src).toContain('US');
  });

  it('integrates ThemeModeToggle on right side', () => {
    expect(src).toContain('ThemeModeToggle');
  });

  it('integrates NotificationCenter on right side', () => {
    expect(src).toContain('NotificationCenter');
  });

  it('has profile/avatar element at far right', () => {
    const hasProfile = src.includes('UserAvatarProfile') ||
      src.includes('Avatar') ||
      src.includes('profile');
    expect(hasProfile).toBe(true);
  });

  it('maintains sticky header positioning', () => {
    expect(src).toContain('sticky');
    expect(src).toContain('top-0');
  });

  it('uses backdrop-blur for glass effect', () => {
    expect(src).toContain('backdrop-blur');
  });
});
