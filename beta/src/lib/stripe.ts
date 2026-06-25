import Stripe from "stripe";
import { env } from "@/lib/env";

// Only called when STRIPE_SECRET_KEY is verified present (see lib/auth.ts).
export function createStripeClient() {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    appInfo: { name: env.APP_NAME },
  });
}
