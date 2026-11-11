"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertPublicUrl, safeFetch, UnsafeUrlError } from "@/lib/validation/network";
import { normalizeUrl } from "@/lib/validation/url";
import { countScansToday, getUsageSummary } from "@/lib/usage/usage";
import { enqueueDiscovery, enqueueTestRun } from "@/lib/jobs/dispatch";
import { generateStructured } from "@/lib/claude/client";
import { extraPersonaPrompt, personaPrompt } from "@/lib/claude/prompts";
import { PersonaSchema, PersonaSuggestionsSchema, desktopUnlessAsked, type Persona } from "@/lib/claude/schemas";
import type { Json } from "@/types/database";
import { forceStopTest, STOP_GRACE_MS } from "@/lib/agents/stop";
import { EXPLORE_GOAL, EXPLORE_TITLE, personaBudget, TEST_CREDITS } from "@/lib/tests/mode";

type Result<T> = ({ ok: true } & T) | { ok: false; error: string };

async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("You need to sign in again.");
  return user;
}

/** Confirms a URL in the dashboard and starts discovery (PRD §9.1). */
export async function startDiscovery(rawUrl: string): Promise<Result<{ websiteId: string }>> {
  try {
    const user = await requireUser();
    const n = normalizeUrl(rawUrl);
    if (!n.ok) return { ok: false, error: n.error };
    const url = await assertPublicUrl(n.url);

    const usage = await getUsageSummary(user.id);
    if ((await countScansToday(user.id)) >= usage.limits.scansPerDay) {
      return { ok: false, error: `You've reached the ${usage.limits.scansPerDay} website analyses per day limit on the ${usage.limits.label} plan.` };
    }

    const db = createAdminClient();
    const { data: existing } = await db.from("websites").select("id, discovery_status").eq("user_id", user.id).eq("domain", n.domain).maybeSingle();
    if (existing && ["queued", "fetching", "discovering", "extracting", "analysing"].includes(existing.discovery_status)) {
      return { ok: true, websiteId: existing.id };
    }

    let websiteId: string;
    if (existing) {
      await db.from("websites").update({ url, discovery_status: "queued", discovery_error: null, updated_at: new Date().toISOString() }).eq("id", existing.id);
      websiteId = existing.id;
    } else {
      const { data, error } = await db.from("websites").insert({ user_id: user.id, url, domain: n.domain }).select("id").single();
      if (error || !data) return { ok: false, error: "Could not save the website." };
      websiteId = data.id;
    }
    await db.from("usage").insert({ user_id: user.id, website_id: websiteId, usage_type: "discovery_scan" });
    await enqueueDiscovery(websiteId);
    revalidatePath("/dashboard");
    return { ok: true, websiteId };
  } catch (e) {
    return { ok: false, error: e instanceof UnsafeUrlError || e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function regeneratePersonas(websiteId: string, goal: string): Promise<Result<{ personas: Persona[] }>> {
  try {
    const user = await requireUser();
    const db = createAdminClient();
    const { data: website } = await db.from("websites").select("summary, user_id").eq("id", websiteId).single();
    if (!website || website.user_id !== user.id) return { ok: false, error: "Website not found." };
    if (!website.summary) return { ok: false, error: "Analyse the website first." };
    const out = await generateStructured({
      schema: PersonaSuggestionsSchema,
      system: personaPrompt.system,
      content: personaPrompt.user({ summary: website.summary, count: 3, testGoal: goal.slice(0, 500) || undefined }),
      effort: "low",
      maxTokens: 8000,
    });
    const personas = desktopUnlessAsked(out.personas, goal);
    await db.from("websites").update({ suggested_personas: personas as unknown as Json }).eq("id", websiteId);
    return { ok: true, personas };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not generate personas." };
  }
}

/** Generates one more persona for the product's real audience, distinct from `existing`. */
export async function generateExtraPersona(websiteId: string, goal: string, existing: Persona[]): Promise<Result<{ persona: Persona }>> {
  try {
    const user = await requireUser();
    const db = createAdminClient();
    const { data: website } = await db.from("websites").select("summary, user_id").eq("id", websiteId).single();
    if (!website || website.user_id !== user.id) return { ok: false, error: "Website not found." };
    if (!website.summary) return { ok: false, error: "Analyse the website first." };
    const others = z.array(PersonaSchema).max(50).catch([]).parse(existing);
    const out = await generateStructured({
      schema: PersonaSuggestionsSchema,
      system: extraPersonaPrompt.system,
      content: extraPersonaPrompt.user({
        summary: website.summary,
        testGoal: goal.slice(0, 500) || undefined,
        existing: others.map((p) => ({ name: p.name, role: p.role, kind: p.kind, goal: p.goal.slice(0, 300), behaviour: p.behaviour.slice(0, 300) })),
      }),
      effort: "low",
      maxTokens: 4000,
    });
    const taken = new Set(others.map((p) => p.name.trim().toLowerCase()));
    const candidates = desktopUnlessAsked(out.personas, goal);
    const persona = candidates.find((p) => !taken.has(p.name.trim().toLowerCase())) ?? candidates[0];
    if (!persona) return { ok: false, error: "Could not generate a persona." };
    return { ok: true, persona: { ...persona, name: persona.name.slice(0, 40), role: persona.role.slice(0, 60) } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not generate a persona." };
  }
}

const CreateTestInput = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("goal"),
    websiteId: z.string().uuid(),
    goal: z.string().trim().min(5, "Describe what you'd like to test.").max(500),
    personas: z.array(PersonaSchema).min(1, "Select at least one persona."),
  }),
  z.object({
    mode: z.literal("explore"),
    websiteId: z.string().uuid(),
    personas: z.array(PersonaSchema).min(1, "Select at least one persona."),
  }),
]);

