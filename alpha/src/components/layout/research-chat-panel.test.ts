import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, 'research-chat-panel.tsx'), 'utf-8');

describe('ResearchChatPanel', () => {
  it('exports ResearchChatPanel function', () => {
    expect(src).toContain("export function ResearchChatPanel");
  });

  it('is a client component', () => {
    expect(src).toContain("'use client'");
  });

  it('imports useState from react', () => {
    expect(src).toContain("import { useState } from 'react'");
  });

  it('imports Icons, Button, and Input', () => {
    expect(src).toContain("from '@/components/icons'");
    expect(src).toContain("from '@/components/ui/button'");
    expect(src).toContain("from '@/components/ui/input'");
  });

  it('has suggestedPrompts array', () => {
    expect(src).toContain('suggestedPrompts');
  });

  it('includes four suggestion prompts', () => {
    expect(src).toContain("What's moving the markets today?");
    expect(src).toContain('Compare S&P 500 to Nasdaq');
    expect(src).toContain('Top gainers this week');
    expect(src).toContain('Market outlook this quarter');
  });

  it('renders Research title with trendingUp icon', () => {
    expect(src).toContain('<h3 className=\'font-semibold\'>Research</h3>');
    expect(src).toContain('Icons.trendingUp');
  });

  it('shows AI-powered insights subtitle', () => {
    expect(src).toContain('AI-powered insights');
  });

  it('has input placeholder Ask AI', () => {
    expect(src).toContain('Ask AI...');
  });

  it('uses send icon for submit button', () => {
    expect(src).toContain('Icons.send');
  });

  it('disables send button when input is empty', () => {
    expect(src).toContain('disabled={!input.trim()}');
  });

  it('includes AI disclaimer text', () => {
    expect(src).toContain('AI content may include mistakes');
  });

  it('uses flex layout with border-l', () => {
    expect(src).toContain('flex h-full flex-col border-l');
  });

  it('maps suggestedPrompts to clickable buttons', () => {
    expect(src).toContain('suggestedPrompts.map');
    expect(src).toContain("onClick={() => setInput(prompt)}");
  });
});
