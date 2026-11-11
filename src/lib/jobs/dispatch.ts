import "server-only";
import { after } from "next/server";

/**
 * Starts background work so long-running scans never depend on a request's lifetime.
 * The job row is already saved as "queued" before this is called.
 * - Production, or JOB_RUNNER=worker: do nothing. The Railway worker (scripts/worker.ts)
 *   picks the job up from the database.
 * - Local dev otherwise: run in-process after the response via `after()`.
 */
function dispatch(run: () => Promise<unknown>) {
  if (process.env.NODE_ENV === "production" || process.env.JOB_RUNNER === "worker") return;
  after(async () => {
    try {
      await run();
    } catch (e) {
      console.error("[jobs] in-process job failed", e);
    }
  });
}

export async function enqueueDiscovery(websiteId: string) {
  dispatch(async () => (await import("@/lib/discovery/run")).runDiscovery(websiteId));
}

export async function enqueueTestRun(testId: string) {
  dispatch(async () => (await import("@/lib/agents/run-test")).runTest(testId));
}
