import "server-only";
import type { Browser, BrowserContext, Page } from "playwright-core";
import type Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateStructured } from "@/lib/claude/client";
import { browserAgentPrompt } from "@/lib/claude/prompts";
import { AgentStepSchema, type Persona } from "@/lib/claude/schemas";
import { isSameSite } from "@/lib/validation/url";
import { assertPublicUrl } from "@/lib/validation/network";
import { env } from "@/lib/env";

export type AgentRunConfig = {
  sessionId: string;
  userId: string;
  startUrl: string;
  allowedDomain: string;
  persona: Persona;
  testGoal: string;
  maxActions: number;
  maxDurationMs: number;
  screenshots: "key" | "all";
};

export type RecordedStep = {
  step: number;
  action: string;
  target: string | null;
  url: string;
  result: string;
  reasoning: string | null;
  /** What the agent saw on the page before acting (shown in the journey graph). */
  observation?: string | null;
  screenshotPath: string | null;
  error: string | null;
};

export type AgentRunResult = {
  ending: "finished" | "gave_up" | "action_limit" | "time_limit" | "error";
  finalReport: string | null;
  steps: RecordedStep[];
  durationMs: number;
  screenshots: { step: number; path: string; jpeg: Buffer }[];
};

type Element = { ref: number; tag: string; role: string; text: string; href: string | null; type: string | null; inView: boolean };

const DEVICES = {
  desktop: { viewport: { width: 1366, height: 860 }, isMobile: false, hasTouch: false, userAgent: undefined },
  mobile: {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
} as const;

/** Tags visible interactive elements with data-phanera-ref and returns a compact list. */
export async function snapshot(page: Page): Promise<{ elements: Element[]; text: string; title: string }> {
  return page.evaluate(() => {
    document.querySelectorAll("[data-phanera-ref]").forEach((el) => el.removeAttribute("data-phanera-ref"));
    const sel =
      'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab], [role=menuitem], [onclick]';
    const out: Element[] = [];
    let ref = 1;
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (r.width < 2 || r.height < 2 || style.visibility === "hidden" || style.display === "none") continue;
      const text = (el.getAttribute("aria-label") || el.innerText || (el as HTMLInputElement).placeholder || el.getAttribute("title") || (el as HTMLInputElement).value || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
      if (!text && el.tagName !== "INPUT" && el.tagName !== "SELECT" && el.tagName !== "TEXTAREA") continue;
      el.setAttribute("data-phanera-ref", String(ref));
      out.push({
        ref,
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute("role") || "",
        text,
        href: el instanceof HTMLAnchorElement ? el.href : null,
        type: el.getAttribute("type"),
        inView: r.bottom > 0 && r.top < window.innerHeight,
      });
      ref++;
      if (ref > 150) break;
    }
    return { elements: out, text: document.body.innerText.replace(/\s+/g, " ").slice(0, 3500), title: document.title };
  });
}

export async function guardContext(context: BrowserContext, domain: string) {
  await context.route("**/*", async (route) => {
    const req = route.request();
    let u: URL;
    try {
      u = new URL(req.url());
    } catch {
      return route.abort();
    }
    if (!/^(https?|data|blob):$/.test(u.protocol)) return route.abort();
    if (req.isNavigationRequest()) {
      // Main-document navigations must stay on the target site and be read-only.
      if (req.frame() === req.frame().page().mainFrame()) {
        if (!isSameSite(u.toString(), domain)) return route.abort("blockedbyclient");
        if (req.method() !== "GET") return route.abort("blockedbyclient");
      }
    }
    if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) return route.abort("blockedbyclient");
    return route.continue();
  });
}

function describeElements(elements: Element[]) {
  const inView = elements.filter((e) => e.inView);
  const rest = elements.filter((e) => !e.inView).slice(0, 60);
  const fmt = (e: Element) =>
    `[${e.ref}] <${e.tag}${e.type ? ` type=${e.type}` : ""}${e.role ? ` role=${e.role}` : ""}> ${e.text}${e.href ? ` → ${e.href}` : ""}`;
  return `In viewport:\n${inView.map(fmt).join("\n") || "(none)"}\n\nElsewhere on page:\n${rest.map(fmt).join("\n") || "(none)"}`;
}

