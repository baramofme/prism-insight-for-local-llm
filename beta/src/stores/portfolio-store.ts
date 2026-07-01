/**
 * Portfolio Zustand Store
 * Manages portfolio, holdings, and trade state on the client side.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Type Definitions ────────────────────────────────────────────────────

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  totalInvestment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Holding {
  id: string;
  portfolioId: string;
  stockCode: string;
  stockName: string;
  quantity: number;
  avgPrice: string;
  currentPrice?: string;
  addedAt: Date;
  updatedAt: Date;
}

export interface TradeRecord {
  id: string;
  holdingId: string;
  type: "buy" | "sell";
  quantity: string;
  price: string;
  totalAmount: string;
  tradedAt: Date;
  memo?: string;
  createdAt: Date;
  stockCode?: string;
  stockName?: string;
}

interface PortfolioState {
  // State
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  holdings: Holding[];
  trades: TradeRecord[];
  
  // UI state
  isLoading: boolean;
  error: string | null;

  // Portfolio actions
  fetchPortfolios: () => Promise<void>;
  createPortfolio: (data: { name: string; description?: string }) => Promise<Portfolio | null>;
  selectPortfolio: (portfolio: Portfolio) => void;
  deletePortfolio: (id: string) => Promise<boolean>;

  // Holding actions
  fetchHoldings: (portfolioId: string) => Promise<void>;
  addHolding: (holdingData: {
    stockCode: string;
    stockName: string;
    quantity: number;
    price: string;
    type: "buy" | "sell";
  }) => Promise<Holding | null>;
  updateCurrentPrice: (holdingId: string, currentPrice: string) => Promise<void>;

  // Trade actions
  fetchTrades: (params: { holdingId?: string; portfolioId?: string }) => Promise<void>;
}

// ─── Store Creation ──────────────────────────────────────────────────────

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      // Initial state
      portfolios: [],
      selectedPortfolio: null,
      holdings: [],
      trades: [],
      isLoading: false,
      error: null,

      // ── Portfolio Actions ───────────────────────────────────────────
      fetchPortfolios: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/v1/portfolio", {
            headers: { "x-user-id": "demo-user-id" },
          });
          const result = await response.json();
          
          if (result.success) {
            set({ portfolios: result.data });
          } else {
            set({ error: result.error || "Failed to fetch portfolios" });
          }
        } catch (err) {
          set({ error: `Network error: ${err}` });
        } finally {
          set({ isLoading: false });
        }
      },

      createPortfolio: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/v1/portfolio", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": "demo-user-id",
            },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          
          if (result.success) {
            set((state) => ({
              portfolios: [result.data, ...state.portfolios],
            }));
            return result.data;
          } else {
            set({ error: result.error });
            return null;
          }
        } catch (err) {
          set({ error: `Network error: ${err}` });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      selectPortfolio: (portfolio) => {
        set({ selectedPortfolio: portfolio });
        
        // Auto-fetch holdings when selecting a portfolio
        get().fetchHoldings(portfolio.id);
      },

      deletePortfolio: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/portfolio/${id}`, {
            method: "DELETE",
            headers: { "x-user-id": "demo-user-id" },
          });
          const result = await response.json();
          
          if (result.success) {
            set((state) => ({
              portfolios: state.portfolios.filter((p) => p.id !== id),
              holdings: [],
              trades: [],
              selectedPortfolio:
                state.selectedPortfolio?.id === id ? null : state.selectedPortfolio,
            }));
            return true;
          } else {
            set({ error: result.error });
            return false;
          }
        } catch (err) {
          set({ error: `Network error: ${err}` });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Holding Actions ─────────────────────────────────────────────
      fetchHoldings: async (portfolioId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/portfolio/${portfolioId}/holding`, {
            headers: { "x-user-id": "demo-user-id" },
          });
          const result = await response.json();
          
          if (result.success) {
            set({ holdings: result.data });
          } else {
            set({ error: result.error || "Failed to fetch holdings" });
          }
        } catch (err) {
          set({ error: `Network error: ${err}` });
        } finally {
          set({ isLoading: false });
        }
      },

      addHolding: async (holdingData) => {
        const state = get();
        if (!state.selectedPortfolio) {
          set({ error: "No portfolio selected" });
          return null;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `/api/v1/portfolio/${state.selectedPortfolio.id}/holding`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-user-id": "demo-user-id",
              },
              body: JSON.stringify(holdingData),
            }
          );
          const result = await response.json();
          
          if (result.success && result.data) {
            set((state) => ({
              holdings: result.data
                ? state.holdings.map((h) =>
                    h.id === result.data.id ? result.data : h
                  )
                : state.holdings.filter(
                    (h) => h.stockCode !== holdingData.stockCode
                  ), // Remove if position closed
            }));
            return result.data;
          } else {
            set({ error: result.error || "Failed to add holding" });
            return null;
          }
        } catch (err) {
          set({ error: `Network error: ${err}` });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCurrentPrice: async (holdingId, currentPrice) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/portfolio/holding/${holdingId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": "demo-user-id",
            },
            body: JSON.stringify({ currentPrice }),
          });
          const result = await response.json();
          
          if (result.success) {
            set((state) => ({
              holdings: state.holdings.map((h) =>
                h.id === holdingId ? { ...h, currentPrice } : h
              ),
            }));
          } else {
            set({ error: result.error });
          }
        } catch (err) {
          set({ error: `Network error: ${err}` });
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Trade Actions ───────────────────────────────────────────────
      fetchTrades: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (params.holdingId) queryParams.set("holdingId", params.holdingId);
          if (params.portfolioId) queryParams.set("portfolioId", params.portfolioId);

          const response = await fetch(`/api/v1/trade?${queryParams}`, {
            headers: { "x-user-id": "demo-user-id" },
          });
          const result = await response.json();
          
          if (result.success) {
            set({ trades: result.data });
          } else {
            set({ error: result.error || "Failed to fetch trades" });
          }
        } catch (err) {
          set({ error: `Network error: ${err}` });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "portfolio-storage",
      partialize: (state) => ({
        selectedPortfolio: state.selectedPortfolio,
      }),
    }
  )
);
