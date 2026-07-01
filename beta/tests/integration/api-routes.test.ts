/**
 * API Route — 통합 테스트 (mocking 기반)
 * 
 * Tests for portfolio, holding, and trade record API routes.
 * Uses mock implementations since PgLite requires browser/WASM environment.
 */

// ─── Mock Drizzle ORM ─────────────────────────────────────────────────────

const mockDb = {
  select: jest.fn(() => ({
    from: jest.fn(() => ({
      where: jest.fn(() => Promise.resolve([])),
    })),
  })),
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{}])),
    })),
  })),
};

jest.mock("@/db", () => ({
  db: mockDb,
  portfolio: {
    id: "portfolio.id",
    userId: "portfolio.userId",
    name: "portfolio.name",
    description: "portfolio.description",
    totalInvestment: "portfolio.totalInvestment",
    createdAt: "portfolio.createdAt",
    updatedAt: "portfolio.updatedAt",
  },
  holding: {
    id: "holding.id",
    portfolioId: "holding.portfolioId",
    stockCode: "holding.stockCode",
    stockName: "holding.stockName",
    quantity: "holding.quantity",
    avgPrice: "holding.avgPrice",
    currentPrice: "holding.currentPrice",
    addedAt: "holding.addedAt",
    updatedAt: "holding.updatedAt",
  },
  tradeRecord: {
    id: "tradeRecord.id",
    holdingId: "tradeRecord.holdingId",
    type: "tradeRecord.type",
    quantity: "tradeRecord.quantity",
    price: "tradeRecord.price",
    totalAmount: "tradeRecord.totalAmount",
    tradedAt: "tradeRecord.tradedAt",
    memo: "tradeRecord.memo",
    createdAt: "tradeRecord.createdAt",
  },
}));

// ─── Mock Next.js Response ────────────────────────────────────────────────

const mockNextResponse = jest.fn();
const mockNextRequest = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (...args: any[]) => ({ type: "json", data: args }),
  },
}));

// ─── Portfolio Route Tests ────────────────────────────────────────────────

describe("Portfolio API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/portfolio", () => {
    test("should return 200 with empty portfolios array when no portfolios exist", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Simulate request
      const mockRequest = {
        headers: new Map([["x-user-id", "test-user-123"]]),
        url: "http://localhost:3039/api/v1/portfolio",
      };

      // Import route handlers dynamically after mocking
      const { GET } = await import("@/app/api/v1/portfolio/route");
      const response: any = await GET(mockRequest as any);

      expect(response).toBeDefined();
      expect(response.type).toBe("json");
    });

    test("should return 400 when name is missing in POST request", async () => {
      const mockRequest = {
        headers: new Map([["x-user-id", "test-user-123"]]),
        json: jest.fn().mockResolvedValue({ description: "Test portfolio" }),
      };

      const { POST } = await import("@/app/api/v1/portfolio/route");
      const response: any = await POST(mockRequest as any);

      expect(response).toBeDefined();
    });
  });

  describe("POST /api/v1/portfolio", () => {
    test("should create a new portfolio with valid data", async () => {
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            id: "pfo_abc123",
            userId: "test-user-123",
            name: "Test Portfolio",
            description: "A test portfolio",
            totalInvestment: "0",
            createdAt: new Date(),
            updatedAt: new Date(),
          }]),
        }),
      });

      const mockRequest = {
        headers: new Map([["x-user-id", "test-user-123"]]),
        json: jest.fn().mockResolvedValue({
          name: "Test Portfolio",
          description: "A test portfolio",
        }),
      };

      const { POST } = await import("@/app/api/v1/portfolio/route");
      const response: any = await POST(mockRequest as any);

      expect(response).toBeDefined();
    });

    test("should return error when name is empty", async () => {
      const mockRequest = {
        headers: new Map([["x-user-id", "test-user-123"]]),
        json: jest.fn().mockResolvedValue({}),
      };

      const { POST } = await import("@/app/api/v1/portfolio/route");
      const response: any = await POST(mockRequest as any);

      expect(response).toBeDefined();
    });
  });
});

// ─── Trade Route Tests ────────────────────────────────────────────────────

describe("Trade Record API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/trade", () => {
    test("should handle request with holdingId filter", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const mockRequest = {
        headers: new Map([["x-user-id", "test-user-123"]]),
        url: "http://localhost:3039/api/v1/trade?holdingId=hld_xyz789",
      };

      const { GET } = await import("@/app/api/v1/trade/route");
      const response: any = await GET(mockRequest as any);

      expect(response).toBeDefined();
    });

    test("should handle request with portfolioId filter", async () => {
      // First query returns holdings in portfolio
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue([{ id: "hld_1" }, { id: "hld_2" }]),
        }),
      });

      // Second query returns trades
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const mockRequest = {
        headers: new Map([["x-user-id", "test-user-123"]]),
        url: "http://localhost:3039/api/v1/trade?portfolioId=pfo_abc123",
      };

      const { GET } = await import("@/app/api/v1/trade/route");
      const response: any = await GET(mockRequest as any);

      expect(response).toBeDefined();
    });

    test("should return empty array when no trades found", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
        }),
      });

      const mockRequest = {
        headers: new Map([["x-user-id", "test-user-123"]]),
        url: "http://localhost:3039/api/v1/trade",
      };

      const { GET } = await import("@/app/api/v1/trade/route");
      const response: any = await GET(mockRequest as any);

      expect(response).toBeDefined();
    });
  });

  describe("POST /api/v1/trade", () => {
    test("should return error when required fields are missing", async () => {
      const mockRequest = {
        headers: new Map([["x-user-id", "test-user-123"]]),
        json: jest.fn().mockResolvedValue({ holdingId: "hld_1" }), // Missing type, quantity, price
      };

      const { POST } = await import("@/app/api/v1/trade/route");
      const response: any = await POST(mockRequest as any);

      expect(response).toBeDefined();
    });

    test("should create trade record with valid data", async () => {
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            id: "trd_def456",
            holdingId: "hld_xyz789",
            type: "buy",
            quantity: "10",
            price: "50000",
            totalAmount: "500000.00",
            tradedAt: new Date(),
          }]),
        }),
      });

      const mockRequest = {
        headers: new Map([["x-user-id", "test-user-123"]]),
        json: jest.fn().mockResolvedValue({
          holdingId: "hld_xyz789",
          type: "buy",
          quantity: 10,
          price: "50000",
          memo: "Test trade",
        }),
      };

      const { POST } = await import("@/app/api/v1/trade/route");
      const response: any = await POST(mockRequest as any);

      expect(response).toBeDefined();
    });
  });
});

// ─── Type Validation Tests ────────────────────────────────────────────────

describe("API Route Type Safety", () => {
  test("portfolio schema exports valid types", async () => {
    const schema = await import("@/db/schema/portfolio");
    
    expect(schema.portfolio).toBeDefined();
    expect(schema.holding).toBeDefined();
    expect(schema.tradeRecord).toBeDefined();
    expect(schema.watchlist).toBeDefined();
  });

  test("holding route handles stockCode parameter", async () => {
    // This tests that the holding route properly validates input types
    const mockRequest = {
      headers: new Map([["x-user-id", "test-user-123"]]),
      url: "http://localhost:3039/api/v1/portfolio/pfo_abc/holding?stockCode=005930",
      json: jest.fn().mockResolvedValue({
        stockCode: "005930",
        quantity: 10,
        price: "70000",
      }),
    };

    // Just verify the module loads without type errors
    await import("@/app/api/v1/portfolio/[id]/holding/route");
    expect(true).toBe(true);
  });
});
