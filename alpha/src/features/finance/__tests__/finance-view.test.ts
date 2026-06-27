import { describe, expect, it } from 'bun:test';
import { getStockDetail } from '../data/mock';

describe('Finance view mock data', () => {
  it('returns stock detail for valid symbol', () => {
    const result = getStockDetail('000660:KRX');
    expect(result).toHaveProperty('quote');
    expect(result).toHaveProperty('metrics');
    expect(result).toHaveProperty('news');
    expect(result.quote.symbol).toBe('000660:KRX');
  });

  it('returns stock detail with default symbol', () => {
    const result = getStockDetail('NOTFOUND');
    expect(result.quote.ticker).toBe('NOTFOUND');
    expect(result.news.length).toBeGreaterThan(0);
  });
});
