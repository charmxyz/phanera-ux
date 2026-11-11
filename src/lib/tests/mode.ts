/**
 * How a test is driven. "explore" has no user-set goal: every persona roams the site looking
 * for errors and friction, with a bigger action/time budget, so it costs more credits.
 * Client-safe (no server imports) so the wizard can show the same costs the server charges.
 */
export type TestMode = "explore" | "goal";

/** Usability-test credits each mode uses. */
export const TEST_CREDITS: Record<TestMode, number> = { explore: 3, goal: 1 };

/** Explore runs get this many times the plan's per-persona action and time limits. */
export const EXPLORE_BUDGET_MULTIPLIER = 2;

/** Stored as the test's goal so every downstream prompt and report has a goal to show. */
export const EXPLORE_GOAL =
  "Explore the website freely and find anything that is broken, confusing or gets in a visitor's way.";

export const EXPLORE_TITLE = "Open exploration";

export function testModeOf(configuration: unknown): TestMode {
  return (configuration as { mode?: unknown } | null)?.mode === "explore" ? "explore" : "goal";
}
