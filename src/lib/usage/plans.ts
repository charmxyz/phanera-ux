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
    maxActionsPerPersona: 20,
    maxDurationMsPerPersona: 8 * 60_000,
    screenshots: "all" as "key" | "all",
    scansPerDay: 40,
  },
} as const;

export function planLimits(plan: string | null | undefined) {
  return PLAN_LIMITS[(plan as PlanId) in PLAN_LIMITS ? (plan as PlanId) : "free"];
}