export async function runPersonaAgent(browser: Browser, cfg: AgentRunConfig): Promise<AgentRunResult> {
  const db = createAdminClient();
  const started = Date.now();
  const device = DEVICES[cfg.persona.device] ?? DEVICES.desktop;
  const context = await browser.newContext({
    viewport: device.viewport,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    userAgent: device.userAgent,
    acceptDownloads: false,
    javaScriptEnabled: true,
    serviceWorkers: "block",
  });
  await guardContext(context, cfg.allowedDomain);
  const page = await context.newPage();
  page.on("dialog", (d) => d.dismiss().catch(() => {}));

  const steps: RecordedStep[] = [];
  const screenshots: AgentRunResult["screenshots"] = [];
  let ending: AgentRunResult["ending"] = "action_limit";
  let finalReport: string | null = null;
  let lastUrl = "";

  const record = async (s: Omit<RecordedStep, "screenshotPath">, jpeg: Buffer | null, forceShot = false) => {
    let screenshotPath: string | null = null;
    const keyStep = s.step === 0 || s.url !== lastUrl || s.error || forceShot;
    if (jpeg && (cfg.screenshots === "all" || keyStep)) {
      screenshotPath = `${cfg.userId}/${cfg.sessionId}/${String(s.step).padStart(3, "0")}.jpg`;
      const { error } = await db.storage.from("evidence").upload(screenshotPath, jpeg, { contentType: "image/jpeg", upsert: true });
      if (error) screenshotPath = null;
      else screenshots.push({ step: s.step, path: screenshotPath, jpeg });
    }
    lastUrl = s.url;
    const full = { ...s, screenshotPath };
    steps.push(full);
    const row = {
      session_id: cfg.sessionId,
      user_id: cfg.userId,
      step: s.step,
      action: s.action,
      target: s.target,
      url: s.url,
      result: s.result,
      reasoning: s.reasoning,
      screenshot_path: screenshotPath,
      error: s.error,
    };
    const { error: insertError } = await db.from("session_events").insert({ ...row, observation: s.observation ?? null });
    // Databases without the observation column (migration not yet applied) still record the step.
    if (insertError && /observation/i.test(insertError.message)) await db.from("session_events").insert(row);
  };

  const setActivity = (current_activity: string, action_count: number) =>
    db.from("sessions").update({ current_activity, action_count }).eq("id", cfg.sessionId);

  try {
    await assertPublicUrl(cfg.startUrl);
    await setActivity(`Opening ${cfg.startUrl}`, 0);
    let navError: string | null = null;
    try {
      const res = await page.goto(cfg.startUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
      if (res && res.status() >= 400) navError = `HTTP ${res.status()}`;
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    } catch (e) {
      navError = e instanceof Error ? e.message.split("\n")[0] : "Navigation failed";
    }
    const firstShot = await page.screenshot({ type: "jpeg", quality: 60 }).catch(() => null);
    await record({ step: 0, action: "open", target: cfg.startUrl, url: page.url(), result: navError ? "error" : "loaded", reasoning: null, error: navError }, firstShot, true);
    if (navError && (page.url() === "about:blank" || page.url().startsWith("chrome-error:"))) {
      ending = "error";
      finalReport = `Could not load the starting page: ${navError}`;
      return { ending, finalReport, steps, durationMs: Date.now() - started, screenshots };
    }

    const history: string[] = [];
    const system = browserAgentPrompt.system({
      persona: cfg.persona,
      testGoal: cfg.testGoal,
      allowedDomain: cfg.allowedDomain,
      maxActions: cfg.maxActions,
    });

    for (let i = 1; i <= cfg.maxActions; i++) {
      if (Date.now() - started > cfg.maxDurationMs) {
        ending = "time_limit";
        break;
      }
      const snap = await snapshot(page).catch(() => ({ elements: [] as Element[], text: "", title: "" }));
      const shot = await page.screenshot({ type: "jpeg", quality: 60 }).catch(() => null);

      const content: Anthropic.Beta.BetaContentBlockParam[] = [];
      if (shot) content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: shot.toString("base64") } });
      content.push({
        type: "text",
        text: [
          `Action ${i} of ${cfg.maxActions}. Current URL: ${page.url()}  Title: ${snap.title}`,
          history.length ? `Your previous actions:\n${history.join("\n")}` : "This is your first action.",
          `<website_content>\nVisible text (truncated): ${snap.text}\n\nInteractive elements:\n${describeElements(snap.elements)}\n</website_content>`,
          "Choose your next action.",
        ].join("\n\n"),
      });

      const decision = await generateStructured({
        schema: AgentStepSchema,
        system,
        content,
        model: env.anthropicAgentModel(),
        effort: "low",
        maxTokens: 4000,
      });
      await setActivity(decision.progress_note, i);

      if (decision.action === "finish" || decision.action === "give_up") {
        ending = decision.action === "finish" ? "finished" : "gave_up";
        finalReport = decision.final_report ?? decision.reasoning;
        await record({ step: i, action: decision.action, target: null, url: page.url(), result: finalReport ?? "", reasoning: decision.reasoning, observation: decision.observation, error: null }, shot, true);
        break;
      }

      const el = decision.element_ref != null ? snap.elements.find((e) => e.ref === decision.element_ref) : undefined;
      const locator = el ? page.locator(`[data-phanera-ref="${el.ref}"]`).first() : null;
      const targetDesc = el ? `${el.tag} "${el.text}"` : decision.value;
      let result = "ok";
      let error: string | null = null;
      try {
        switch (decision.action) {
          case "click":
            if (!locator) throw new Error("No element selected");
            await locator.click({ timeout: 6000 });
            break;
          case "type":
            if (!locator) throw new Error("No element selected");
            await locator.fill((decision.value ?? "").slice(0, 200), { timeout: 6000 });
            break;
          case "select":
            if (!locator) throw new Error("No element selected");
            await locator.selectOption({ label: decision.value ?? "" }, { timeout: 6000 }).catch(() => locator.selectOption(decision.value ?? "", { timeout: 6000 }));
            break;
          case "scroll_down":
            await page.mouse.wheel(0, device.viewport.height * 0.8);
            break;
          case "scroll_up":
            await page.mouse.wheel(0, -device.viewport.height * 0.8);
            break;
          case "go_back":
            await page.goBack({ timeout: 15_000, waitUntil: "domcontentloaded" });
            break;
          case "navigate": {
            const target = new URL(decision.value ?? "", page.url()).toString();
            if (!isSameSite(target, cfg.allowedDomain)) throw new Error("Blocked: navigation outside the allowed domain");
            await page.goto(target, { waitUntil: "domcontentloaded", timeout: 20_000 });
            break;
          }
        }
        await page.waitForLoadState("domcontentloaded", { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(700);
      } catch (e) {
        error = e instanceof Error ? e.message.split("\n")[0].slice(0, 300) : "Action failed";
        result = "error";
      }

      const after = await page.screenshot({ type: "jpeg", quality: 60 }).catch(() => null);
      await record({ step: i, action: decision.action, target: targetDesc ?? null, url: page.url(), result, reasoning: decision.reasoning, observation: decision.observation, error }, after);
      history.push(`${i}. ${decision.action}${targetDesc ? ` ${targetDesc}` : ""} → ${error ? `ERROR: ${error}` : `now at ${page.url()}`}`);
    }
  } catch (e) {
    ending = "error";
    finalReport = e instanceof Error ? e.message : "Agent crashed";
    const shot = await page.screenshot({ type: "jpeg", quality: 60 }).catch(() => null);
    await record({ step: steps.length, action: "error", target: null, url: page.url(), result: "error", reasoning: null, error: finalReport }, shot, true).catch(() => {});
  } finally {
    await context.close().catch(() => {});
  }

  return { ending, finalReport, steps, durationMs: Date.now() - started, screenshots };
}
