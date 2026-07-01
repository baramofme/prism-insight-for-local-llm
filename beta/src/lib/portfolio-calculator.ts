/**
 * Portfolio Calculator — Weighted average price calculation utilities.
 * Uses decimal.js for precise financial arithmetic.
 */
import Decimal from "decimal.js";

Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
});

// ─── Type Aliases ────────────────────────────────────────────────────────
export interface TradeInput {
  type: "buy" | "sell";
  quantity: number;
  price: string; // decimal string (e.g., "15000.50")
}

export interface HoldingState {
  quantity: number;
  avgPrice: string; // decimal string
}

// ─── Core Calculation Functions ─────────────────────────────────────────

/**
 * Calculate new weighted average price after a buy transaction.
 * 
 * Formula:
 *   newAvgPrice = (currentAvgPrice × currentQty + newPrice × newQty) / (currentQty + newQty)
 * 
 * @param currentAvgPrice - Current weighted average price (decimal string)
 * @param currentQuantity - Current holding quantity
 * @param newPrice - New purchase price (decimal string)
 * @param newQuantity - Quantity being purchased
 * @returns New weighted average price (decimal string, 2 decimal places)
 */
export function calculateNewAvgPriceOnBuy(
  currentAvgPrice: string,
  currentQuantity: number,
  newPrice: string,
  newQuantity: number
): string {
  if (newQuantity <= 0) {
    return currentAvgPrice; // No change if buying zero
  }

  if (currentQuantity === 0) {
    // First purchase — avg price equals the purchase price
    return new Decimal(newPrice).toFixed(2, Decimal.ROUND_HALF_UP);
  }

  const currentTotalCost = new Decimal(currentAvgPrice).mul(currentQuantity);
  const newCost = new Decimal(newPrice).mul(newQuantity);
  const totalCount = currentQuantity + newQuantity;

  const totalCost = currentTotalCost.add(newCost);
  return totalCost.div(totalCount).toFixed(2, Decimal.ROUND_HALF_UP);
}

/**
 * Calculate new weighted average price after a sell transaction (FIFO method).
 * 
 * When selling, the average price does NOT change for remaining holdings.
 * Only the quantity decreases.
 * 
 * @param currentAvgPrice - Current weighted average price (decimal string)
 * @param currentQuantity - Current holding quantity before sale
 * @param sellQuantity - Quantity being sold
 * @returns Average price after sale (same as input, since FIFO doesn't change avg)
 */
export function calculateNewAvgPriceOnSell(
  currentAvgPrice: string,
  currentQuantity: number,
  sellQuantity: number
): string {
  if (sellQuantity <= 0 || sellQuantity >= currentQuantity) {
    return "0"; // All positions closed or invalid — reset to zero
  }

  // FIFO method: average price stays the same for remaining holdings
  return currentAvgPrice;
}

/**
 * Calculate total profit/loss for a position.
 * 
 * Formula:
 *   pnl = (currentPrice - avgPrice) × quantity
 * 
 * @param currentPrice - Current market price (decimal string)
 * @param avgPrice - Weighted average purchase price (decimal string)
 * @param quantity - Current holding quantity
 * @returns Profit/Loss amount (decimal string, 2 decimal places)
 */
export function calculateProfitLoss(
  currentPrice: string,
  avgPrice: string,
  quantity: number
): string {
  const pnlPerShare = new Decimal(currentPrice).minus(avgPrice);
  const totalPnl = pnlPerShare.mul(quantity);
  return totalPnl.toFixed(2, Decimal.ROUND_HALF_UP);
}

/**
 * Calculate rate of return (percentage).
 * 
 * Formula:
 *   return% = ((currentPrice - avgPrice) / avgPrice) × 100
 * 
 * @param currentPrice - Current market price (decimal string)
 * @param avgPrice - Weighted average purchase price (decimal string)
 * @returns Rate of return percentage (decimal string, 2 decimal places)
 */
export function calculateRateOfReturn(
  currentPrice: string,
  avgPrice: string
): string {
  if (new Decimal(avgPrice).isZero()) {
    return "0"; // Avoid division by zero
  }

  const gain = new Decimal(currentPrice).minus(avgPrice);
  const rate = gain.div(avgPrice).mul(100);
  return rate.toFixed(2, Decimal.ROUND_HALF_UP);
}

/**
 * Calculate total investment value for a holding.
 * 
 * @param quantity - Current holding quantity
 * @param currentPrice - Current market price (decimal string)
 * @returns Total value (decimal string, 2 decimal places)
 */
export function calculateTotalValue(
  quantity: number,
  currentPrice: string
): string {
  return new Decimal(currentPrice).mul(quantity).toFixed(2, Decimal.ROUND_HALF_UP);
}

/**
 * Calculate total cost basis for a holding.
 * 
 * @param quantity - Current holding quantity
 * @param avgPrice - Weighted average purchase price (decimal string)
 * @returns Total cost basis (decimal string, 2 decimal places)
 */
export function calculateCostBasis(
  quantity: number,
  avgPrice: string
): string {
  return new Decimal(avgPrice).mul(quantity).toFixed(2, Decimal.ROUND_HALF_UP);
}

// ─── Batch Operations ────────────────────────────────────────────────────

/**
 * Process multiple trades and calculate final holding state.
 * Useful for replaying trade history to verify current holdings.
 * 
 * @param initialQty - Initial quantity before trades
 * @param initialAvgPrice - Initial average price before trades
 * @param trades - Array of trade inputs (ordered chronologically)
 * @returns Final holding state after all trades
 */
export function processTradeHistory(
  initialQty: number,
  initialAvgPrice: string,
  trades: TradeInput[]
): HoldingState {
  let qty = initialQty;
  let avgPrice = initialAvgPrice;

  for (const trade of trades) {
    if (trade.type === "buy") {
      avgPrice = calculateNewAvgPriceOnBuy(avgPrice, qty, trade.price, trade.quantity);
      qty += trade.quantity;
    } else {
      // sell
      const canSell = Math.min(trade.quantity, qty);
      if (canSell > 0) {
        avgPrice = calculateNewAvgPriceOnSell(avgPrice, qty, canSell);
        qty -= canSell;
      }
    }
  }

  return { quantity: qty, avgPrice };
}

/**
 * Validate that a trade does not exceed available holdings.
 * 
 * @param currentQuantity - Current holding quantity
 * @param sellQuantity - Quantity attempting to sell
 * @throws Error if selling more than held
 */
export function validateSellOrder(
  currentQuantity: number,
  sellQuantity: number
): void {
  if (sellQuantity <= 0) {
    throw new Error("Sell quantity must be positive");
  }
  if (sellQuantity > currentQuantity) {
    throw new Error(
      `Insufficient holdings: requested ${sellQuantity}, available ${currentQuantity}`
    );
  }
}
