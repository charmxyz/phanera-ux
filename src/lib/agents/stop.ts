import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { refundTestRun } from "@/lib/usage/usage";

/** How long the worker gets to stop a test by itself before it is force-stopped. */
export const STOP_GRACE_MS = 60_000;

export const STOPPED_SESSION_MSG = "Stopped before this persona finished.";

/**
 * Stops a test without the worker's help (it is unresponsive, or the test never started).
 * Unfinished sessions are marked stopped, but their recorded steps are kept: if any persona
 * took an action, the test moves to "evaluating" and a worker writes the report from those
 * steps (the live job if it is still alive, otherwise the orphan sweep via finishFromRecordedSteps).
 * With nothing recorded, the test is failed and refunded.
 */
export async function forceStopTest(testId: string, userId: string): Promise<"reporting" | "stopped"> {
  const db = createAdminClient();
  await db
    .from("sessions")
    .update({ status: "failed", error: STOPPED_SESSION_MSG, current_activity: null, completed_at: new Date().toISOString() })
    .eq("test_id", testId)
    .in("status", ["queued", "running"]);
  const { data: sessions } = await db.from("sessions").select("id").eq("test_id", testId);
  const ids = (sessions ?? []).map((s) => s.id);
  const { count } = ids.length
    ? await db.from("session_events").select("id", { count: "exact", head: true }).in("session_id", ids).gt("step", 0)
    : { count: 0 };
  if ((count ?? 0) > 0) {
    await db.from("tests").update({ status: "evaluating" }).eq("id", testId).in("status", ["queued", "running"]);
    return "reporting";
  }
  await failInterruptedTest({ id: testId, user_id: userId }, "Stopped before any persona took an action. This run wasn't counted against your usage.");
  return "stopped";
}

/** Fails a test that can't be finished (nothing recorded, or salvaging it failed too) and refunds it. */
export async function failInterruptedTest(test: { id: string; user_id: string }, error: string) {
  const db = createAdminClient();
  await db
    .from("sessions")
    .update({ status: "failed", error: "The test worker stopped unexpectedly.", current_activity: null, completed_at: new Date().toISOString() })
    .eq("test_id", test.id)
    .in("status", ["queued", "running"]);
  await db
    .from("tests")
    .update({ status: "failed", error, completed_at: new Date().toISOString() })
    .eq("id", test.id)
    .in("status", ["queued", "running", "evaluating"]);
  await refundTestRun(test.user_id, test.id);
}

/** Writing a report from recorded steps is attempted this many times before the test is failed. */
export const MAX_SALVAGE_ATTEMPTS = 1;
