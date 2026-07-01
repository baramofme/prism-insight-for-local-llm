/**
 * Single Portfolio API routes
 * GET    /api/v1/portfolio/:id     — Get single portfolio details
 * DELETE /api/v1/portfolio/:id     — Delete portfolio and all related data
 */
import { NextResponse } from "next/server";
import { db, portfolio, holding, tradeRecord, watchlist } from "@/db";
import { eq, asc } from "drizzle-orm";

// ─── GET /api/v1/portfolio/:id — Get single portfolio ───────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params;
    const userId = request.headers.get("x-user-id") || "demo-user-id";

    const [portfolioData] = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.id, portfolioId))
      .limit(1);

    if (!portfolioData || portfolioData.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found or access denied" },
        { status: 404 }
      );
    }

    // Fetch holdings for this portfolio
    const holdingsList = await db
      .select()
      .from(holding)
      .where(eq(holding.portfolioId, portfolioId))
      .orderBy(asc(holding.addedAt));

    // Calculate total value
    let totalValue = 0;
    for (const h of holdingsList) {
      const qty = parseFloat(h.quantity as string) || 0;
      const price = parseFloat((h.currentPrice as string) || "0");
      totalValue += qty * price;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...portfolioData,
        totalValue,
        holdingsCount: holdingsList.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/v1/portfolio/:id — Delete portfolio ────────────────────
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params;
    const userId = request.headers.get("x-user-id") || "demo-user-id";

    // Verify portfolio belongs to user
    const [portfolioData] = await db
      .select({ userId: portfolio.userId })
      .from(portfolio)
      .where(eq(portfolio.id, portfolioId))
      .limit(1);

    if (!portfolioData || portfolioData.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found or access denied" },
        { status: 404 }
      );
    }

    // Cascade delete (holding has onDelete: 'cascade')
    await db.delete(holding).where(eq(holding.portfolioId, portfolioId));
    await db.delete(watchlist).where(eq(watchlist.portfolioId, portfolioId));
    await db.delete(portfolio).where(eq(portfolio.id, portfolioId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete portfolio:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
