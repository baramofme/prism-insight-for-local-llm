/**
 * Single Holding API routes
 * PATCH  /api/v1/portfolio/:id/holding/:holdingId — Update current price
 */
import { NextResponse } from "next/server";
import { db, holding } from "@/db";
import { eq } from "drizzle-orm";

// ─── PATCH /api/v1/portfolio/:id/holding/:holdingId — Update current price ──
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; holdingId: string }> }
) {
  try {
    const { holdingId } = await params;
    const body = await request.json();
    const { currentPrice } = body;

    if (!currentPrice) {
      return NextResponse.json(
        { success: false, error: "currentPrice is required" },
        { status: 400 }
      );
    }

    const [updatedHolding] = await db
      .update(holding)
      .set({ currentPrice: currentPrice.toString() })
      .where(eq(holding.id, holdingId))
      .returning();

    if (!updatedHolding) {
      return NextResponse.json(
        { success: false, error: "Holding not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedHolding });
  } catch (error) {
    console.error("Failed to update current price:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
