/**
 * Holding CRUD API routes
 * GET    /api/v1/portfolio/:id/holding     — List holdings for portfolio
 * POST   /api/v1/portfolio/:id/holding     — Add holding (auto-update avg price)
 */
import { NextResponse } from "next/server";
import { db, portfolio, holding, tradeRecord } from "@/db";
import { and, eq } from "drizzle-orm";
import {
  calculateNewAvgPriceOnBuy,
  validateSellOrder,
} from "@/lib/portfolio-calculator";

// ─── GET /api/v1/portfolio/:id/holding — List holdings ──────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params;
    const userId = request.headers.get("x-user-id") || "demo-user-id";

    // Verify portfolio belongs to user
    const portfolioOwner = await db
      .select({ userId: portfolio.userId })
      .from(portfolio)
      .where(eq(portfolio.id, portfolioId))
      .limit(1);

    if (portfolioOwner.length === 0 || portfolioOwner[0].userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found or access denied" },
        { status: 404 }
      );
    }

    const holdingsList = await db
      .select()
      .from(holding)
      .where(eq(holding.portfolioId, portfolioId))
      .orderBy(holding.addedAt);

    return NextResponse.json({ success: true, data: holdingsList });
  } catch (error) {
    console.error("Failed to fetch holdings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── POST /api/v1/portfolio/:id/holding — Add/update holding ────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params;
    const userId = request.headers.get("x-user-id") || "demo-user-id";
    const body = await request.json();
    const { stockCode, stockName, quantity, price, type = "buy", memo } = body;

    if (!stockCode || !quantity || !price) {
      return NextResponse.json(
        { success: false, error: "stockCode, quantity, and price are required" },
        { status: 400 }
      );
    }

    // Verify portfolio belongs to user
    const portfolioOwner = await db
      .select({ userId: portfolio.userId })
      .from(portfolio)
      .where(eq(portfolio.id, portfolioId))
      .limit(1);

    if (portfolioOwner.length === 0 || portfolioOwner[0].userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found or access denied" },
        { status: 404 }
      );
    }

    const qtyNum = typeof quantity === "string" ? parseInt(quantity, 10) : Number(quantity);
    const totalAmount = parseFloat(price) * qtyNum;

    if (type === "buy") {
      // Check if holding already exists for this stock in the portfolio
      const existing = await db
        .select()
        .from(holding)
        .where(and(eq(holding.portfolioId, portfolioId), eq(holding.stockCode, stockCode)))
        .limit(1);

      let resultHolding;

      if (existing.length > 0) {
        // Update existing holding with new avg price
        const existingQty = parseFloat(existing[0].quantity as string) || 0;
        const existingAvg = (existing[0].avgPrice as string) || "0";

        const newAvg = calculateNewAvgPriceOnBuy(
          existingAvg,
          existingQty,
          price.toString(),
          qtyNum
        );

        const newQuantity = (existingQty + qtyNum).toString();

        [resultHolding] = await db
          .update(holding)
          .set({
            quantity: newQuantity,
            avgPrice: newAvg,
            currentPrice: price.toString(),
          })
          .where(eq(holding.id, existing[0].id))
          .returning();

        // Record trade - use existing holding id
        await db.insert(tradeRecord).values({
          holdingId: resultHolding.id,
          type: "buy",
          quantity: qtyNum.toString(),
          price: price.toString(),
          totalAmount: totalAmount.toFixed(2),
          memo: memo || undefined,
        });
      } else {
        // Create new holding
        [resultHolding] = await db
          .insert(holding)
          .values({
            portfolioId,
            stockCode,
            stockName: stockName || stockCode,
            quantity: qtyNum.toString(),
            avgPrice: price.toString(), // First purchase = purchase price
            currentPrice: price.toString(),
          })
          .returning();

        // Record trade
        await db.insert(tradeRecord).values({
          holdingId: resultHolding.id,
          type: "buy",
          quantity: qtyNum.toString(),
          price: price.toString(),
          totalAmount: totalAmount.toFixed(2),
          memo: memo || undefined,
        });
      }

      return NextResponse.json({ success: true, data: resultHolding });

    } else if (type === "sell") {
      // Find existing holding
      const existing = await db
        .select()
        .from(holding)
        .where(and(eq(holding.portfolioId, portfolioId), eq(holding.stockCode, stockCode)))
        .limit(1);

      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: "Holding not found" },
          { status: 404 }
        );
      }

      const existingQty = parseFloat(existing[0].quantity as string) || 0;
      
      // Validate sell order
      try {
        validateSellOrder(existingQty, qtyNum);
      } catch (e: any) {
        return NextResponse.json(
          { success: false, error: e.message },
          { status: 400 }
        );
      }

      const remainingQty = (existingQty - qtyNum).toString();

      let resultHolding;
      if (parseFloat(remainingQty) <= 0) {
        // Delete holding if fully sold
        await db.delete(holding).where(eq(holding.id, existing[0].id));
        
        // Record trade against the deleted holding's id
        await db.insert(tradeRecord).values({
          holdingId: existing[0].id,
          type: "sell",
          quantity: qtyNum.toString(),
          price: price.toString(),
          totalAmount: totalAmount.toFixed(2),
          memo: memo || undefined,
        });

        return NextResponse.json({
          success: true,
          data: null,
          message: "Position closed",
        });
      } else {
        [resultHolding] = await db
          .update(holding)
          .set({
            quantity: remainingQty,
          })
          .where(eq(holding.id, existing[0].id))
          .returning();

        // Record trade
        await db.insert(tradeRecord).values({
          holdingId: resultHolding.id,
          type: "sell",
          quantity: qtyNum.toString(),
          price: price.toString(),
          totalAmount: totalAmount.toFixed(2),
          memo: memo || undefined,
        });

        return NextResponse.json({ success: true, data: resultHolding });
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid type. Use 'buy' or 'sell'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Failed to update holding:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
