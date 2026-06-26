// Better Auth catch-all handler. Serves every /api/auth/* endpoint, including
// email OTP, passkeys, Google OAuth, organizations, and the Stripe webhook
// (POST /api/auth/stripe/webhook). Runs on the Node.js runtime.
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
