/**
 * Portfolio CRUD API routes
 * GET    /api/v1/portfolio     — List portfolios for authenticated user
 * POST   /api/v1/portfolio     — Create a new portfolio
 */
import { NextResponse } from "next/server";
import { db, portfolio, holding } from "@/db";
import { eq, desc, sql } from "drizzle-orm";

// ─── GET /api/v1/portfolio — List portfolios ─────────────────────────────
export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id";

    const portfolios = await db
      .select({
        id: portfolio.id,
        userId: portfolio.userId,
        name: portfolio.name,
        description: portfolio.description,
        totalInvestment: portfolio.totalInvestment,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
      })
      .from(portfolio)
      .where(eq(portfolio.userId, userId))
      .orderBy(desc(portfolio.createdAt));

    return NextResponse.json({ success: true, data: portfolios });
  } catch (error) {
    console.error("Failed to fetch portfolios:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── POST /api/v1/portfolio — Create portfolio ──────────────────────────
export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id";
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const [newPortfolio] = await db
      .insert(portfolio)
      .values({
        userId,
        name,
        description: description || null,
        totalInvestment: "0",
      })
      .returning();

    return NextResponse.json({ success: true, data: newPortfolio });
  } catch (error) {
    console.error("Failed to create portfolio:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
