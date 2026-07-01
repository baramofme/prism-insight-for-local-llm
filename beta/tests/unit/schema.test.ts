/**
 * Database Schema — 단위 테스트
 * 
 * Tests for ID generation and schema structure (without importing the full db module).
 */
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

  test("should generate CUID2-compatible IDs", () => {
    // CUID2 IDs are alphanumeric (lowercase) and start with a letter
    const id = generateId("test");
    expect(id).toMatch(/^[a-z][a-z0-9]*$/);
  });
});

// ─── Schema Definition tests ────────────────────────────────────────────

describe("Schema Definitions", () => {
  const { portfolio, holding, tradeRecord, watchlist } = portfolioSchema;

  describe("portfolio table", () => {
    test("should have correct table name", () => {
      expect(portfolio.TableName).toBe("portfolio");
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

    test("should be instance of pgTable", () => {
      expect(portfolio).toHaveProperty("_columnGroups");
    });
  });

  describe("holding table", () => {
    test("should have correct table name", () => {
      expect(holding.TableName).toBe("holding");
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
      expect(tradeRecord.TableName).toBe("trade_record");
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
      expect(watchlist.TableName).toBe("watchlist");
    });

    test("should define all required columns", () => {
      expect(watchlist.id).toBeDefined();
      expect(watchlist.portfolioId).toBeDefined();
      expect(watchlist.stockCode).toBeDefined();
      expect(watchlist.stockName).toBeDefined();
      expect(watchlist.alertCondition).toBeDefined();
      expect(watchlist.addedAt).toBeDefined();
    });
  });
});

// ─── Schema Type tests ──────────────────────────────────────────────────

describe("Schema Types", () => {
  test("should export TypeScript types", () => {
    // These imports verify that the types are exported correctly
    type PortfolioType = typeof portfolioSchema.portfolio.$inferSelect;
    type NewPortfolioType = typeof portfolioSchema.portfolio.$inferInsert;

    type HoldingType = typeof portfolioSchema.holding.$inferSelect;
    type NewHoldingType = typeof portfolioSchema.holding.$inferInsert;

    type TradeRecordType = typeof portfolioSchema.tradeRecord.$inferSelect;
    type NewTradeRecordType = typeof portfolioSchema.tradeRecord.$inferInsert;

    // Type checks compile successfully
    expect(true).toBe(true);
  });
});
