import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { generateStructured } from "@/lib/claude/client";
import { dateRule, evaluationPrompt, EXPLORE_EVALUATION_RULE, EXPLORE_FINDINGS_RULE, findingsPrompt } from "@/lib/claude/prompts";
import { SessionEvaluationSchema, FindingsReportSchema, type Persona, type SessionEvaluation } from "@/lib/claude/schemas";
import type { AgentRunResult } from "@/lib/agents/persona-agent";
import type { TestMode } from "@/lib/tests/mode";

/** Picks up to `n` evenly spaced screenshots, always including the last one. */
function sampleScreens(shots: AgentRunResult["screenshots"], n = 4) {
  if (shots.length <= n) return shots;
  const idx = new Set<number>([shots.length - 1]);
  for (let k = 0; idx.size < n; k++) idx.add(Math.floor((k * (shots.length - 1)) / (n - 1)));
  return [...idx].sort((a, b) => a - b).map((i) => shots[i]);
}

export async function evaluateSession(input: {
  persona: Persona;
  testGoal: string;
  mode?: TestMode;
  websiteSummary: unknown;
  run: AgentRunResult;
}): Promise<SessionEvaluation> {
  const { run } = input;
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  for (const s of sampleScreens(run.screenshots)) {
    content.push({ type: "text", text: `Screenshot after step ${s.step}:` });
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: s.jpeg.toString("base64") } });
  }
  content.push({
    type: "text",
    text: [
      `Persona (JSON): ${JSON.stringify(input.persona)}`,
      `Test goal: ${input.testGoal}`,
      `Known website facts (JSON): ${JSON.stringify(input.websiteSummary)}`,
      `How the session ended: ${run.ending} after ${Math.round(run.durationMs / 1000)}s.`,
      `Agent's final report (unverified claim): ${run.finalReport ?? "(none)"}`,
      `<website_content>\nRecorded steps (JSON):\n${JSON.stringify(
        run.steps.map(({ step, action, target, url, result, reasoning, error }) => ({ step, action, target, url, result, reasoning, error })),
      )}\n</website_content>`,
      "Evaluate this session.",
    ].join("\n\n"),
  });
  return generateStructured({ schema: SessionEvaluationSchema, system: [evaluationPrompt.system, input.mode === "explore" ? EXPLORE_EVALUATION_RULE : "", dateRule()].filter(Boolean).join("\n"), content, effort: "medium", maxTokens: 8000, timeoutMs: 180_000, maxRetries: 2 });
}

export async function synthesiseFindings(input: {
  testGoal: string;
  mode?: TestMode;
  websiteSummary: unknown;
  measuredReadiness: unknown;
  sessions: { persona: Persona; ending: string; evaluation: SessionEvaluation | null; steps: AgentRunResult["steps"] }[];
}) {
  return generateStructured({
    schema: FindingsReportSchema,
    system: [findingsPrompt.system, input.mode === "explore" ? EXPLORE_FINDINGS_RULE : "", dateRule()].filter(Boolean).join("\n"),
    effort: "high",
    timeoutMs: 300_000,
    maxRetries: 2,
    content: [
      `Test goal: ${input.testGoal}`,
      `Website facts (JSON): ${JSON.stringify(input.websiteSummary)}`,
      `Measured agent-readiness signals (JSON, objective): ${JSON.stringify(input.measuredReadiness)}`,
      `<website_content>\nSessions (JSON):\n${JSON.stringify(
        input.sessions.map((s) => ({
          persona: `${s.persona.name} (${s.persona.role}, ${s.persona.kind}, ${s.persona.device})`,
          motivation: s.persona.goal,
          ending: s.ending,
          evaluation: s.evaluation,
          steps: s.steps.map(({ step, action, target, url, result, error }) => ({ step, action, target, url, result, error })),
        })),
      )}\n</website_content>`,
      "Produce the findings report.",
    ].join("\n\n"),
  });
}
