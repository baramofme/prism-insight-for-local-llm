-- Portfolio Management Tables Migration
-- Created: 2026-07-01

CREATE TABLE "portfolio" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"total_investment" decimal DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_user_name_unique" UNIQUE("user_id","name")
);--> statement-breakpoint
CREATE TABLE "holding" (
	"id" text PRIMARY KEY NOT NULL,
	"portfolio_id" text NOT NULL,
	"stock_code" text NOT NULL,
	"stock_name" text NOT NULL,
	"quantity" decimal DEFAULT '0' NOT NULL,
	"avg_price" decimal DEFAULT '0' NOT NULL,
	"current_price" decimal DEFAULT '0',
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "holding_portfolio_stock_unique" UNIQUE("portfolio_id","stock_code")
);--> statement-breakpoint
CREATE TABLE "trade_record" (
	"id" text PRIMARY KEY NOT NULL,
	"holding_id" text NOT NULL,
	"type" text NOT NULL,
	"quantity" decimal NOT NULL,
	"price" decimal NOT NULL,
	"total_amount" decimal NOT NULL,
	"traded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "watchlist" (
	"id" text PRIMARY KEY NOT NULL,
	"portfolio_id" text NOT NULL,
	"stock_code" text NOT NULL,
	"stock_name" text,
	"alert_condition" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watchlist_portfolio_stock_unique" UNIQUE("portfolio_id","stock_code")
);--> statement-breakpoint
-- Foreign Keys
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holding" ADD CONSTRAINT "holding_portfolio_id_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_record" ADD CONSTRAINT "trade_record_holding_id_holding_id_fk" FOREIGN KEY ("holding_id") REFERENCES "public"."holding"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_portfolio_id_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Indexes
CREATE INDEX "portfolio_user_id_idx" ON "portfolio" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "holding_portfolio_id_idx" ON "holding" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "trade_record_holding_id_idx" ON "trade_record" USING btree ("holding_id");--> statement-breakpoint
CREATE INDEX "trade_record_traded_at_idx" ON "trade_record" USING btree ("traded_at");--> statement-breakpoint
CREATE INDEX "watchlist_portfolio_id_idx" ON "watchlist" USING btree ("portfolio_id");
