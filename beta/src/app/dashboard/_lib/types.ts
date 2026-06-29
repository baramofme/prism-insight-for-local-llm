export interface StockTransaction {
  id: string;
  date: string;
  type: "매수" | "매도";
  buyPrice: number;
  qty: number;
  profit: number;
  profitPercent: number;
  positive: boolean;
  total: number;
}

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  qty: number;
  dailyProfit: number;
  dailyProfitPercent: number;
  positive: boolean;
  totalAmount: number;
  transactions: StockTransaction[];
}
