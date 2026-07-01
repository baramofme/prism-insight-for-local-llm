/**
 * API Route — 라우트 구조 테스트
 * 
 * Tests verifying route handler exports exist (without executing DB logic).
 */

// Mock the database module before any imports
jest.mock("@/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
  portfolio: { id: "portfolio.id", userId: "portfolio.userId", name: "portfolio.name" },
  holding: { id: "holding.id", portfolioId: "holding.portfolioId" },
  tradeRecord: { id: "tradeRecord.id", holdingId: "tradeRecord.holdingId" },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({ data })),
  },
}));

describe("API Route Structure", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe("Portfolio Routes", () => {
    test("should export GET and POST handlers", async () => {
      const { GET, POST } = await import("@/app/api/v1/portfolio/route");
      expect(GET).toBeDefined();
      expect(typeof GET).toBe("function");
      expect(POST).toBeDefined();
      expect(typeof POST).toBe("function");
    });
  });

  describe("Portfolio Detail Routes", () => {
    test("should export GET and DELETE handlers", async () => {
      const { GET, DELETE } = await import("@/app/api/v1/portfolio/[id]/route");
      expect(GET).toBeDefined();
      expect(typeof GET).toBe("function");
      expect(DELETE).toBeDefined();
      expect(typeof DELETE).toBe("function");
    });
  });

  describe("Holding Routes", () => {
    test("should export GET and POST handlers for portfolio holding", async () => {
      const { GET, POST } = await import("@/app/api/v1/portfolio/[id]/holding/route");
      expect(GET).toBeDefined();
      expect(typeof GET).toBe("function");
      expect(POST).toBeDefined();
      expect(typeof POST).toBe("function");
    });

    test("should export PATCH handler for holding detail", async () => {
      const { PATCH } = await import("@/app/api/v1/portfolio/[id]/holding/[holdingId]/route");
      expect(PATCH).toBeDefined();
      expect(typeof PATCH).toBe("function");
    });
  });

  describe("Trade Routes", () => {
    test("should export GET and POST handlers", async () => {
      const { GET, POST } = await import("@/app/api/v1/trade/route");
      expect(GET).toBeDefined();
      expect(typeof GET).toBe("function");
      expect(POST).toBeDefined();
      expect(typeof POST).toBe("function");
    });
  });
});
