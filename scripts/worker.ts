// Standalone job worker: polls Supabase for queued discovery scans and test runs and
// executes them with headless Chromium in this container. Run with JOB_RUNNER=worker
// on the web app so it leaves jobs queued for this process.
//
//   pnpm worker            (locally)
//   Dockerfile.worker      (Railway / EC2 / any container host)
//
// Safe to run several copies: each job is claimed with a conditional update, so only
// one worker ever wins it.
import { createAdminClient } from "@/lib/supabase/admin";
import { runDiscovery } from "@/lib/discovery/run";
import { runTest } from "@/lib/agents/run-test";
import { refundTestRun } from "@/lib/usage/usage";
import { forceStopTest, STOP_GRACE_MS } from "@/lib/agents/stop";
import type { DiscoveryStatus } from "@/types/database";

const POLL_MS = Number(process.env.WORKER_POLL_MS) || 3000;
const MAX_TESTS = Math.max(1, Number(process.env.WORKER_MAX_TESTS) || 1);
const MAX_DISCOVERIES = Math.max(1, Number(process.env.WORKER_MAX_DISCOVERIES) || 2);
// Jobs left "in progress" by a crashed/redeployed worker are failed after these.
const STALE_TEST_MS = 75 * 60_000;
const STALE_DISCOVERY_MS = 15 * 60_000;
const ACTIVE_DISCOVERY: DiscoveryStatus[] = ["fetching", "discovering", "extracting", "analysing"];

const db = createAdminClient();
let stopping = false;
const running = { tests: 0, discoveries: 0 };
const log = (...a: unknown[]) => console.log(new Date().toISOString(), "[worker]", ...a);

async function claimDiscovery(): Promise<string | null> {
  const { data: candidates } = await db.from("websites").select("id").eq("discovery_status", "queued").order("updated_at").limit(5);
  for (const c of candidates ?? []) {
    const { data } = await db
      .from("websites")
      .update({ discovery_status: "fetching", updated_at: new Date().toISOString() })
      .eq("id", c.id)
      .eq("discovery_status", "queued")
      .select("id");
    if (data?.length) return c.id;
  }
  return null;
}

async function claimTest(): Promise<string | null> {
  const { data: candidates } = await db.from("tests").select("id").eq("status", "queued").order("created_at").limit(5);
  for (const c of candidates ?? []) {
    const { data } = await db
      .from("tests")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", c.id)
      .eq("status", "queued")
      .select("id");
    if (data?.length) return c.id;
  }
  return null;
}

async function failStaleJobs() {
  const now = Date.now();
  const { data: tests } = await db
    .from("tests")
    .select("id, user_id")
    .in("status", ["running", "evaluating"])
    .lt("started_at", new Date(now - STALE_TEST_MS).toISOString());
  for (const t of tests ?? []) {
    const msg = "The test worker stopped before this test finished. Your test run was refunded; please try again.";
    await db.from("sessions").update({ status: "failed", error: msg, current_activity: null }).eq("test_id", t.id).in("status", ["queued", "running"]);
    await db.from("tests").update({ status: "failed", error: msg, completed_at: new Date().toISOString() }).eq("id", t.id);
    await refundTestRun(t.user_id, t.id);
    log("failed stale test", t.id);
  }
  // Stop requests the running job never picked up (e.g. it was stuck) are applied here.
  const { data: stuck } = await db
    .from("tests")
    .select("id, user_id")
    .in("status", ["queued", "running", "evaluating"])
    .lt("cancel_requested_at", new Date(now - 2 * STOP_GRACE_MS).toISOString());
  for (const t of stuck ?? []) {
    await forceStopTest(t.id, t.user_id);
    log("force-stopped test", t.id);
  }
  const { data: sites } = await db
    .from("websites")
    .select("id")
    .in("discovery_status", ACTIVE_DISCOVERY)
    .lt("updated_at", new Date(now - STALE_DISCOVERY_MS).toISOString());
  for (const s of sites ?? []) {
    await db.from("websites").update({ discovery_status: "failed", discovery_error: "Discovery was interrupted. Please rescan." }).eq("id", s.id);
    log("failed stale discovery", s.id);
  }
}

function launch(kind: "tests" | "discoveries", id: string, job: () => Promise<unknown>) {
  running[kind]++;
  log(`start ${kind === "tests" ? "test" : "discovery"} ${id}`);
  const t0 = Date.now();
  job()
    .then(() => log(`done ${id} in ${Math.round((Date.now() - t0) / 1000)}s`))
    .catch((e) => log(`job ${id} failed:`, e instanceof Error ? e.message : e))
    .finally(() => running[kind]--);
}

async function tick() {
  if (stopping) return;
  while (running.discoveries < MAX_DISCOVERIES) {
    const id = await claimDiscovery();
    if (!id) break;
    launch("discoveries", id, () => runDiscovery(id));
  }
  while (running.tests < MAX_TESTS) {
    const id = await claimTest();
    if (!id) break;
    launch("tests", id, () => runTest(id));
  }
}

async function main() {
  log(`up · tests ≤${MAX_TESTS} · discoveries ≤${MAX_DISCOVERIES} · personas/test ${process.env.PERSONA_CONCURRENCY ?? 3} · poll ${POLL_MS}ms`);
  let lastStaleCheck = 0;
  while (!stopping) {
    try {
      if (Date.now() - lastStaleCheck > 60_000) {
        lastStaleCheck = Date.now();
        await failStaleJobs();
      }
      await tick();
    } catch (e) {
      log("poll error:", e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

for (const sig of ["SIGTERM", "SIGINT"] as const) {
  process.on(sig, async () => {
    if (stopping) process.exit(1);
    stopping = true;
    log(`${sig}: no new jobs; waiting for ${running.tests + running.discoveries} running job(s)`);
    const deadline = Date.now() + 25_000;
    while (running.tests + running.discoveries > 0 && Date.now() < deadline) await new Promise((r) => setTimeout(r, 500));
    process.exit(0);
  });
}

main();
