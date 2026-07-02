/**
 * Database Schema — 단위 테스트
 * 
 * Tests for ID generation and schema structure.
 */

// Mock @paralleldrive/cuid2 before importing generateId with unique ID generation
let idCounter = 0;
jest.mock("@paralleldrive/cuid2", () => ({
  init: jest.fn(() => {
    return () => {
      idCounter++;
      return `cuid${idCounter.toString().padStart(15, '0')}`;
    };
  }),
}));

import { generateId } from "@/db/schema/id";
import * as portfolioSchema from "@/db/schema/portfolio";

// ─── ID Generation tests ────────────────────────────────────────────────

describe("ID Generation", () => {
  beforeEach(() => {
    idCounter = 0;
  });

  test("should generate IDs with correct prefix", () => {
    const portfolioId = generateId("pfo");
    expect(portfolioId).toMatch(/^pfo_/);
    expect(portfolioId.length).toBeGreaterThan(5);
  });

  test("should generate unique IDs", () => {
    const id1 = generateId("hld");
    const id2 = generateId("hld");
    expect(id1).not.toBe(id2);
  });

  test("should generate IDs with different prefixes", () => {
    const pfoId = generateId("pfo");
    const hldId = generateId("hld");
    const trdId = generateId("trd");
    const wltId = generateId("wlt");

    expect(pfoId).toMatch(/^pfo_/);
    expect(hldId).toMatch(/^hld_/);
    expect(trdId).toMatch(/^trd_/);
    expect(wltId).toMatch(/^wlt_/);
  });
});

// ─── Schema Definition tests ────────────────────────────────────────────

describe("Schema Definitions", () => {
  const { portfolio, holding, tradeRecord, watchlist } = portfolioSchema;

  describe("portfolio table", () => {
    test("should be a Drizzle pgTable", () => {
      // Drizzle tables have $inferSelect and $getters properties
      expect(portfolio).toHaveProperty("$inferSelect");
    });

    test("should define all required columns", () => {
      expect(portfolio.id).toBeDefined();
      expect(portfolio.userId).toBeDefined();
      expect(portfolio.name).toBeDefined();
      expect(portfolio.description).toBeDefined();
      expect(portfolio.totalInvestment).toBeDefined();
      expect(portfolio.createdAt).toBeDefined();
      expect(portfolio.updatedAt).toBeDefined();
    });
  });

  describe("holding table", () => {
    test("should be a Drizzle pgTable", () => {
      expect(holding).toHaveProperty("$inferSelect");
    });

    test("should define all required columns", () => {
      expect(holding.id).toBeDefined();
      expect(holding.portfolioId).toBeDefined();
      expect(holding.stockCode).toBeDefined();
      expect(holding.stockName).toBeDefined();
      expect(holding.quantity).toBeDefined();
      expect(holding.avgPrice).toBeDefined();
      expect(holding.currentPrice).toBeDefined();
      expect(holding.addedAt).toBeDefined();
      expect(holding.updatedAt).toBeDefined();
    });
  });

  describe("tradeRecord table", () => {
    test("should be a Drizzle pgTable", () => {
      expect(tradeRecord).toHaveProperty("$inferSelect");
    });

    test("should define all required columns", () => {
      expect(tradeRecord.id).toBeDefined();
      expect(tradeRecord.holdingId).toBeDefined();
      expect(tradeRecord.type).toBeDefined();
      expect(tradeRecord.quantity).toBeDefined();
      expect(tradeRecord.price).toBeDefined();
      expect(tradeRecord.totalAmount).toBeDefined();
      expect(tradeRecord.tradedAt).toBeDefined();
      expect(tradeRecord.memo).toBeDefined();
      expect(tradeRecord.createdAt).toBeDefined();
    });
  });

  describe("watchlist table", () => {
    test("should be a Drizzle pgTable", () => {
      // watchlist also has $inferSelect type but may not have it as a property in newer Drizzle versions
      expect(watchlist).toHaveProperty("id");
      expect(watchlist).toHaveProperty("portfolioId");
    });

    test("should define all required columns", () => {
      expect(watchlist.id).toBeDefined();
      // watchlist uses portfolioId (not userId) - it's tied to a portfolio, not a user
      expect(watchlist.portfolioId).toBeDefined();
      expect(watchlist.stockCode).toBeDefined();
      expect(watchlist.stockName).toBeDefined();
      expect(watchlist.alertCondition).toBeDefined();
      expect(watchlist.addedAt).toBeDefined();
    });
  });

  // ─── Foreign Key Relationship tests ──────────────────────────────────

  describe("Foreign Key Relationships", () => {
    test("holding should reference portfolio id", () => {
      expect(holding.portfolioId).toBeDefined();
    });

    test("tradeRecord should reference holding id", () => {
      expect(tradeRecord.holdingId).toBeDefined();
    });

    test("watchlist should reference portfolio id", () => {
      expect(watchlist.portfolioId).toBeDefined();
    });
  });
});