/** Validates everything in PRD §11.2, reserves usage, and enqueues the run. */
export async function createTest(input: z.input<typeof CreateTestInput>): Promise<Result<{ testId: string }>> {
  try {
    const user = await requireUser();
    const parsed = CreateTestInput.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid test configuration." };
    const { websiteId, personas, mode } = parsed.data;
    const goal = parsed.data.mode === "goal" ? parsed.data.goal : EXPLORE_GOAL;
    const title = mode === "explore" ? EXPLORE_TITLE : goal.length > 80 ? `${goal.slice(0, 77)}…` : goal;
    const credits = TEST_CREDITS[mode];

    const db = createAdminClient();
    const { data: website } = await db.from("websites").select("*").eq("id", websiteId).single();
    if (!website || website.user_id !== user.id) return { ok: false, error: "Website not found." };
    if (!["complete", "partial"].includes(website.discovery_status)) return { ok: false, error: "Wait for discovery to finish first." };

    const usage = await getUsageSummary(user.id);
    if (usage.remaining <= 0) {
      return {
        ok: false,
        error:
          usage.period === "lifetime"
            ? `You've used all ${usage.allowance} usability tests included in the ${usage.limits.label} plan.`
            : `You've used all ${usage.allowance} usability tests for this month on the ${usage.limits.label} plan.`,
      };
    }
    if (usage.remaining < credits) {
      return { ok: false, error: `Letting the agent explore uses ${credits} credits and you have ${usage.remaining} left. Set a goal instead (1 credit).` };
    }
    if (personas.length > usage.limits.personasPerTest) {
      return { ok: false, error: `The ${usage.limits.label} plan allows up to ${usage.limits.personasPerTest} personas per test.` };
    }

    // Network safety + reachability at start time (DNS may have changed since discovery).
    const url = await assertPublicUrl(website.url);
    try {
      const res = await safeFetch(url, { timeoutMs: 10_000, maxBytes: 50_000 });
      if (res.status >= 500) return { ok: false, error: `The website is returning HTTP ${res.status}. Try again later.` };
    } catch {
      return { ok: false, error: "The website isn't publicly reachable right now." };
    }

    const { data: test, error } = await db
      .from("tests")
      .insert({
        user_id: user.id,
        website_id: websiteId,
        title,
        goal,
        configuration: {
          startUrl: url,
          plan: usage.plan,
          mode,
          credits,
          maxActionsPerPersona: personaBudget(mode, usage.limits).maxActions,
          maxDurationMsPerPersona: personaBudget(mode, usage.limits).maxDurationMs,
        },
      })
      .select("id")
      .single();
    if (error || !test) return { ok: false, error: "Could not create the test." };

    const { data: personaRows } = await db
      .from("personas")
      .insert(
        personas.map((p) => ({
          test_id: test.id,
          user_id: user.id,
          name: p.name,
          role: p.role,
          goal: p.goal,
          configuration: p as unknown as Json,
        })),
      )
      .select("id");
    await db.from("sessions").insert((personaRows ?? []).map((p) => ({ test_id: test.id, persona_id: p.id, user_id: user.id })));
    await db.from("usage").insert({ user_id: user.id, test_id: test.id, usage_type: "test_run", quantity: credits });

    try {
      await enqueueTestRun(test.id);
    } catch (e) {
      await db.from("tests").update({ status: "failed", error: "Could not start the test worker." }).eq("id", test.id);
      await db.from("usage").delete().eq("test_id", test.id).eq("usage_type", "test_run");
      throw e;
    }
    revalidatePath("/dashboard");
    return { ok: true, testId: test.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

/**
 * Stops a test. The worker notices within a few seconds, stops the remaining personas and
 * still writes a report from those that finished. If the worker hasn't responded after a grace
 * period, a second click force-stops it here.
 */
export async function stopTest(testId: string): Promise<Result<{ state: "stopping" | "stopped" }>> {
  try {
    const user = await requireUser();
    const db = createAdminClient();
    const { data: test } = await db.from("tests").select("id, user_id, status, cancel_requested_at").eq("id", testId).maybeSingle();
    if (!test || test.user_id !== user.id) return { ok: false, error: "Test not found." };
    if (!["queued", "running", "evaluating"].includes(test.status)) return { ok: true, state: "stopped" };

    if (test.status === "queued") {
      // Not picked up by a worker yet: stop it outright (and refund).
      await forceStopTest(testId, user.id);
      revalidatePath(`/dashboard/tests/${testId}`);
      return { ok: true, state: "stopped" };
    }
    if (!test.cancel_requested_at) {
      await db.from("tests").update({ cancel_requested_at: new Date().toISOString() }).eq("id", testId);
      return { ok: true, state: "stopping" };
    }
    if (Date.now() - new Date(test.cancel_requested_at).getTime() >= STOP_GRACE_MS && test.status !== "evaluating") {
      const state = await forceStopTest(testId, user.id);
      revalidatePath(`/dashboard/tests/${testId}`);
      // With steps recorded, a worker is now writing the report from them.
      return { ok: true, state: state === "reporting" ? "stopping" : "stopped" };
    }
    return { ok: true, state: "stopping" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not stop the test." };
  }
}
