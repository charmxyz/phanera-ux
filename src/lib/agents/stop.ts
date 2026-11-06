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

/** A test whose worker died gets this many automatic restarts before it is failed. */
export const MAX_TEST_ATTEMPTS = 2;

/**
 * Recovers a test whose worker died mid-run (no heartbeat). The first time, it is reset and
 * queued again so it runs from scratch; after that it is failed and refunded.
 */
export async function recoverOrphanedTest(
  test: { id: string; user_id: string; attempts: number; cancel_requested_at: string | null },
  /** False for planned restarts (redeploys), which shouldn't use up the retry. */
  countAttempt = true,
) {
  const db = createAdminClient();
  if (test.cancel_requested_at || (countAttempt && test.attempts + 1 >= MAX_TEST_ATTEMPTS)) {
    // Out of retries (or the user asked to stop): finish it off like a force stop.
    await db
      .from("sessions")
      .update({ status: "failed", error: "The test worker stopped unexpectedly.", current_activity: null, completed_at: new Date().toISOString() })
      .eq("test_id", test.id)
      .in("status", ["queued", "running"]);
    await db
      .from("tests")
      .update({ status: "failed", error: "The test worker stopped unexpectedly twice. This run wasn't counted against your usage; please try again.", completed_at: new Date().toISOString() })
      .eq("id", test.id)
      .in("status", ["running", "evaluating"]);
    await refundTestRun(test.user_id, test.id);
    return "failed" as const;
  }
  // Start over cleanly: drop partial steps and findings, reset every session.
  const { data: sessions } = await db.from("sessions").select("id").eq("test_id", test.id);
  const ids = (sessions ?? []).map((s) => s.id);
  if (ids.length) await db.from("session_events").delete().in("session_id", ids);
  await db.from("findings").delete().eq("test_id", test.id);
  await db
    .from("sessions")
    .update({
      status: "queued", outcome: null, evaluation: null, agent_summary: null, duration_ms: null, action_count: 0,
      current_activity: "Restarting after a worker interruption", error: null, started_at: null, completed_at: null,
    })
    .eq("test_id", test.id);
  await db
    .from("tests")
    .update({ status: "queued", attempts: test.attempts + (countAttempt ? 1 : 0), heartbeat_at: null, error: null, summary: null })
    .eq("id", test.id)
    .in("status", ["running", "evaluating"]);
  return "requeued" as const;
}
