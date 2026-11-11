import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateSession, sampleScreens } from "@/lib/evaluation/evaluate";
import { PersonaSchema, type SessionEvaluation } from "@/lib/claude/schemas";
import { refundTestRun } from "@/lib/usage/usage";
import { testModeOf } from "@/lib/tests/mode";
import { writeReport, type UsableSession } from "./run-test";
import type { AgentRunResult, RecordedStep } from "./persona-agent";
import type { Json, Outcome, SessionEventRow, SessionRow } from "@/types/database";

/**
 * Finishes a test whose run was cut short (the worker died, or it was force-stopped) from the
 * steps already saved, instead of throwing them away and starting over. Every persona that
 * recorded at least one action is evaluated on what it did, and the report is written from that.
 */
export async function finishFromRecordedSteps(testId: string) {
  const db = createAdminClient();
  const { data: test } = await db.from("tests").select("*").eq("id", testId).single();
  if (!test || !["running", "evaluating"].includes(test.status)) return;
  const [{ data: website }, { data: personas }, { data: sessions }] = await Promise.all([
    db.from("websites").select("*").eq("id", test.website_id).single(),
    db.from("personas").select("*").eq("test_id", testId),
    db.from("sessions").select("*").eq("test_id", testId),
  ]);
  if (!website || !personas || !sessions) throw new Error("Test data incomplete");
  const mode = testModeOf(test.configuration);
  const stoppedByUser = Boolean(test.cancel_requested_at);

  const salvageSession = async (session: SessionRow): Promise<UsableSession | null> => {
    const row = personas.find((p) => p.id === session.persona_id);
    if (!row) return null;
    const persona = PersonaSchema.parse({ ...(row.configuration as object), name: row.name, role: row.role, goal: row.goal });
    const { data: events } = await db.from("session_events").select("*").eq("session_id", session.id).order("step");
    const steps = (events ?? []).map(toStep);
    const actions = steps.filter((s) => s.step > 0).length;

    // Already finished and judged before the interruption: reuse that verdict.
    if (session.status === "completed" && session.evaluation) {
      const last = steps.at(-1)?.action;
      const ending = last === "finish" ? "finished" : last === "give_up" ? "gave_up" : "action_limit";
      return {
        persona,
        personaName: row.name,
        run: { ending, finalReport: session.agent_summary, steps, durationMs: session.duration_ms ?? 0, screenshots: [] },
        evaluation: session.evaluation as unknown as SessionEvaluation,
      };
    }
    if (actions === 0) {
      await db
        .from("sessions")
        .update({ status: "failed", error: "Stopped before this persona took any actions.", current_activity: null, completed_at: new Date().toISOString() })
        .eq("id", session.id);
      return null;
    }

    await db.from("sessions").update({ status: "running", current_activity: `Evaluating the ${actions} recorded actions` }).eq("id", session.id);
    const first = events![0].timestamp;
    const lastAt = events!.at(-1)!.timestamp;
    const durationMs = Math.max(0, new Date(lastAt).getTime() - new Date(first).getTime());
    const run: AgentRunResult = {
      ending: stoppedByUser ? "stopped" : "interrupted",
      finalReport: `The session was cut short after ${actions} actions (${stoppedByUser ? "stopped by the user" : "the test worker stopped"}), so there is no final report from the persona. Judge only from the recorded steps.`,
      steps,
      durationMs,
      screenshots: await loadScreens(steps),
    };
    try {
      const evaluation = await evaluateSession({ persona, testGoal: test.goal, mode, websiteSummary: website.summary, run });
      await db
        .from("sessions")
        .update({
          status: "completed",
          outcome: evaluation.outcome as Outcome,
          evaluation: evaluation as unknown as Json,
          agent_summary: null,
          duration_ms: durationMs,
          action_count: actions,
          current_activity: null,
          error: null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", session.id);
      return { persona, personaName: row.name, run, evaluation };
    } catch (e) {
      await db
        .from("sessions")
        .update({ status: "failed", outcome: "inconclusive", error: e instanceof Error ? e.message : "Evaluation failed", current_activity: null, completed_at: new Date().toISOString() })
        .eq("id", session.id);
      return null;
    }
  };

  await db.from("tests").update({ status: "evaluating" }).eq("id", testId).in("status", ["running", "evaluating"]);
  const usable = (await Promise.all(sessions.map(salvageSession))).filter((u): u is UsableSession => u !== null);

  if (usable.length === 0) {
    await db
      .from("tests")
      .update({
        status: "failed",
        error: stoppedByUser
          ? "Stopped before any persona took an action. This run wasn't counted against your usage."
          : "The test worker stopped before any persona took an action. This run wasn't counted against your usage; please try again.",
        completed_at: new Date().toISOString(),
      })
      .eq("id", testId)
      .in("status", ["running", "evaluating"]);
    await refundTestRun(test.user_id, testId);
    return;
  }
  await writeReport({
    test,
    website,
    usable,
    total: sessions.length,
    note: stoppedByUser
      ? "Stopped early. This report covers the steps recorded before the stop."
      : "The test worker stopped partway through. This report covers the steps recorded before then.",
  });
}

function toStep(e: SessionEventRow): RecordedStep {
  return {
    step: e.step,
    action: e.action,
    target: e.target,
    url: e.url ?? "",
    result: e.result ?? "",
    reasoning: e.reasoning,
    observation: e.observation ?? null,
    screenshotPath: e.screenshot_path,
    error: e.error,
  };
}

/** Downloads the few screenshots the evaluator looks at. */
async function loadScreens(steps: RecordedStep[]): Promise<AgentRunResult["screenshots"]> {
  const db = createAdminClient();
  const picked = sampleScreens(steps.filter((s) => s.screenshotPath));
  const shots = await Promise.all(
    picked.map(async (s) => {
      const { data } = await db.storage.from("evidence").download(s.screenshotPath!);
      return data ? { step: s.step, path: s.screenshotPath!, jpeg: Buffer.from(await data.arrayBuffer()) } : null;
    }),
  );
  return shots.filter((s) => s !== null);
}
