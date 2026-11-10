import { z } from "zod";

// ---- Discovery --------------------------------------------------------------
export const WebsiteAnalysisSchema = z.object({
  website_name: z.string(),
  website_type: z.string().describe("e.g. B2B SaaS, e-commerce store, agency, documentation site, blog"),
  product_description: z.string(),
  main_audience: z.string(),
  value_proposition: z.string(),
  main_navigation: z.array(z.string()),
  pages: z.array(
    z.object({
      url: z.string(),
      page_type: z.enum([
        "home", "pricing", "product", "features", "docs", "blog", "about", "contact",
        "signup", "login", "legal", "careers", "support", "integrations", "other",
      ]),
      summary: z.string().describe("One sentence on what this page offers a visitor"),
    }),
  ),
  important_pages: z.array(z.object({ url: z.string(), reason: z.string() })),
  likely_audiences: z.array(z.string()),
  suggested_goals: z.array(z.string()).describe("4-6 testable questions such as 'Can a potential customer find pricing?'"),
  content_gaps: z.array(z.string()),
  accessibility_observations: z.array(z.string()),
});
export type WebsiteAnalysis = z.infer<typeof WebsiteAnalysisSchema>;

// ---- Personas ---------------------------------------------------------------
export const PersonaSchema = z.object({
  name: z.string().describe("A first name only, e.g. Alex"),
  role: z.string().describe("Short label for who they are in this website's real audience, e.g. 'First-time buyer' (max 6 words)"),
  kind: z.enum(["human", "ai_agent"]),
  context: z.string().describe("Their situation: circumstances, experience and constraints (1-2 sentences). Not a task."),
  // Stored as `goal` for compatibility, but this is the persona's motivation: the underlying
  // driver (need, value, concern, incentive). Every persona attempts the same test goal.
  goal: z
    .string()
    .describe("Motivation: the underlying need, value, concern or incentive driving their decisions; WHY they care, not WHAT they do (1 concise sentence). Never a task, a question to answer, or information to find."),
  device: z.enum(["desktop", "mobile"]),
  behaviour: z.string().describe("How their motivation shows up while browsing: familiarity, reading style, where attention goes first, decision style, reaction to friction (1-2 sentences)"),
  patience: z.enum(["low", "medium", "high"]),
  success_criteria: z.string().describe("What would make this person feel confident in the outcome, given their motivation, phrased generally rather than as a specific fact to find (1 sentence)"),
});
export type Persona = z.infer<typeof PersonaSchema>;

export const PersonaSuggestionsSchema = z.object({ personas: z.array(PersonaSchema) });

/** Personas use desktop unless the test goal asks about mobile. Users can still pick mobile by hand. */
export function desktopUnlessAsked(personas: Persona[], testGoal?: string): Persona[] {
  if (testGoal && /\b(mobile|phone|smartphone|tablet|ios|android|iphone|ipad)\b/i.test(testGoal)) return personas;
  return personas.map((p) => ({ ...p, device: "desktop" }));
}

// ---- Browser agent step -----------------------------------------------------
export const AgentStepSchema = z.object({
  observation: z.string().describe("What you see on the current page that matters for your goal (1-2 sentences)"),
  reasoning: z.string().describe("Why you are taking the next action, in your persona's voice (1-2 sentences)"),
  action: z.enum(["click", "type", "select", "scroll_down", "scroll_up", "go_back", "navigate", "finish", "give_up"]),
  element_ref: z.number().nullable().describe("The [ref] number of the element for click/type/select, else null"),
  value: z.string().nullable().describe("Text to type, option to select, or same-site URL for navigate; else null"),
  progress_note: z.string().describe("Short present-tense status, e.g. 'Looking for the pricing page'"),
  final_report: z
    .string()
    .nullable()
    .describe("Only for finish/give_up: what you found or what blocked you, citing what you saw. Short notes, max 80 words."),
});
export type AgentStep = z.infer<typeof AgentStepSchema>;

// ---- Evaluation -------------------------------------------------------------
export const OUTCOMES = ["success", "partial_success", "failed", "abandoned", "blocked", "inconclusive"] as const;

export const SessionEvaluationSchema = z.object({
  outcome: z.enum(OUTCOMES),
  summary: z.string().describe("One plain sentence, max 20 words: did the persona reach the goal, and how. No hedging."),
  key_points: z.array(z.string()).describe("2-4 short facts behind the verdict, max 12 words each, e.g. 'Hero defines an Org in the first screen'"),
  rationale: z.string().describe("Your reasoning, max 2 short sentences. Mention evidence gaps only if they change the outcome."),
  cause: z
    .enum(["website", "agent", "environment", "none"])
    .describe("Primary cause of any failure: a website problem, an agent mistake/timeout, or the test environment"),
  observations: z.array(
    z.object({
      step: z.number().nullable(),
      issue: z.string().describe("One short sentence, max 25 words"),
      is_website_issue: z.boolean(),
      directly_observed: z.boolean().describe("True only if a recorded step or screenshot shows it"),
    }),
  ),
});
export type SessionEvaluation = z.infer<typeof SessionEvaluationSchema>;

export const FindingsReportSchema = z.object({
  conclusion: z.string().describe("Answer the test goal in max 2 short sentences (max 40 words). Plain language, no hedging."),
  findings: z.array(
    z.object({
      title: z.string().describe("Specific problem, max 12 words"),
      description: z.string().describe("What goes wrong and why it matters to visitors, max 2 short sentences"),
      category: z.enum(["navigation", "content", "conversion", "accessibility", "performance", "agent_readiness", "trust", "other"]),
      severity: z.enum(["critical", "high", "medium", "low"]),
      confidence: z.enum(["confirmed", "likely", "hypothesis"]),
      impacted_personas: z.array(z.string().describe("Persona first name only")),
      page_url: z.string().nullable(),
      evidence: z.array(z.object({ persona: z.string().describe("Persona first name only"), step: z.number().nullable(), note: z.string().describe("What was seen, max 15 words") })),
      recommendation: z.string().describe("The concrete fix, max 35 words, starting with a verb"),
    }),
  ),
  top_fixes: z.array(z.string().describe("Max 15 words")),
  readiness_interpretation: z.array(
    z.object({
      area: z.enum([
        "content_accessibility", "page_discovery", "semantic_navigation",
        "content_comprehension", "rendering", "structured_information",
      ]),
      status: z.enum(["good", "needs_work", "poor", "unknown"]),
      interpretation: z.string().describe("Max 2 short sentences"),
    }),
  ),
});
export type FindingsReport = z.infer<typeof FindingsReportSchema>;
