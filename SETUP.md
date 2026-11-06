# Phanera — local setup

The product spec lives in [docs/PRD.md](docs/PRD.md) and the technical reference in [README.md](README.md). This file covers setting up the services.

## 1. Install

```bash
pnpm install
cp .env.example .env.local
npx playwright install chromium   # only for ALLOW_LOCAL_BROWSER / smoke tests
```

## 2. Supabase

1. Create a project at supabase.com and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. Run the migration: paste `supabase/migrations/20261102000000_init.sql` into the SQL editor (or `supabase db push` with the CLI). It creates all tables with RLS, the profile trigger and the private `evidence` storage bucket.
3. **Auth → URL Configuration**: set Site URL to `NEXT_PUBLIC_APP_URL` and add `http://localhost:3000/auth/callback**` (and your production URL) to Redirect URLs.
4. **Auth → Email Templates → Magic Link**: so links work when opened in a different browser or device, use the token-hash link:

   ```html
   <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Sign in to Phanera</a>
   ```

   (The default `{{ .ConfirmationURL }}` template also works, but only in the same browser that requested the link.)
5. **Auth → SMTP Settings**: enable custom SMTP with Resend — host `smtp.resend.com`, port `465`, user `resend`, password = your Resend API key, sender on a verified Resend domain.

## 3. Claude

Set `ANTHROPIC_API_KEY`. Models are configured with `ANTHROPIC_MODEL` / `ANTHROPIC_AGENT_MODEL` (default `claude-opus-5-5`).
All AI calls are server-side and use structured outputs validated by Zod (`src/lib/claude`). Server-side refusal fallbacks are enabled by default; set `ANTHROPIC_FALLBACKS=off` to disable.

## 4. Browsers

Test runs need a real browser. The backend is chosen in `src/lib/daytona/browser.ts`:

- **Default — Trigger.dev workers.** `trigger.config.ts` uses Trigger's Playwright build extension, so every
  deployed test run launches headless Chromium inside its own isolated container (`medium-1x`, ~2 GB).
  Nothing to configure beyond deploying with `npx trigger.dev deploy`.
- **Daytona (optional).** If `DAYTONA_API_KEY` is set, each run uses an ephemeral Daytona sandbox instead
  (`mcr.microsoft.com/playwright:v$PLAYWRIGHT_VERSION-noble`). Daytona Tier 1/2 accounts block outbound
  internet, so this only works on higher tiers.
- **Local development.** Set `ALLOW_LOCAL_BROWSER=true` and run `npx playwright install chromium`.
  `pnpm trigger:dev` runs tasks on your machine, so it uses this too.
- `BROWSER_PROVIDER=daytona|local` forces a backend.

Before any persona starts, the run checks the browser can reach the site (and example.com as a control),
so environment problems fail fast and refund the run instead of producing findings.

## 5. Background jobs (Trigger.dev)

Discovery and test runs never execute inside a web request.

- **Local dev without Trigger.dev**: leave `TRIGGER_SECRET_KEY` empty and jobs run in-process after the response (`after()`).
- **With Trigger.dev**: set `TRIGGER_SECRET_KEY` and `TRIGGER_PROJECT_REF`, then run `pnpm trigger:dev` next to `pnpm dev`. Add the same Supabase / Anthropic env vars to the Trigger.dev project (Production environment) before deploying. Tasks live in `src/trigger/tasks.ts`.
- Production requires Trigger.dev (`npx trigger.dev deploy`).

## 5b. Background jobs on Railway (or any container host)

`scripts/worker.ts` is a standalone worker: it polls Supabase for queued discovery scans and
test runs, claims each with a conditional update (so several copies can run safely), and runs
them with headless Chromium. Jobs left half-done by a crash are failed and refunded after 75 min.

- Image: `Dockerfile.worker` (Playwright base image, so Chromium is included). `railway.json` points Railway at it.
- Worker env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`
  (+ `ANTHROPIC_MODEL` / `ANTHROPIC_AGENT_MODEL` if set), `PERSONA_CONCURRENCY` (1 per ~500 MB RAM),
  optional `WORKER_MAX_TESTS` (default 1) and `WORKER_MAX_DISCOVERIES` (default 2).
- Web app (Vercel) env: `JOB_RUNNER=worker`, so it saves jobs as queued instead of calling Trigger.dev.
- Locally: `pnpm worker` (with the same env), plus `JOB_RUNNER=worker` for `pnpm dev`.
- Scale by adding replicas or raising `WORKER_MAX_TESTS` on a bigger machine.

## 6. Run

```bash
pnpm dev                 # http://localhost:3000
pnpm smoke:discovery https://example.com   # URL-safety + crawler, no credentials needed
pnpm smoke:browser       # agent browser guards with local Chromium
pnpm typecheck && pnpm lint && pnpm build
```

## Architecture map

| Concern | Location |
|---|---|
| Landing page, pixel ants + flower | `src/components/landing`, `src/components/ants` |
| Auth (magic link, intent preservation, callback) | `src/app/actions/auth.ts`, `src/lib/auth/intents.ts`, `src/app/auth/*`, `src/proxy.ts` |
| Dashboard | `src/app/dashboard/*`, `src/components/dashboard` |
| URL validation & SSRF protection | `src/lib/validation` |
| Discovery (crawl, readiness signals, Claude summary) | `src/lib/discovery` |
| Prompts & schemas | `src/lib/claude` |
| Browser sandbox | `src/lib/daytona/browser.ts` |
| Persona agent loop | `src/lib/agents/persona-agent.ts` |
| Test orchestration | `src/lib/agents/run-test.ts` |
| Independent evaluation & findings | `src/lib/evaluation` |
| Usage & plan limits | `src/lib/usage` |
| Background jobs | `src/lib/jobs/dispatch.ts`, `src/trigger/tasks.ts` |
| Database schema + RLS | `supabase/migrations` |
