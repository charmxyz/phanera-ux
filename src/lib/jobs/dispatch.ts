import "server-only";
import { after } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { env } from "@/lib/env";
import type { discoveryTask, testRunTask } from "@/trigger/tasks";

/**
 * Starts background work so long-running scans never depend on a request's lifetime.
 * - JOB_RUNNER=worker: do nothing here. The row is already saved as "queued", and the
 *   standalone worker (scripts/worker.ts, e.g. on Railway) picks it up from the database.
 * - TRIGGER_SECRET_KEY set (or JOB_RUNNER=trigger): run on Trigger.dev.
 * - Otherwise (local dev only): run in-process after the response via `after()`.
 */
async function dispatch(run: () => Promise<unknown>, viaTrigger: () => Promise<unknown>) {
  const runner = process.env.JOB_RUNNER;
  if (runner === "worker") return;
  if (runner === "trigger" || (!runner && env.triggerSecretKey())) {
    await viaTrigger();
    return;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Background jobs are not configured (set JOB_RUNNER=worker or TRIGGER_SECRET_KEY).");
  }
  after(async () => {
    try {
      await run();
    } catch (e) {
      console.error("[jobs] in-process job failed", e);
    }
  });
}

export async function enqueueDiscovery(websiteId: string) {
  await dispatch(
    async () => (await import("@/lib/discovery/run")).runDiscovery(websiteId),
    () => tasks.trigger<typeof discoveryTask>("website-discovery", { websiteId }),
  );
}

export async function enqueueTestRun(testId: string) {
  await dispatch(
    async () => (await import("@/lib/agents/run-test")).runTest(testId),
    () => tasks.trigger<typeof testRunTask>("persona-test-run", { testId }),
  );
}
