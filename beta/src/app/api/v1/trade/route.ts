/**
 * Trade Record API routes
 * GET    /api/v1/trade     — List trade records for a holding or portfolio
 * POST   /api/v1/trade     — Manually add a trade record
 */
import { NextResponse } from "next/server";
import { db, portfolio, holding, tradeRecord } from "@/db";
import { and, eq, inArray } from "drizzle-orm";

// ─── GET /api/v1/trade — List trade records ─────────────────────────────
export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id";
    const url = new URL(request.url);
    const holdingId = url.searchParams.get("holdingId");
    const portfolioId = url.searchParams.get("portfolioId");

    let trades: any[] = [];

    if (holdingId) {
      // Filter by specific holding
      trades = await db
        .select({
          id: tradeRecord.id,
          holdingId: tradeRecord.holdingId,
          type: tradeRecord.type,
          quantity: tradeRecord.quantity,
          price: tradeRecord.price,
          totalAmount: tradeRecord.totalAmount,
          tradedAt: tradeRecord.tradedAt,
          memo: tradeRecord.memo,
          createdAt: tradeRecord.createdAt,
          stockCode: holding.stockCode,
          stockName: holding.stockName,
        })
        .from(tradeRecord)
        .innerJoin(holding, eq(tradeRecord.holdingId, holding.id))
        .where(eq(tradeRecord.holdingId, holdingId))
        .orderBy(tradeRecord.tradedAt);
    } else if (portfolioId) {
      // Filter by portfolio - first get all holding ids for this portfolio
      const holdingsInPortfolio = await db
        .select({ id: holding.id })
        .from(holding)
        .where(eq(holding.portfolioId, portfolioId));

      const holdingIds = holdingsInPortfolio.map((h) => h.id);

      if (holdingIds.length > 0) {
        trades = await db
          .select({
            id: tradeRecord.id,
            holdingId: tradeRecord.holdingId,
            type: tradeRecord.type,
            quantity: tradeRecord.quantity,
            price: tradeRecord.price,
            totalAmount: tradeRecord.totalAmount,
            tradedAt: tradeRecord.tradedAt,
            memo: tradeRecord.memo,
            createdAt: tradeRecord.createdAt,
            stockCode: holding.stockCode,
            stockName: holding.stockName,
          })
          .from(tradeRecord)
          .innerJoin(holding, eq(tradeRecord.holdingId, holding.id))
          .where(inArray(tradeRecord.holdingId, holdingIds))
          .orderBy(tradeRecord.tradedAt);
      }
    } else {
      // No filter - return all trades
      trades = await db
        .select({
          id: tradeRecord.id,
          holdingId: tradeRecord.holdingId,
          type: tradeRecord.type,
          quantity: tradeRecord.quantity,
          price: tradeRecord.price,
          totalAmount: tradeRecord.totalAmount,
          tradedAt: tradeRecord.tradedAt,
          memo: tradeRecord.memo,
          createdAt: tradeRecord.createdAt,
          stockCode: holding.stockCode,
          stockName: holding.stockName,
        })
        .from(tradeRecord)
        .innerJoin(holding, eq(tradeRecord.holdingId, holding.id))
        .orderBy(tradeRecord.tradedAt);
    }

    return NextResponse.json({ success: true, data: trades });
  } catch (error) {
    console.error("Failed to fetch trades:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── POST /api/v1/trade — Manually add a trade record ──────────────────
export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id";
    const body = await request.json();
    const { holdingId, type, quantity, price, memo } = body;

    if (!holdingId || !type || !quantity || !price) {
      return NextResponse.json(
        {
          success: false,
          error: "holdingId, type, quantity, and price are required",
        },
        { status: 400 }
      );
    }

    // Verify the holding belongs to user's portfolio
    const holdingWithPortfolio = await db
      .select({
        userId: portfolio.userId,
        holdingId: holding.id,
      })
      .from(holding)
      .innerJoin(portfolio, eq(holding.portfolioId, portfolio.id))
      .where(eq(holding.id, holdingId))
      .limit(1);

    if (
      holdingWithPortfolio.length === 0 ||
      holdingWithPortfolio[0].userId !== userId
    ) {
      return NextResponse.json(
        { success: false, error: "Holding not found or access denied" },
        { status: 404 }
      );
    }

    const qtyNum =
      typeof quantity === "string" ? parseFloat(quantity) : Number(quantity);
    const totalAmount = parseFloat(price) * qtyNum;

    const [newTrade] = await db
      .insert(tradeRecord)
      .values({
        holdingId,
        type,
        quantity: qtyNum.toString(),
        price: price.toString(),
        totalAmount: totalAmount.toFixed(2),
        memo: memo || undefined,
      })
      .returning();

    return NextResponse.json({ success: true, data: newTrade });
  } catch (error) {
    console.error("Failed to create trade record:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
