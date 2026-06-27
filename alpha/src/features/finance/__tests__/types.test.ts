import { describe, expect, it } from 'bun:test';
import type { Sector, MarketIndex, MarketMover, WatchlistItem, NewsItem } from '../types';

describe('Sector type structure', () => {
  const mock: Sector = { ticker: 'SIXT', name: 'Technology', price: 3656.35, change: -60.33, changePercent: -1.65 };

  it('has required fields', () => {
    expect(mock).toHaveProperty('ticker');
    expect(mock).toHaveProperty('name');
    expect(mock).toHaveProperty('price');
    expect(mock).toHaveProperty('change');
    expect(mock).toHaveProperty('changePercent');
  });

  it('ticker format is SIX*', () => {
    expect(mock.ticker).toMatch(/^SIX[A-Z]+$/);
  });
});

describe('MarketIndex type structure', () => {
  const mock: MarketIndex = { name: 'KOSPI', value: 2765.43, change: 12.34, changePercent: 0.45, region: 'KR' };

  it('has required fields', () => {
    expect(mock).toHaveProperty('name');
    expect(mock).toHaveProperty('value');
    expect(mock).toHaveProperty('change');
    expect(mock).toHaveProperty('changePercent');
    expect(mock).toHaveProperty('region');
  });

  it('region is valid', () => {
    expect(['KR', 'US', 'JP', 'EU']).toContain(mock.region);
  });
});

describe('MarketMover type structure', () => {
  const mock: MarketMover = { symbol: '005930:KRX', name: '삼성전자', price: 75400, changePercent: 1.34, market: 'KRX' };

  it('has required fields', () => {
    expect(mock).toHaveProperty('symbol');
    expect(mock).toHaveProperty('name');
    expect(mock).toHaveProperty('price');
    expect(mock).toHaveProperty('changePercent');
    expect(mock).toHaveProperty('market');
  });
});

describe('WatchlistItem type structure', () => {
  const mock: WatchlistItem = { symbol: '000660:KRX', name: 'SK하이닉스', price: 291700, changePercent: 5.29, market: 'KRX' };

  it('has required fields', () => {
    expect(mock).toHaveProperty('symbol');
    expect(mock).toHaveProperty('name');
    expect(mock).toHaveProperty('price');
    expect(mock).toHaveProperty('changePercent');
    expect(mock).toHaveProperty('market');
  });
});

describe('NewsItem extended structure', () => {
  it('id, title, source, time are required', () => {
    const item: NewsItem = { id: '1', title: 'Test', source: 'Src', time: '1h' };
    expect(item).toBeDefined();
  });

  it('summary and url are optional', () => {
    const full: NewsItem = { id: '1', title: 'Test', source: 'Src', time: '1h', summary: 'Summary', url: 'https://example.com' };
    expect(full.summary).toBe('Summary');
    expect(full.url).toBe('https://example.com');
  });
});
