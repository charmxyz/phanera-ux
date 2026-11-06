import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { refundTestRun } from "@/lib/usage/usage";

/** How long the worker gets to stop a test by itself before it is force-stopped. */
export const STOP_GRACE_MS = 60_000;

export const STOPPED_SESSION_MSG = "Stopped before this persona finished.";

/**
 * Stops a test without the worker's help (it is unresponsive, or the test never started).
 * Unfinished sessions are marked stopped. The run is refunded when no persona finished.
 */
export async function forceStopTest(testId: string, userId: string) {
  const db = createAdminClient();
  await db
    .from("sessions")
    .update({ status: "failed", error: STOPPED_SESSION_MSG, current_activity: null, completed_at: new Date().toISOString() })
    .eq("test_id", testId)
    .in("status", ["queued", "running"]);
  const { count } = await db.from("sessions").select("id", { count: "exact", head: true }).eq("test_id", testId).eq("status", "completed");
  const anyFinished = (count ?? 0) > 0;
  await db
    .from("tests")
    .update({
      status: anyFinished ? "partial" : "failed",
      error: anyFinished
        ? "Stopped before the report was written. The finished sessions are below."
        : "Stopped before any persona finished. This run wasn't counted against your usage.",
      completed_at: new Date().toISOString(),
    })
    .eq("id", testId)
    .in("status", ["queued", "running", "evaluating"]);
  if (!anyFinished) await refundTestRun(userId, testId);
}
