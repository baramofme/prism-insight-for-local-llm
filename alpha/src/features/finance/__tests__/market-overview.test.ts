import { describe, expect, it } from 'bun:test';
import { MarketOverview } from '../components/market-overview';
import { getMarketIndices, getMarketMovers, getMarketNews } from '../data/mock';

describe('MarketOverview component', () => {
  it('exports MarketOverview component', () => {
    expect(MarketOverview).toBeDefined();
    expect(typeof MarketOverview).toBe('function');
  });
});

describe('Markets section data', () => {
  const indices = getMarketIndices();

  it('renders KOSPI index', () => {
    expect(indices.some((i) => i.name === 'KOSPI')).toBe(true);
  });

  it('renders S&P 500 index', () => {
    expect(indices.some((i) => i.name === 'S&P 500')).toBe(true);
  });

  it('contains all 5 market indices', () => {
    expect(indices.length).toBe(5);
    expect(indices.map((i) => i.region)).toContain('KR');
    expect(indices.map((i) => i.region)).toContain('US');
    expect(indices.map((i) => i.region)).toContain('JP');
  });

  it('each index has required fields', () => {
    for (const idx of indices) {
      expect(idx).toHaveProperty('name');
      expect(idx).toHaveProperty('value');
      expect(idx).toHaveProperty('change');
      expect(idx).toHaveProperty('changePercent');
      expect(idx).toHaveProperty('region');
    }
  });
});

describe('Most Active section data', () => {
  const movers = getMarketMovers();

  it('has mostActive category', () => {
    expect(movers.mostActive).toBeDefined();
    expect(Array.isArray(movers.mostActive)).toBe(true);
    expect(movers.mostActive.length).toBe(3);
  });
});

describe('Top Gainers section data', () => {
  const movers = getMarketMovers();

  it('has gainers category with positive change', () => {
    expect(movers.gainers).toBeDefined();
    expect(movers.gainers.length).toBe(3);
    for (const g of movers.gainers) {
      expect(g.changePercent).toBeGreaterThan(0);
    }
  });
});

describe('Top Losers section data', () => {
  const movers = getMarketMovers();

  it('has losers category with negative change', () => {
    expect(movers.losers).toBeDefined();
    expect(movers.losers.length).toBe(3);
    for (const l of movers.losers) {
      expect(l.changePercent).toBeLessThan(0);
    }
  });
});

describe('News section data', () => {
  const news = getMarketNews();

  it('renders news items with sources', () => {
    expect(news.length).toBe(5);
    for (const item of news) {
      expect(item.source).toBeDefined();
      expect(typeof item.source).toBe('string');
      expect(item.title).toBeDefined();
    }
  });

  it('news items contain expected sources', () => {
    const sources = news.map((n) => n.source);
    expect(sources).toContain('연합뉴스');
    expect(sources).toContain('한국경제');
  });
});
