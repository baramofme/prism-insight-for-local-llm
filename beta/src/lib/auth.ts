import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { anonymous, organization } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";
import { and, eq } from "drizzle-orm";
import { db, schema as Db, generateAuthId, type AuthModel } from "@/db";
import { env } from "@/lib/env";
import { sendOTP, sendPasswordReset, sendVerificationEmail } from "@/lib/email";
import { planLimits } from "@/lib/plans";
import { createStripeClient } from "@/lib/stripe";

// Stripe billing — only enabled when all required env vars are set.
// Without Stripe config the app works but billing endpoints are absent.
function stripePlugin() {
  if (
    !env.STRIPE_SECRET_KEY ||
    !env.STRIPE_WEBHOOK_SECRET ||
    !env.STRIPE_STARTER_PRICE_ID ||
    !env.STRIPE_PRO_PRICE_ID
  ) {
    return [];
  }

  return [
    stripe({
      stripeClient: createStripeClient(),
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          { name: "starter", priceId: env.STRIPE_STARTER_PRICE_ID, limits: planLimits.starter },
          {
            name: "pro",
            priceId: env.STRIPE_PRO_PRICE_ID,
            annualDiscountPriceId: env.STRIPE_PRO_ANNUAL_PRICE_ID || undefined,
            limits: planLimits.pro,
            freeTrial: { days: 14 },
          },
        ],
        // Personal billing: user manages own sub. Org billing: owner/admin only.
        authorizeReference: async ({ user, referenceId }) => {
          if (referenceId === user.id) return true;
          const [row] = await db
            .select({ role: Db.member.role })
            .from(Db.member)
            .where(
              and(
                eq(Db.member.organizationId, referenceId),
                eq(Db.member.userId, user.id),
              ),
            );
          return row?.role === "owner" || row?.role === "admin";
        },
      },
      organization: { enabled: true },
    }),
  ];
}

const appUrl = new URL(env.APP_ORIGIN);
const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  baseURL: `${env.APP_ORIGIN}/api/auth`,
  trustedOrigins: [env.APP_ORIGIN],
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      identity: Db.identity,
      invitation: Db.invitation,
      member: Db.member,
      organization: Db.organization,
      passkey: Db.passkey,
      session: Db.session,
      subscription: Db.subscription,
      user: Db.user,
      verification: Db.verification,
    },
  }),
  account: { modelName: "identity" },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordReset({ user, url });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ user, url });
    },
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {},
  plugins: [
    anonymous(),
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      creatorRole: "owner",
    }),
    passkey({ rpID: appUrl.hostname, rpName: env.APP_NAME, origin: env.APP_ORIGIN }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const otpType = type === "change-email" ? "email-verification" : type;
        await sendOTP({ email, otp, type: otpType });
      },
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
    }),
    ...stripePlugin(),
    nextCookies(), // must be last — lets server actions set auth cookies
  ],
  advanced: {
    database: {
      generateId: ({ model }) => generateAuthId(model as AuthModel),
    },
  },
});

export type Auth = typeof auth;
