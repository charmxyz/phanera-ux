import { task } from "@trigger.dev/sdk";
import { runDiscovery } from "@/lib/discovery/run";
import { runTest } from "@/lib/agents/run-test";

export const discoveryTask = task({
  id: "website-discovery",
  maxDuration: 300,
  retry: { maxAttempts: 2 },
  run: async (payload: { websiteId: string }) => {
    await runDiscovery(payload.websiteId);
    return { ok: true };
  },
});

export const testRunTask = task({
  id: "persona-test-run",
  // Up to 10 personas × 8 min, 3 at a time, plus sandbox start-up and evaluation.
  maxDuration: 3600,
  retry: { maxAttempts: 1 },
  queue: { concurrencyLimit: 5 },
  // Chromium with 3 concurrent persona contexts needs ~2 GB.
  machine: "medium-1x",
  run: async (payload: { testId: string }) => {
    await runTest(payload.testId);
    return { ok: true };
  },
});
