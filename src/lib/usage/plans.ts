export type PlanId = "free" | "startup";

export const PLAN_LIMITS = {
  free: {
    label: "Free",
    lifetimeTestRuns: 5,
    monthlyTestRuns: null as number | null,
    personasPerTest: 3,
    pagesPerScan: 10,
    maxActionsPerPersona: 8,
    maxDurationMsPerPersona: 3 * 60_000,
    screenshots: "key" as "key" | "all",
    scansPerDay: 10,
  },
  startup: {
    label: "Startup",
    lifetimeTestRuns: null as number | null,
    monthlyTestRuns: 10,
    personasPerTest: 10,
    pagesPerScan: 50,
    maxActionsPerPersona: 30,
    maxDurationMsPerPersona: 10 * 60_000,
    screenshots: "all" as "key" | "all",
    scansPerDay: 40,
  },
} as const;

export function planLimits(plan: string | null | undefined) {
  return PLAN_LIMITS[(plan as PlanId) in PLAN_LIMITS ? (plan as PlanId) : "free"];
}

export type BillingProfile = {
  plan: string | null;
  billing_provider?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
};

/** Paying subscribers keep access for a few days past the period end if a renewal webhook is late. */
const RENEWAL_GRACE_MS = 3 * 24 * 3600_000;

/**
 * The plan a user is entitled to right now. Webhooks set `plan`, but a cancelled subscription
 * (or a missed renewal) also expires here on its own, so access never outlives what was paid for.
 */
export function effectivePlan(p: BillingProfile | null | undefined): PlanId {
  if (!p || p.plan !== "startup") return "free";
  if (p.billing_provider === "comp") return "startup";
  if (!p.current_period_end) return p.cancel_at_period_end ? "free" : "startup";
  const end = new Date(p.current_period_end).getTime();
  const grace = p.cancel_at_period_end ? 0 : RENEWAL_GRACE_MS;
  return Date.now() > end + grace ? "free" : "startup";
}

export const BILLING_COLUMNS = "plan, billing_provider, current_period_end, cancel_at_period_end";

/** Display price. The amount actually charged is set on the Stripe Price / PayPal plan. */
export const STARTUP_PRICE = { label: "£25", amount: "25.00", currency: "GBP" } as const;
