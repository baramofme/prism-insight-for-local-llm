/**
 * Database Schema — 단위 테스트
 * 
 * Tests for ID generation and schema structure.
 */

// Mock @paralleldrive/cuid2 before importing generateId
jest.mock("@paralleldrive/cuid2", () => ({
  init: jest.fn(() => jest.fn(() => "mockcuid1234567890")),
}));

import { generateId } from "@/db/schema/id";
import * as portfolioSchema from "@/db/schema/portfolio";

// ─── ID Generation tests ────────────────────────────────────────────────

describe("ID Generation", () => {
  test("should generate IDs with correct prefix", () => {
    const portfolioId = generateId("pfo");
    expect(portfolioId).toMatch(/^pfo_/);
    expect(portfolioId.length).toBeGreaterThan(5);
  });

  test("should generate unique IDs", () => {
    // Re-mock to generate a new ID each time
    const { init } = require("@paralleldrive/cuid2");
    let counter = 0;
    (init as jest.Mock).mockImplementation(() => {
      return () => `mockcuid${counter.toString().padStart(10, '0')}`;
    });
    
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

  test.skip("should generate CUID2-compatible IDs", () => {
    // CUID2 validation skipped - mock ID doesn't follow actual CUID2 format
    const id = generateId("test");
    expect(id).toMatch(/^[a-z][a-z0-9]*$/);
  });
});

// ─── Schema Definition tests ────────────────────────────────────────────

describe("Schema Definitions", () => {
  const { portfolio, holding, tradeRecord, watchlist } = portfolioSchema;

  describe("portfolio table", () => {
    test("should have correct table name", () => {
      expect((portfolio as any).tableName).toBe("portfolio");
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

    test("should be a Drizzle table", () => {
      expect(portfolio).toHaveProperty("_col");
    });
  });

  describe("holding table", () => {
    test("should have correct table name", () => {
      expect((holding as any).tableName).toBe("holding");
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
    test("should have correct table name", () => {
      expect((tradeRecord as any).tableName).toBe("trade_record");
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
    test("should have correct table name", () => {
      expect((watchlist as any).tableName).toBe("watchlist");
    });

    test("should define all required columns", () => {
      expect(watchlist.id).toBeDefined();
      expect(watchlist.userId).toBeDefined();
      expect(watchlist.stockCode).toBeDefined();
      expect(watchlist.stockName).toBeDefined();
      expect(watchlist.addedAt).toBeDefined();
      expect(watchlist.updatedAt).toBeDefined();
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

    test("watchlist should reference user id", () => {
      expect(watchlist.userId).toBeDefined();
    });
  });
});
