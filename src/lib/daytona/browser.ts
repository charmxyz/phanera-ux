import "server-only";
import { chromium, type Browser } from "playwright-core";
import { Daytona } from "@daytonaio/sdk";
import { env } from "@/lib/env";

// Must match the installed playwright-core version: client and server versions are paired.
const PLAYWRIGHT_VERSION = process.env.PLAYWRIGHT_VERSION ?? "1.64.1";
const PORT = 3000;

export type BrowserHandle = {
  browser: Browser;
  kind: "daytona" | "local";
  release: () => Promise<void>;
};

export class BrowserUnavailableError extends Error {}

/**
 * Acquires an isolated browser for one test run. Resolution order:
 * - BROWSER_PROVIDER=daytona|local forces a backend.
 * - DAYTONA_API_KEY set → ephemeral Daytona sandbox running a Playwright server.
 * - Running in a deployed Trigger.dev worker → headless Chromium inside that run's
 *   own container (installed by the Playwright build extension in trigger.config.ts).
 * - Development with ALLOW_LOCAL_BROWSER=true → local headless Chromium.
 * Each persona then gets its own BrowserContext (separate cookies/storage/navigation).
 */
export async function acquireBrowser(): Promise<BrowserHandle> {
  const forced = process.env.BROWSER_PROVIDER;
  const apiKey = env.daytonaApiKey();
  if (forced === "daytona" || (!forced && apiKey)) {
    if (!apiKey) throw new BrowserUnavailableError("BROWSER_PROVIDER=daytona but DAYTONA_API_KEY is not set.");
    return acquireDaytonaBrowser(apiKey);
  }
  const inTriggerWorker = Boolean(process.env.TRIGGER_DEPLOYMENT_ID);
  if (forced === "local" || inTriggerWorker || env.allowLocalBrowser()) {
    const browser = await chromium.launch({
      headless: true,
      // Containers have a tiny /dev/shm; without this Chromium tabs crash under load.
      args: ["--disable-dev-shm-usage"],
    });
    return { browser, kind: "local", release: () => browser.close() };
  }
  throw new BrowserUnavailableError(
    "No browser is available. Run tests in a deployed Trigger.dev worker, set DAYTONA_API_KEY, or set ALLOW_LOCAL_BROWSER=true in development.",
  );
}

async function acquireDaytonaBrowser(apiKey: string): Promise<BrowserHandle> {
  const daytona = new Daytona({ apiKey, apiUrl: env.daytonaApiUrl() });
  const sandbox = await daytona.create(
    {
      image: `mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble`,
      ephemeral: true, // deleted as soon as it stops
      autoStopInterval: 20, // hard stop if we crash before releasing
      labels: { app: "phanera", role: "browser" },
      resources: { cpu: 2, memory: 4 },
    },
    { timeout: 240 },
  );

  const release = async () => {
    try {
      await sandbox.delete();
    } catch (e) {
      console.error("[daytona] failed to delete sandbox", sandbox.id, e);
    }
  };

  try {
    await sandbox.process.createSession("pw");
    await sandbox.process.executeSessionCommand("pw", {
      command: `npx -y playwright@${PLAYWRIGHT_VERSION} run-server --port ${PORT} --host 0.0.0.0`,
      runAsync: true,
    });
    const preview = await sandbox.getPreviewLink(PORT);
    const wsEndpoint = preview.url.replace(/^http/, "ws");

    let lastErr: unknown;
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        const browser = await chromium.connect(wsEndpoint, {
          headers: { "X-Daytona-Preview-Token": preview.token },
          timeout: 15_000,
        });
        return { browser, kind: "daytona", release: async () => { await browser.close().catch(() => {}); await release(); } };
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    throw new BrowserUnavailableError(`Browser server in sandbox did not become ready: ${String(lastErr)}`);
  } catch (e) {
    await release();
    throw e;
  }
}

const SANDBOX_BLOCK_PATTERNS = [/internet is restricted/i, /network access (is )?(restricted|blocked)/i];
const PROBE_URL = "https://example.com/";

async function probe(browser: Browser, url: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
      if (page.url().startsWith("chrome-error:")) return { ok: false, reason: "browser error page" };
      const text = (await page.textContent("body").catch(() => "")) ?? "";
      if (SANDBOX_BLOCK_PATTERNS.some((p) => p.test(text))) return { ok: false, reason: "sandbox network restriction page" };
      if (res && res.status() >= 500) return { ok: false, reason: `HTTP ${res.status()}` };
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: e instanceof Error ? e.message.split("\n")[0] : "navigation failed" };
    }
  } finally {
    await context.close().catch(() => {});
  }
}

/**
 * Checks, before any persona runs, that the browser can actually reach the target.
 * Distinguishes "our sandbox has no internet" from "the site refuses the sandbox",
 * so environment failures are refunded instead of producing bogus findings.
 */
export async function assertBrowserCanReach(browser: Browser, startUrl: string): Promise<void> {
  const target = await probe(browser, startUrl);
  if (target.ok) return;
  const control = await probe(browser, PROBE_URL);
  if (!control.ok) {
    throw new BrowserUnavailableError(
      `The test browser has no outbound internet access (${control.reason}). If you're on Daytona Tier 1 or 2, outbound traffic is restricted; upgrade your Daytona tier or use ALLOW_LOCAL_BROWSER=true in development.`,
    );
  }
  throw new BrowserUnavailableError(
    `The website could not be loaded from the test browser (${target.reason}). It may be blocking cloud or automated traffic.`,
  );
}
