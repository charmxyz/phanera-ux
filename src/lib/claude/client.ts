import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { env } from "@/lib/env";

let _client: Anthropic | null = null;
export function claude() {
  _client ??= new Anthropic({ maxRetries: 3 });
  return _client;
}

// Models that accept the server-side refusal fallback ("default" routing).
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"]);

export class ClaudeRefusalError extends Error {}
export class ClaudeOutputError extends Error {}

type Effort = "low" | "medium" | "high" | "xhigh" | "max";

/**
 * One structured Claude call: the response is constrained to the Zod schema
 * via output_config.format and validated again by the SDK. Never parses Markdown.
 */
export async function generateStructured<S extends z.ZodType>(opts: {
  schema: S;
  system: string;
  content: Anthropic.Beta.BetaContentBlockParam[] | string;
  model?: string;
  effort?: Effort;
  maxTokens?: number;
}): Promise<z.infer<S>> {
  const model = opts.model ?? env.anthropicModel();
  const useFallbacks = FALLBACK_MODELS.has(model) && process.env.ANTHROPIC_FALLBACKS !== "off";

  const response = await claude().beta.messages.parse({
    model,
    max_tokens: opts.maxTokens ?? 16000,
    system: opts.system,
    messages: [{ role: "user", content: opts.content }],
    output_config: { effort: opts.effort ?? "medium", format: betaZodOutputFormat(opts.schema) },
    ...(useFallbacks ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
  });

  if (response.stop_reason === "refusal") {
    throw new ClaudeRefusalError(response.stop_details?.explanation ?? "The model declined this request.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new ClaudeOutputError("Model output was truncated (max_tokens).");
  }
  if (response.parsed_output == null) {
    throw new ClaudeOutputError("Model returned output that did not match the expected schema.");
  }
  return response.parsed_output as z.infer<S>;
}
