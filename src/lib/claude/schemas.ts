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
  role: z.string().describe("Short label, e.g. First-time visitor"),
  kind: z.enum(["human", "ai_agent"]),
  context: z.string(),
  // Stored as `goal` for compatibility, but this is the persona's motivation: every persona
  // in a test attempts the same test goal; who they are only changes *how* they go about it.
  goal: z.string().describe("Motivation: why this person is on the site and what they personally care about (1 sentence). Not a separate task."),
  device: z.enum(["desktop", "mobile"]),
  behaviour: z.string().describe("How they browse: familiarity, reading style, what they click first"),
  patience: z.enum(["low", "medium", "high"]),
  success_criteria: z.string().describe("What this persona would need to see to trust the answer, given their motivation (1 sentence)"),
});
export type Persona = z.infer<typeof PersonaSchema>;

export const PersonaSuggestionsSchema = z.object({ personas: z.array(PersonaSchema) });

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
    .describe("Only for finish/give_up: what you achieved or what blocked you, citing what you saw"),
});
export type AgentStep = z.infer<typeof AgentStepSchema>;

// ---- Evaluation -------------------------------------------------------------
export const OUTCOMES = ["success", "partial_success", "failed", "abandoned", "blocked", "inconclusive"] as const;

export const SessionEvaluationSchema = z.object({
  outcome: z.enum(OUTCOMES),
  rationale: z.string(),
  cause: z
    .enum(["website", "agent", "environment", "none"])
    .describe("Primary cause of any failure: a website problem, an agent mistake/timeout, or the test environment"),
  observations: z.array(
    z.object({
      step: z.number().nullable(),
      issue: z.string(),
      is_website_issue: z.boolean(),
      directly_observed: z.boolean().describe("True only if a recorded step or screenshot shows it"),
    }),
  ),
});
export type SessionEvaluation = z.infer<typeof SessionEvaluationSchema>;

export const FindingsReportSchema = z.object({
  conclusion: z.string().describe("2-3 sentence plain-language conclusion"),
  findings: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.enum(["navigation", "content", "conversion", "accessibility", "performance", "agent_readiness", "trust", "other"]),
      severity: z.enum(["critical", "high", "medium", "low"]),
      confidence: z.enum(["confirmed", "likely", "hypothesis"]),
      impacted_personas: z.array(z.string()),
      page_url: z.string().nullable(),
      evidence: z.array(z.object({ persona: z.string(), step: z.number().nullable(), note: z.string() })),
      recommendation: z.string(),
    }),
  ),
  top_fixes: z.array(z.string()),
  readiness_interpretation: z.array(
    z.object({
      area: z.enum([
        "content_accessibility", "page_discovery", "semantic_navigation",
        "content_comprehension", "rendering", "structured_information",
      ]),
      status: z.enum(["good", "needs_work", "poor", "unknown"]),
      interpretation: z.string(),
    }),
  ),
});
export type FindingsReport = z.infer<typeof FindingsReportSchema>;
