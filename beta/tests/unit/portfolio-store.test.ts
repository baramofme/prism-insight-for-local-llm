/**
 * Portfolio Zustand Store — 단위 테스트
 * 
 * Tests for state management, actions, and persistence.
 */

// Mock localStorage before any imports
const storage = Object.create(null);
const localStorageMock: Storage = {
  length: 0,
  clear: () => { storage.length = 0; },
  getItem: (key: string) => storage[key] || null,
  key: (_index: number) => null,
  removeItem: (key: string) => { delete storage[key]; },
  setItem: (key: string, value: string) => { storage[key] = value; storage.length = Object.keys(storage).length; },
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch globally
global.fetch = jest.fn();

describe("Portfolio Store", () => {
  let usePortfolioStore: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Clear localStorage between tests
    storage.length = 0;
    
    // Reset module cache to get fresh store instance
    jest.resetModules();
    usePortfolioStore = require("@/stores/portfolio-store").usePortfolioStore;
  });

  // ─── Initial State tests ──────────────────────────────────────────────

  describe("initial state", () => {
    test("should initialize with empty portfolios array", () => {
      const store = usePortfolioStore.getState();
      expect(store.portfolios).toEqual([]);
    });

    test("should initialize with null selectedPortfolio", () => {
      const store = usePortfolioStore.getState();
      expect(store.selectedPortfolio).toBeNull();
    });

    test("should initialize with empty holdings array", () => {
      const store = usePortfolioStore.getState();
      expect(store.holdings).toEqual([]);
    });

    test("should initialize with empty trades array", () => {
      const store = usePortfolioStore.getState();
      expect(store.trades).toEqual([]);
    });

    test("should initialize with isLoading false", () => {
      const store = usePortfolioStore.getState();
      expect(store.isLoading).toBe(false);
    });

    test("should initialize with error null", () => {
      const store = usePortfolioStore.getState();
      expect(store.error).toBeNull();
    });
  });

  // ─── selectPortfolio tests ────────────────────────────────────────────

  describe("selectPortfolio", () => {
    test("should set the selected portfolio", () => {
      const store = usePortfolioStore.getState();
      const testPortfolio: any = {
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
    test("should update portfolios on successful API response", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
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
        }),
      });

      const store = usePortfolioStore.getState();
      await store.fetchPortfolios();

      expect(store.portfolios.length).toBe(1);
      expect(store.portfolios[0].name).toBe("Portfolio 1");
      expect(store.isLoading).toBe(false);
    });

    test("should set error on failed API response", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          success: false,
          error: "API Error",
        }),
      });

      const store = usePortfolioStore.getState();
      await store.fetchPortfolios();

      expect(store.error).toBe("API Error");
      expect(store.isLoading).toBe(false);
    });

    test("should set network error on fetch failure", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network fail"));

      const store = usePortfolioStore.getState();
      await store.fetchPortfolios();

      expect(store.error).toContain("Network error");
      expect(store.isLoading).toBe(false);
    });
  });

  // ─── createPortfolio tests ────────────────────────────────────────────

  describe("createPortfolio", () => {
    test("should return null and set error on failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          success: false,
          error: "Creation failed",
        }),
      });

      const store = usePortfolioStore.getState();
      const result = await store.createPortfolio({ name: "Failed Portfolio" });

      expect(result).toBeNull();
      expect(store.error).toBe("Creation failed");
    });
  });

  // ─── deletePortfolio tests ────────────────────────────────────────────

  describe("deletePortfolio", () => {
    test("should remove portfolio from list on successful deletion", async () => {
      const store = usePortfolioStore.getState();
      
      // Set up initial state with portfolios directly
      store.portfolios = [
        { id: "pfo_keep", userId: "u1", name: "Keep", totalInvestment: "0", createdAt: new Date(), updatedAt: new Date() },
        { id: "pfo_delete", userId: "u1", name: "Delete Me", totalInvestment: "0", createdAt: new Date(), updatedAt: new Date() },
      ];
      store.selectedPortfolio = store.portfolios[1];

      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true, data: null }),
      });

      const result = await store.deletePortfolio("pfo_delete");

      expect(result).toBe(true);
      expect(store.portfolios.length).toBe(1);
      expect(store.portfolios[0].id).toBe("pfo_keep");
      expect(store.selectedPortfolio).toBeNull();
    });
  });

  // ─── fetchHoldings tests ──────────────────────────────────────────────

  describe("fetchHoldings", () => {
    test("should update holdings on successful API response", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
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
        }),
      });

      const store = usePortfolioStore.getState();
      await store.fetchHoldings("pfo_1");

      expect(store.holdings.length).toBe(1);
      expect(store.holdings[0].stockCode).toBe("005930");
      expect(store.holdings[0].stockName).toBe("Samsung Electronics");
    });
  });

  // ─── addHolding tests ─────────────────────────────────────────────────

  describe("addHolding", () => {
    test("should return error when no portfolio is selected", async () => {
      const store = usePortfolioStore.getState();
      store.selectedPortfolio = null;

      const result = await store.addHolding({
        stockCode: "005930",
        stockName: "Samsung Electronics",
        quantity: 10,
        price: "70000",
        type: "buy",
      });

      expect(result).toBeNull();
      expect(store.error).toBe("No portfolio selected");
    });
  });

  // ─── fetchTrades tests ────────────────────────────────────────────────

  describe("fetchTrades", () => {
    test("should fetch trades with holdingId filter", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
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
        }),
      });

      const store = usePortfolioStore.getState();
      await store.fetchTrades({ holdingId: "hld_1" });

      expect(store.trades.length).toBe(1);
      expect(store.trades[0].type).toBe("buy");
    });
  });

  // ─── updateCurrentPrice tests ─────────────────────────────────────────

  describe("updateCurrentPrice", () => {
    test("should update current price in holdings list", async () => {
      const store = usePortfolioStore.getState();
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

      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true, data: null }),
      });

      await store.updateCurrentPrice("hld_1", "72000");

      expect(store.holdings[0].currentPrice).toBe("72000");
    });
  });

  // ─── Type Validation tests ────────────────────────────────────────────

  describe("type definitions", () => {
    test("store should have all action functions", () => {
      const store = usePortfolioStore.getState();
      
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
