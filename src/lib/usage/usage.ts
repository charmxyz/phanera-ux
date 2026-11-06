import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { BILLING_COLUMNS, effectivePlan, planLimits } from "./plans";

export async function getUsageSummary(userId: string) {
  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select(BILLING_COLUMNS).eq("id", userId).single();
  const plan = effectivePlan(profile);
  const limits = planLimits(plan);
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  let q = db.from("usage").select("quantity").eq("user_id", userId).eq("usage_type", "test_run");
  if (limits.monthlyTestRuns != null) q = q.gte("created_at", monthStart.toISOString());
  const { data } = await q;
  const used = (data ?? []).reduce((a, r) => a + r.quantity, 0);
  const allowance = limits.lifetimeTestRuns ?? limits.monthlyTestRuns ?? 0;
  return {
    plan,
    limits,
    used,
    allowance,
    remaining: Math.max(0, allowance - used),
    period: limits.lifetimeTestRuns != null ? ("lifetime" as const) : ("month" as const),
  };
}

export async function countScansToday(userId: string) {
  const db = createAdminClient();
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { count } = await db
    .from("usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("usage_type", "discovery_scan")
    .gte("created_at", since);
  return count ?? 0;
}

/** Refund a reserved test run when it failed for reasons outside the user's control. */
export async function refundTestRun(userId: string, testId: string) {
  const db = createAdminClient();
  await db.from("usage").delete().eq("user_id", userId).eq("test_id", testId).eq("usage_type", "test_run");
}
