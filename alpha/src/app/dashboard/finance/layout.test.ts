import { describe, it, expect } from 'bun:test';

describe('FinanceLayout', () => {
  it('exports default FinanceLayout function', () => {
    const mod = require('./layout');
    expect(typeof mod.default).toBe('function');
  });

  it('uses "use client" directive', () => {
    const fs = require('fs');
    const content = fs.readFileSync('./src/app/dashboard/finance/layout.tsx', 'utf-8');
    expect(content).toContain("'use client'");
  });

  it('imports useAppMode from stores', () => {
    const fs = require('fs');
    const content = fs.readFileSync('./src/app/dashboard/finance/layout.tsx', 'utf-8');
    expect(content).toContain('useAppMode');
  });

  it('imports ResearchChatPanel', () => {
    const fs = require('fs');
    const content = fs.readFileSync('./src/app/dashboard/finance/layout.tsx', 'utf-8');
    expect(content).toContain('ResearchChatPanel');
  });

  it('conditionally renders ResearchChatPanel based on mode', () => {
    const fs = require('fs');
    const content = fs.readFileSync('./src/app/dashboard/finance/layout.tsx', 'utf-8');
    expect(content).toContain("mode === 'finance'");
  });

  it('renders children in main element', () => {
    const fs = require('fs');
    const content = fs.readFileSync('./src/app/dashboard/finance/layout.tsx', 'utf-8');
    expect(content).toContain('children');
    expect(content).toContain('<main');
  });

  it('uses flex layout container', () => {
    const fs = require('fs');
    const content = fs.readFileSync('./src/app/dashboard/finance/layout.tsx', 'utf-8');
    expect(content).toContain('flex');
  });

  it('wraps ResearchChatPanel in aside with w-80 width', () => {
    const fs = require('fs');
    const content = fs.readFileSync('./src/app/dashboard/finance/layout.tsx', 'utf-8');
    expect(content).toContain('aside');
    expect(content).toContain('w-80');
  });
});
