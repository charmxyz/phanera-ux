/**
 * How a test is driven. "explore" has no user-set goal: every persona roams the site looking
 * for errors and friction. Explorers use their whole budget (there is no finish line), so a
 * run costs more credits even though each persona's action cap is lower.
 * Client-safe (no server imports) so the wizard can show the same costs the server charges.
 */
export type TestMode = "explore" | "goal";

/** Usability-test credits each mode uses. */
export const TEST_CREDITS: Record<TestMode, number> = { explore: 3, goal: 1 };

/** Explorers always use every action they get, so they are capped lower than goal runs. */
export const EXPLORE_MAX_ACTIONS = 20;

/** Per-persona action and time limits for a mode, given the plan's (goal-mode) limits. */
export function personaBudget(mode: TestMode, plan: { maxActionsPerPersona: number; maxDurationMsPerPersona: number }) {
  return {
    maxActions: mode === "explore" ? Math.min(plan.maxActionsPerPersona, EXPLORE_MAX_ACTIONS) : plan.maxActionsPerPersona,
    maxDurationMs: plan.maxDurationMsPerPersona,
  };
}

/** Stored as the test's goal so every downstream prompt and report has a goal to show. */
export const EXPLORE_GOAL =
  "Explore the website freely and find anything that is broken, confusing or gets in a visitor's way.";

export const EXPLORE_TITLE = "Open exploration";

export function testModeOf(configuration: unknown): TestMode {
  return (configuration as { mode?: unknown } | null)?.mode === "explore" ? "explore" : "goal";
}
