// Portfolio management schema: portfolio, holding, trade_record, watchlist.
import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { generateId } from "./id";

// ─── portfolio (포트폴리오) ──────────────────────────────────────────────
export const portfolio = pgTable(
  "portfolio",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("pfo")), // pfo_{cuid}
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    totalInvestment: decimal("total_investment", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("portfolio_user_id_idx").on(table.userId),
    uniqueIndex("portfolio_user_name_unique").on(table.userId, table.name),
  ]
);
export type Portfolio = typeof portfolio.$inferSelect;
export type NewPortfolio = typeof portfolio.$inferInsert;

// ─── holding (보유종목) ─────────────────────────────────────────────────
export const holding = pgTable(
  "holding",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("hld")), // hld_{cuid}
    portfolioId: text("portfolio_id")
      .notNull()
      .references(() => portfolio.id, { onDelete: "cascade" }),
    stockCode: text("stock_code").notNull(),
    stockName: text("stock_name").notNull(),
    quantity: decimal("quantity", { precision: 12, scale: 0 }).default("0").notNull(),
    avgPrice: decimal("avg_price", { precision: 12, scale: 2 }).default("0").notNull(),
    currentPrice: decimal("current_price", { precision: 12, scale: 2 }).default("0"),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("holding_portfolio_id_idx").on(table.portfolioId),
    uniqueIndex("holding_portfolio_stock_unique").on(
      table.portfolioId,
      table.stockCode
    ),
  ]
);
export type Holding = typeof holding.$inferSelect;
export type NewHolding = typeof holding.$inferInsert;

// ─── trade_record (거래기록) ──────────────────────────────────────────────
export const tradeRecord = pgTable(
  "trade_record",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("trd")), // trd_{cuid}
    holdingId: text("holding_id")
      .notNull()
      .references(() => holding.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // "buy" | "sell"
    quantity: decimal("quantity", { precision: 12, scale: 0 }).notNull(),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
    tradedAt: timestamp("traded_at", { withTimezone: true }).defaultNow().notNull(),
    memo: text("memo"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("trade_record_holding_id_idx").on(table.holdingId),
    index("trade_record_traded_at_idx").on(table.tradedAt),
  ]
);
export type TradeRecord = typeof tradeRecord.$inferSelect;
export type NewTradeRecord = typeof tradeRecord.$inferInsert;

// ─── watchlist (관심목록) ────────────────────────────────────────────────
export const watchlist = pgTable(
  "watchlist",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("wlt")), // wlt_{cuid}
    portfolioId: text("portfolio_id")
      .notNull()
      .references(() => portfolio.id, { onDelete: "cascade" }),
    stockCode: text("stock_code").notNull(),
    stockName: text("stock_name"),
    alertCondition: text("alert_condition"), // e.g., "price_above_10000"
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("watchlist_portfolio_id_idx").on(table.portfolioId),
    uniqueIndex("watchlist_portfolio_stock_unique").on(
      table.portfolioId,
      table.stockCode
    ),
  ]
);
export type Watchlist = typeof watchlist.$inferSelect;
export type NewWatchlist = typeof watchlist.$inferInsert;

// ─── Relations ───────────────────────────────────────────────────────────
export const portfolioRelations = relations(portfolio, ({ one, many }) => ({
  holdings: many(holding),
  tradeRecords: many(tradeRecord),
  watchlists: many(watchlist),
}));

export const holdingRelations = relations(holding, {
  one: {
    portfolio: one(portfolio, {
      fields: [holding.portfolioId],
      references: [portfolio.id],
    }),
  },
  many: {
    tradeRecords: many(tradeRecord),
  },
});

export const tradeRecordRelations = relations(tradeRecord, {
  one: {
    holding: one(holding, {
      fields: [tradeRecord.holdingId],
      references: [holding.id],
    }),
  },
});

export const watchlistRelations = relations(watchlist, {
  one: {
    portfolio: one(portfolio, {
      fields: [watchlist.portfolioId],
      references: [portfolio.id],
    }),
  },
});
