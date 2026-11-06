import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { acquireBrowser, assertBrowserCanReach, type BrowserHandle } from "@/lib/daytona/browser";
import { runPersonaAgent, type AgentRunResult } from "./persona-agent";
import { evaluateSession, synthesiseFindings } from "@/lib/evaluation/evaluate";
import { PersonaSchema, type Persona, type SessionEvaluation } from "@/lib/claude/schemas";
import { BILLING_COLUMNS, effectivePlan, planLimits } from "@/lib/usage/plans";
import { refundTestRun } from "@/lib/usage/usage";
import { STOPPED_SESSION_MSG } from "./stop";
import type { Json, Outcome, TestRow } from "@/types/database";

// Personas run in parallel inside one browser; lower this on small machines (~500 MB each).
const MAX_CONCURRENT_PERSONAS = Math.max(1, Math.min(10, Number(process.env.PERSONA_CONCURRENCY) || 3));

/** Executes a full persona test. Runs in a background worker (Trigger.dev), never in a request. */
export async function runTest(testId: string) {
  const db = createAdminClient();
  const { data: test } = await db.from("tests").select("*").eq("id", testId).single();
  if (!test) throw new Error(`Test ${testId} not found`);
  if (!["queued", "running"].includes(test.status)) return; // idempotent on retries

  const [{ data: website }, { data: personas }, { data: sessions }, { data: profile }] = await Promise.all([
    db.from("websites").select("*").eq("id", test.website_id).single(),
    db.from("personas").select("*").eq("test_id", testId),
    db.from("sessions").select("*").eq("test_id", testId),
    db.from("profiles").select(BILLING_COLUMNS).eq("id", test.user_id).single(),
  ]);
  if (!website || !personas || !sessions) throw new Error("Test data incomplete");
  const limits = planLimits(effectivePlan(profile));
  const cfg = (test.configuration ?? {}) as { startUrl?: string };

  await db.from("tests").update({ status: "running", started_at: new Date().toISOString(), error: null }).eq("id", testId);

  // The user can stop the test from the dashboard; watch for it while personas run.
  const stop = new AbortController();
  const watch = setInterval(async () => {
    const { data } = await db.from("tests").select("cancel_requested_at, status").eq("id", testId).single();
    if (data?.cancel_requested_at || data?.status === "failed") stop.abort();
  }, 3000);
  const stopped = () => stop.signal.aborted;
  /** Final status writes only apply while the test is still ours (not force-stopped meanwhile). */
  const setTest = (fields: Partial<TestRow>) =>
    db.from("tests").update(fields).eq("id", testId).in("status", ["running", "evaluating"]);

  let handle: BrowserHandle | null = null;
  const results: { persona: Persona; personaName: string; run: AgentRunResult | null; evaluation: SessionEvaluation | null }[] = [];

  try {
    handle = await acquireBrowser();
    const browser = handle.browser;
    await db.from("sessions").update({ current_activity: "Checking the website is reachable" }).eq("test_id", testId);
    await assertBrowserCanReach(browser, cfg.startUrl ?? website.url);
    // Queued personas fall back to "Waiting for a browser" until their turn.
    await db.from("sessions").update({ current_activity: null }).eq("test_id", testId).eq("status", "queued");

    const queue = [...sessions];
    const worker = async () => {
      while (queue.length && !stopped()) {
        const session = queue.shift()!;
        const row = personas.find((p) => p.id === session.persona_id)!;
        const persona = PersonaSchema.parse({ ...(row.configuration as object), name: row.name, role: row.role, goal: row.goal });
        await db.from("sessions").update({ status: "running", started_at: new Date().toISOString(), current_activity: "Starting browser" }).eq("id", session.id);

        let run: AgentRunResult | null = null;
        let evaluation: SessionEvaluation | null = null;
        try {
          // Second line of defence on top of the agent's own watchdog.
          const budget = limits.maxDurationMsPerPersona + 3 * 60_000;
          let timer: ReturnType<typeof setTimeout> | undefined;
          run = await Promise.race([
            runPersonaAgent(browser, {
            sessionId: session.id,
            userId: test.user_id,
            startUrl: cfg.startUrl ?? website.url,
            allowedDomain: website.domain,
            persona,
            testGoal: test.goal,
            maxActions: limits.maxActionsPerPersona,
            maxDurationMs: limits.maxDurationMsPerPersona,
            screenshots: limits.screenshots,
            signal: stop.signal,
          }),
            new Promise<never>((_, reject) => {
              timer = setTimeout(() => reject(new Error("The persona's browser stopped responding.")), budget);
            }),
          ]).finally(() => clearTimeout(timer));
          if (stopped() || run.ending === "stopped") {
            await db
              .from("sessions")
              .update({ status: "failed", error: STOPPED_SESSION_MSG, current_activity: null, duration_ms: run.durationMs, completed_at: new Date().toISOString() })
              .eq("id", session.id);
            results.push({ persona, personaName: row.name, run: null, evaluation: null });
            continue;
          }
          await db.from("sessions").update({ current_activity: "Evaluating session" }).eq("id", session.id);
          evaluation = await evaluateSession({ persona, testGoal: test.goal, websiteSummary: website.summary, run });

          const environmentFailure = run.ending === "error" && run.steps.length <= 1;
          await db
            .from("sessions")
            .update({
              status: environmentFailure ? "failed" : "completed",
              outcome: evaluation.outcome as Outcome,
              evaluation: evaluation as unknown as Json,
              agent_summary: run.finalReport,
              duration_ms: run.durationMs,
              action_count: run.steps.filter((s) => s.step > 0).length,
              current_activity: null,
              error: run.ending === "error" ? run.finalReport : null,
              completed_at: new Date().toISOString(),
            })
            .eq("id", session.id);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Session failed";
          await db
            .from("sessions")
            .update({ status: "failed", outcome: "inconclusive", error: msg, current_activity: null, duration_ms: run?.durationMs ?? null, completed_at: new Date().toISOString() })
            .eq("id", session.id);
        }
        results.push({ persona, personaName: row.name, run, evaluation });
      }
    };
    await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_PERSONAS, sessions.length) }, worker));
    if (stopped()) {
      await db.from("sessions").update({ status: "failed", error: STOPPED_SESSION_MSG, current_activity: null }).eq("test_id", testId).in("status", ["queued", "running"]);
    }
  } catch (e) {
    // Could not acquire a browser at all: fail every pending session, refund usage.
    const msg = e instanceof Error ? e.message : "Browser environment failed";
    await db.from("sessions").update({ status: "failed", error: msg, current_activity: null }).eq("test_id", testId).in("status", ["queued", "running"]);
    await db.from("tests").update({ status: "failed", error: msg, completed_at: new Date().toISOString() }).eq("id", testId);
    await refundTestRun(test.user_id, testId);
    throw e;
  } finally {
    clearInterval(watch);
    await handle?.release();
  }

  const usable = results.filter((r) => r.run && r.evaluation);
  if (usable.length === 0) {
    const error = stopped()
      ? "Stopped before any persona finished. This run wasn't counted against your usage."
      : "No persona session completed successfully.";
    await setTest({ status: "failed", error, completed_at: new Date().toISOString() });
    await refundTestRun(test.user_id, testId);
    return;
  }

  // If stopped, the report is still written from the personas that finished.
  await setTest({ status: "evaluating" });
  const measured = (website.readiness as { measured?: unknown } | null)?.measured ?? null;

  try {
    const report = await synthesiseFindings({
      testGoal: test.goal,
      websiteSummary: website.summary,
      measuredReadiness: measured,
      sessions: usable.map((r) => ({ persona: r.persona, ending: r.run!.ending, evaluation: r.evaluation, steps: r.run!.steps })),
    });

    if (report.findings.length) {
      await db.from("findings").insert(
        report.findings.map((f) => ({
          test_id: testId,
          user_id: test.user_id,
          title: f.title,
          description: f.description,
          category: f.category,
          severity: f.severity,
          // Downgrade "confirmed" claims that cite no step evidence.
          confidence: f.confidence === "confirmed" && !f.evidence.some((e) => e.step != null) ? "likely" : f.confidence,
          impacted_personas: f.impacted_personas,
          recommendation: f.recommendation,
          evidence: f.evidence as unknown as Json,
          page_url: f.page_url,
        })),
      );
    }

    const outcomes = usable.map((r) => r.evaluation!.outcome);
    const count = (o: string) => outcomes.filter((x) => x === o).length;
    await setTest({
        status: usable.length < results.length ? "partial" : "complete",
        completed_at: new Date().toISOString(),
        summary: {
          conclusion: report.conclusion,
          top_fixes: report.top_fixes,
          readiness: report.readiness_interpretation,
          counts: {
            personas: results.length,
            success: count("success"),
            partial: count("partial_success"),
            failed: count("failed") + count("blocked") + count("abandoned"),
            inconclusive: count("inconclusive") + (results.length - usable.length),
          },
        } as unknown as Json,
        ...(stopped() ? { error: "Stopped early. This report covers the personas that finished." } : {}),
      });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Findings generation failed";
    await setTest({ status: "partial", error: `Sessions recorded, but the report could not be generated: ${msg}`, completed_at: new Date().toISOString() });
  }
}
