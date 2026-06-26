// Single source of truth for plan limits.
// Referenced by the Stripe plugin config in lib/auth.ts.
export const planLimits = {
  free: { members: 1 },
  starter: { members: 5 },
  pro: { members: 50 },
} as const;

export type PlanName = keyof typeof planLimits;
