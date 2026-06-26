// Centralized environment access.
// Real values are required at runtime; build-safe fallbacks keep `next build`
// from throwing when secrets are absent in CI.
export const env = {
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgres://user:pass@localhost:5432/postgres",
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me-please-32-chars-min",
  APP_NAME: process.env.APP_NAME ?? "Prism Insight",
  APP_ORIGIN:
    process.env.APP_ORIGIN ??
    process.env.NEXT_PUBLIC_APP_ORIGIN ??
    "http://localhost:3039",
  ENVIRONMENT: process.env.ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  RESEND_EMAIL_FROM: process.env.RESEND_EMAIL_FROM ?? "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID ?? "",
  STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID ?? "",
  STRIPE_PRO_ANNUAL_PRICE_ID: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "",
} as const;

export type Env = typeof env;
