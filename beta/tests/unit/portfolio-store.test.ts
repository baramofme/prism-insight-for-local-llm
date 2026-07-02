/**
 * Portfolio Zustand Store — 단위 테스트
 * 
 * Tests for state management and actions.
 * 
 * Note: We mock zustand/middleware to bypass persist so tests can run deterministically.
 */

// Mock zustand/middleware BEFORE any other imports
jest.mock("zustand/middleware", () => ({
  persist: (fn: Function) => fn,
}));

// Mock fetch globally before store import
const mockFetchData = new Map<string, any>();
global.fetch = jest.fn((url: string) => {
  const data = mockFetchData.get(url) || {};
  return Promise.resolve({
    json: () => Promise.resolve(data),
  } as any);
});

describe("Portfolio Store", () => {
  let usePortfolioStore: any;
  let store: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFetchData.clear();
    
    // Reset modules to get fresh store instance
    jest.resetModules();
    
    // Import after mocking
    usePortfolioStore = require("@/stores/portfolio-store").usePortfolioStore;
    store = usePortfolioStore.getState();
  });

  // ─── Initial State tests ──────────────────────────────────────────────

  describe("initial state", () => {
    test("should initialize with empty portfolios array", () => {
      expect(store.portfolios).toEqual([]);
    });

    test("should initialize with null selectedPortfolio", () => {
      expect(store.selectedPortfolio).toBeNull();
    });

    test("should initialize with empty holdings array", () => {
      expect(store.holdings).toEqual([]);
    });

    test("should initialize with empty trades array", () => {
      expect(store.trades).toEqual([]);
    });

    test("should initialize with isLoading false", () => {
      expect(store.isLoading).toBe(false);
    });

    test("should initialize with error null", () => {
      expect(store.error).toBeNull();
    });
  });

  // ─── selectPortfolio tests ────────────────────────────────────────────

  describe("selectPortfolio", () => {
    test("should set the selected portfolio", () => {
      const testPortfolio = {
        id: "pfo_test123",
        userId: "user123",
        name: "Test Portfolio",
        totalInvestment: "1000000",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.selectPortfolio(testPortfolio);
      expect(store.selectedPortfolio).toEqual(testPortfolio);
    });
  });

  // ─── fetchPortfolios tests ────────────────────────────────────────────

  describe("fetchPortfolios", () => {
    beforeEach(() => {
      mockFetchData.set("/api/v1/portfolio", {
        success: true,
        data: [
          {
            id: "pfo_1",
            userId: "user123",
            name: "Portfolio 1",
            totalInvestment: "1000000",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        ],
      });
    });

    test("should update portfolios on successful API response", async () => {
      await store.fetchPortfolios();

      expect(store.portfolios.length).toBe(1);
      expect(store.portfolios[0].name).toBe("Portfolio 1");
      expect(store.isLoading).toBe(false);
    });

    test("should set error on failed API response", async () => {
      mockFetchData.set("/api/v1/portfolio", {
        success: false,
        error: "API Error",
      });

      await store.fetchPortfolios();

      expect(store.error).toBe("API Error");
      expect(store.isLoading).toBe(false);
    });

    test("should handle network errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network fail"));

      await store.fetchPortfolios();

      expect(store.error).toContain("Network error");
      expect(store.isLoading).toBe(false);
    });
  });

  // ─── createPortfolio tests ────────────────────────────────────────────

  describe("createPortfolio", () => {
    test("should return new portfolio on success", async () => {
      mockFetchData.set("/api/v1/portfolio", {
        success: true,
        data: {
          id: "pfo_new",
          userId: "user123",
          name: "New Portfolio",
          totalInvestment: "0",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      });

      const result = await store.createPortfolio({ name: "New Portfolio" });

      expect(result).toBeDefined();
      expect(result!.name).toBe("New Portfolio");
      expect(store.isLoading).toBe(false);
    });

    test("should return null and set error on failure", async () => {
      mockFetchData.set("/api/v1/portfolio", {
        success: false,
        error: "Creation failed",
      });

      const result = await store.createPortfolio({ name: "Failed Portfolio" });

      expect(result).toBeNull();
      expect(store.error).toBe("Creation failed");
    });
  });

  // ─── deletePortfolio tests ────────────────────────────────────────────

  describe("deletePortfolio", () => {
    beforeEach(() => {
      // Set up initial state by direct property assignment
      store.portfolios = [
        { id: "pfo_keep", userId: "u1", name: "Keep", totalInvestment: "0", createdAt: new Date(), updatedAt: new Date() },
        { id: "pfo_delete", userId: "u1", name: "Delete Me", totalInvestment: "0", createdAt: new Date(), updatedAt: new Date() },
      ];
      store.selectedPortfolio = store.portfolios[1];
      
      mockFetchData.set("/api/v1/portfolio/pfo_delete", { success: true, data: null });
    });

    test("should remove portfolio from list on successful deletion", async () => {
      const result = await store.deletePortfolio("pfo_delete");

      expect(result).toBe(true);
      expect(store.portfolios.length).toBe(1);
      expect(store.portfolios[0].id).toBe("pfo_keep");
      expect(store.selectedPortfolio).toBeNull();
    });

    test("should return false and set error on failure", async () => {
      mockFetchData.set("/api/v1/portfolio/pfo_delete", { success: false, error: "Delete failed" });

      const result = await store.deletePortfolio("pfo_delete");

      expect(result).toBe(false);
      expect(store.error).toBe("Delete failed");
    });
  });

  // ─── fetchHoldings tests ──────────────────────────────────────────────

  describe("fetchHoldings", () => {
    beforeEach(() => {
      mockFetchData.set("/api/v1/portfolio/pfo_1/holding", {
        success: true,
        data: [
          {
            id: "hld_1",
            portfolioId: "pfo_1",
            stockCode: "005930",
            stockName: "Samsung Electronics",
            quantity: 10,
            avgPrice: "70000",
            currentPrice: "72000",
            addedAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        ],
      });
    });

    test("should update holdings on successful API response", async () => {
      await store.fetchHoldings("pfo_1");

      expect(store.holdings.length).toBe(1);
      expect(store.holdings[0].stockCode).toBe("005930");
      expect(store.holdings[0].stockName).toBe("Samsung Electronics");
      expect(store.isLoading).toBe(false);
    });
  });

  // ─── addHolding tests ─────────────────────────────────────────────────

  describe("addHolding", () => {
    beforeEach(() => {
      store.selectedPortfolio = null;
    });

    test("should return null when no portfolio is selected", async () => {
      const result = await store.addHolding({
        stockCode: "005930",
        stockName: "Samsung Electronics",
        quantity: 10,
        price: "70000",
        type: "buy",
      });

      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should call API with correct data when portfolio is selected", async () => {
      store.selectedPortfolio = { id: "pfo_1" } as any;
      
      mockFetchData.set("/api/v1/portfolio/pfo_1/holding", {
        success: true,
        data: {
          id: "hld_new",
          portfolioId: "pfo_1",
          stockCode: "005930",
          stockName: "Samsung Electronics",
          quantity: 10,
          avgPrice: "70000",
          currentPrice: "71000",
          addedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await store.addHolding({
        stockCode: "005930",
        stockName: "Samsung Electronics",
        quantity: 10,
        price: "70000",
        type: "buy",
      });

      expect(result).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/portfolio/pfo_1/holding",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });

  // ─── fetchTrades tests ────────────────────────────────────────────────

  describe("fetchTrades", () => {
    beforeEach(() => {
      mockFetchData.set("/api/v1/trade?holdingId=hld_1", {
        success: true,
        data: [
          {
            id: "trd_1",
            holdingId: "hld_1",
            type: "buy" as const,
            quantity: "10",
            price: "70000",
            totalAmount: "700000",
            tradedAt: "2024-01-01T00:00:00Z",
          },
        ],
      });
    });

    test("should fetch trades with holdingId filter", async () => {
      await store.fetchTrades({ holdingId: "hld_1" });

      expect(store.trades.length).toBe(1);
      expect(store.trades[0].type).toBe("buy");
    });

    test("should call API with correct query params", async () => {
      mockFetchData.set("/api/v1/trade?holdingId=hld_123", {
        success: true,
        data: [],
      });

      await store.fetchTrades({ holdingId: "hld_123" });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/trade?holdingId=hld_123",
        expect.any(Object)
      );
    });
  });

  // ─── updateCurrentPrice tests ─────────────────────────────────────────

  describe("updateCurrentPrice", () => {
    beforeEach(() => {
      // Set up initial holdings by direct property assignment
      store.holdings = [
        {
          id: "hld_1",
          portfolioId: "pfo_1",
          stockCode: "005930",
          stockName: "Samsung Electronics",
          quantity: 10,
          avgPrice: "70000",
          currentPrice: "71000",
          addedAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      mockFetchData.set("/api/v1/portfolio/holding/hld_1", { success: true, data: null });
    });

    test("should update current price in holdings list", async () => {
      await store.updateCurrentPrice("hld_1", "72000");

      expect(store.holdings[0].currentPrice).toBe("72000");
    });
  });

  // ─── Type Validation tests ────────────────────────────────────────────

  describe("type definitions", () => {
    test("store should have all action functions", () => {
      // Portfolio actions
      expect(typeof store.fetchPortfolios).toBe("function");
      expect(typeof store.createPortfolio).toBe("function");
      expect(typeof store.selectPortfolio).toBe("function");
      expect(typeof store.deletePortfolio).toBe("function");

      // Holding actions
      expect(typeof store.fetchHoldings).toBe("function");
      expect(typeof store.addHolding).toBe("function");
      expect(typeof store.updateCurrentPrice).toBe("function");

      // Trade actions
      expect(typeof store.fetchTrades).toBe("function");
    });
  });
});
