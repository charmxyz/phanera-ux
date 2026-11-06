import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { crawlWebsite, measureReadiness } from "./crawl";
import { generateStructured } from "@/lib/claude/client";
import { websiteSummaryPrompt, personaPrompt } from "@/lib/claude/prompts";
import { WebsiteAnalysisSchema, PersonaSuggestionsSchema, desktopUnlessAsked } from "@/lib/claude/schemas";
import { BILLING_COLUMNS, effectivePlan, planLimits } from "@/lib/usage/plans";
import type { DiscoveryStatus, Json } from "@/types/database";

/** Runs a full website discovery. Executed by a background worker, never inside a request. */
export async function runDiscovery(websiteId: string) {
  const db = createAdminClient();
  const { data: website, error } = await db.from("websites").select("*").eq("id", websiteId).single();
  if (error || !website) throw new Error(`Website ${websiteId} not found`);
  const { data: profile } = await db.from("profiles").select(BILLING_COLUMNS).eq("id", website.user_id).single();
  const limits = planLimits(effectivePlan(profile));

  const setStatus = (discovery_status: DiscoveryStatus, extra: Record<string, unknown> = {}) =>
    db.from("websites").update({ discovery_status, updated_at: new Date().toISOString(), ...extra }).eq("id", websiteId);

  try {
    await setStatus("fetching", { discovery_error: null });
    const crawl = await crawlWebsite(website.url, {
      maxPages: limits.pagesPerScan,
      onProgress: async (stage) => void (await setStatus(stage)),
    });
    const readiness = measureReadiness(crawl);

    // Persist the page inventory before AI analysis so partial results survive failures.
    await db.from("website_pages").delete().eq("website_id", websiteId);
    await db.from("website_pages").insert(
      crawl.pages.map((p) => ({
        website_id: websiteId,
        user_id: website.user_id,
        url: p.url,
        title: p.title || null,
        word_count: p.wordCount,
        crawl_status: p.signals.likelyJsRendered ? "js_rendered" : "ok",
      })),
    );

    const origin = new URL(crawl.root.url).origin;
    await setStatus("analysing", {
      title: crawl.root.title || website.domain,
      description: crawl.root.description || null,
      favicon_url: `${origin}/favicon.ico`,
      readiness: { measured: readiness } as unknown as Json,
    });

    const analysis = await generateStructured({
      schema: WebsiteAnalysisSchema,
      system: websiteSummaryPrompt.system,
      content: websiteSummaryPrompt.user({
        url: crawl.root.url,
        pages: crawl.pages.map((p) => ({ url: p.url, title: p.title, text: p.text.slice(0, 3000), nav: p.nav })),
        signals: readiness,
      }),
      effort: "medium",
    });

    // Apply page classifications.
    for (const c of analysis.pages) {
      await db
        .from("website_pages")
        .update({ page_type: c.page_type, content_summary: c.summary })
        .eq("website_id", websiteId)
        .eq("url", c.url);
    }

    const personas = await generateStructured({
      schema: PersonaSuggestionsSchema,
      system: personaPrompt.system,
      content: personaPrompt.user({ summary: analysis, count: 3 }),
      effort: "low",
      maxTokens: 8000,
    });

    const partial = crawl.failed.length > 0 && crawl.pages.length < 3;
    await setStatus(partial ? "partial" : "complete", {
      title: analysis.website_name || crawl.root.title || website.domain,
      description: analysis.product_description,
      summary: analysis as unknown as Json,
      suggested_goals: analysis.suggested_goals as unknown as Json,
      suggested_personas: desktopUnlessAsked(personas.personas) as unknown as Json,
      last_scanned_at: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discovery failed.";
    const { count } = await db.from("website_pages").select("id", { count: "exact", head: true }).eq("website_id", websiteId);
    await setStatus(count ? "partial" : "failed", { discovery_error: message, last_scanned_at: new Date().toISOString() });
    throw err;
  }
}
