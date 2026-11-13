import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, ClipboardCheckIcon, GlobeIcon, MonitorPlayIcon, ScanEyeIcon, ScanTextIcon, Share2Icon, UsersIcon, type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { GithubMark } from "@/components/brand/github-mark";
import { GITHUB_URL } from "@/lib/contact";
import { STARTUP_PRICE } from "@/lib/usage/plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Self-host Phanera",
  description:
    "Phanera is open source. Run AI usability tests on your own servers with your own Claude API key: you pay for what you use, and nothing for the app.",
  alternates: { canonical: "/self-host" },
};

/** Each step links to its heading in the README on GitHub. */
const readme = (anchor: string) => `${GITHUB_URL}#${anchor}`;

const COSTS = [
  { name: "Phanera", note: "MIT license", cost: "Free" },
  { name: "Supabase", note: "Database, sign-in, storage", cost: "Free tier" },
  { name: "Vercel", note: "The web app", cost: "Free tier" },
  { name: "Railway", note: "The test worker", cost: "Usage based" },
  { name: "Claude API", note: "Every persona and report", cost: "Pay per use" },
];

const SERVICES: { name: string; optional?: boolean; alt?: string; for: string; cost: string }[] = [
  { name: "Supabase", for: "Accounts, websites, tests, findings and screenshots", cost: "Free tier works" },
  { name: "Anthropic", for: "Claude: website analysis, personas, browsing, review and findings", cost: "Pay per use. A faster model for the browsing agent makes tests cheaper" },
  { name: "Vercel", alt: "or any Node.js host", for: "The web app", cost: "Free tier works" },
  { name: "Railway", alt: "or any Docker host", for: "The worker that runs each persona in headless Chromium", cost: "Usage based. About 500 MB of RAM per persona running at once" },
  { name: "Resend", optional: true, for: "Magic-link sign-in emails, through Supabase", cost: "Free plan works" },
  { name: "Stripe or PayPal", optional: true, for: "Only if you charge your own users", cost: "Their usual fees" },
];

const COMPARE: [string, string, string][] = [
  ["Price", "Free, plus your Claude API and hosting usage", `5 tests free, then Startup at ${STARTUP_PRICE.label} a month`],
  ["AI", "Your Anthropic account and the Claude models you choose", "Included"],
  ["Browsers", "Chromium on your worker, or on your laptop", "Run for you"],
  ["Your data", "In your own Supabase project", "Hosted by Phanera"],
  ["Who signs in", "The people you allow", "Anyone who signs up"],
  ["Limits", "Yours to set, in one file", "Tests a month and personas per test, by plan"],
  ["Setup", "About an hour, or 15 minutes on your laptop", "A minute"],
  ["Support", "None: you keep it up to date yourself", "Email us"],
];

const STEPS = [
  { t: "Install", d: "Clone the repository, install with pnpm and add a local Chromium for the AI personas.", anchor: "1-install" },
  { t: "Database", d: "Create a free Supabase project, run the migrations and copy its keys.", anchor: "2-database" },
  { t: "Claude", d: "Add your Anthropic API key, and pick the models for analysis and for browsing.", anchor: "3-claude" },
  { t: "Run it locally", d: "Start the dev server, sign in with a magic link and run your first usability test.", anchor: "4-run-it-locally" },
  { t: "Deploy", d: "Put the web app on Vercel and the test worker on Railway, and send sign-in emails through Resend.", anchor: "5-deploy" },
  { t: "Sign-ins and limits", d: "Choose who can sign in, then raise your own limits with one SQL line or edit them in code.", anchor: "6-sign-ins-and-limits" },
];

const FEATURES: { icon: LucideIcon; t: string; d: string }[] = [
  { icon: GlobeIcon, t: "Website analysis", d: "Reads your pages, sitemap and navigation, and suggests user tasks worth testing." },
  { icon: UsersIcon, t: "AI personas", d: "Distinct goals, motivations and patience, including an AI assistant persona." },
  { icon: MonitorPlayIcon, t: "Real browsers", d: "Each persona clicks, scrolls and reads your live site in headless Chromium." },
  { icon: ScanEyeIcon, t: "Session replays", d: "Every step with its screenshot, the action taken and the persona's reasoning." },
  { icon: ClipboardCheckIcon, t: "Usability findings", d: "An independent review of every session, then prioritised findings with suggested fixes." },
  { icon: ScanTextIcon, t: "AI accessibility", d: "Whether ChatGPT and other assistants can find, read and use your pages." },
];

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mb-4 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase", className)}>{children}</p>;
}

function Section({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: string; intro: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16 py-16 sm:py-20">
      <div className="container-marketing">
        <div className="mb-10 max-w-[680px]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-4xl">{title}</h2>
          <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function GuideButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  return (
    <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={buttonVariants({ variant, size: "lg", className: "gap-2" })}>
      <GithubMark className="size-4" />
      Setup guide
    </a>
  );
}

export default function SelfHostPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="container-marketing grid items-center gap-12 lg:grid-cols-[1fr_420px]">
          <div className="max-w-[580px]">
            <Eyebrow>Open source, MIT</Eyebrow>
            <h1 className="text-[2.6rem] leading-[1.02] font-medium tracking-[-0.035em] text-balance sm:text-6xl">Self-host Phanera</h1>
            <p className="mt-6 text-pretty text-muted-foreground sm:text-lg">
              Run AI usability tests on your own servers with your own Claude API key. You pay Anthropic and your hosts for what you use, and
              nothing for the app: no plan to pick, and limits you set yourself.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <GuideButton />
              <Link href="#setup" className={buttonVariants({ variant: "ghost", size: "lg", className: "text-muted-foreground hover:text-foreground" })}>
                See the six steps
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Rather not run a server? phanera.com runs the same code for you, free for your first 5 usability tests.{" "}
              <Link href="/#start" className="font-medium text-foreground underline underline-offset-4">Get started</Link>
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
            <p className="text-sm font-medium">What a self-hosted Phanera costs</p>
            <dl className="mt-4 divide-y divide-border text-sm">
              {COSTS.map((c) => (
                <div key={c.name} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt>
                    <span className="font-medium">{c.name}</span>
                    <span className="block text-xs text-muted-foreground">{c.note}</span>
                  </dt>
                  <dd className="shrink-0 font-mono text-xs">{c.cost}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              Trying it on your laptop? You only need a free Supabase project and a Claude API key.
            </p>
          </div>
        </div>
      </section>

      {/* 01 */}
      <Section id="what-you-need" eyebrow="01 · What you need" title="Services with free tiers, and your Claude key" intro="Plan for about an hour to put it online, most of it waiting for DNS and email.">
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">The services a self-hosted Phanera uses</caption>
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Service</th>
                <th scope="col" className="px-4 py-3 font-medium">For</th>
                <th scope="col" className="px-4 py-3 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SERVICES.map((s) => (
                <tr key={s.name} className="align-top">
                  <th scope="row" className="px-4 py-3.5 font-medium">
                    <span className="flex flex-wrap items-center gap-2">
                      {s.name}
                      {s.optional && <span className="rounded-md border border-border px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground">Optional</span>}
                    </span>
                    {s.alt && <span className="block text-xs font-normal text-muted-foreground">{s.alt}</span>}
                  </th>
                  <td className="px-4 py-3.5 text-muted-foreground">{s.for}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{s.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 02 */}
      <Section id="compare" eyebrow="02 · Self-hosted or phanera.com" title="The same app, two ways to run it" intro="phanera.com runs this same code, with plans and billing turned on. Every change to the app ships to both.">
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Self-hosted Phanera and phanera.com</caption>
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="w-[20%] px-4 py-3 font-medium">What</th>
                <th scope="col" className="w-[40%] px-4 py-3 font-medium">Self-hosted</th>
                <th scope="col" className="w-[40%] px-4 py-3 font-medium">phanera.com</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPARE.map(([what, self, hosted]) => (
                <tr key={what} className="align-top">
                  <th scope="row" className="px-4 py-3.5 font-medium">{what}</th>
                  <td className="px-4 py-3.5 text-muted-foreground">{self}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{hosted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 03 */}
      <Section id="setup" eyebrow="03 · Setup" title="Six steps, in the README" intro="The first four get Phanera running on your laptop. The last two put it online. Each step's details are in the setup guide on GitHub.">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.anchor}>
              <a
                href={readme(s.anchor)}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-foreground/30"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-muted font-mono text-sm">{i + 1}</span>
                <span className="font-medium">{s.t}</span>
                <span className="flex-1 text-sm text-pretty text-muted-foreground">{s.d}</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  Read the step
                  <ArrowUpRightIcon className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </Section>

      {/* 04 */}
      <Section id="features" eyebrow="04 · Features" title="Everything Phanera does, on your server" intro="Self-hosted, you get the whole app, with no plan to pick.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
              <f.icon className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{f.t}</p>
                <p className="mt-1 text-sm text-pretty text-muted-foreground">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Share2Icon className="size-4" />
          Reports share with a link, so the rest of your team doesn&apos;t need an account.
        </p>
      </Section>

      {/* Hosted alternative */}
      <section className="pt-8 pb-24">
        <div className="container-marketing">
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-muted/40 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[560px]">
              <h2 className="text-2xl font-medium tracking-[-0.02em] sm:text-3xl">Rather not run a server?</h2>
              <p className="mt-3 text-pretty text-muted-foreground">
                phanera.com runs the same code for you, with browsers, Claude and updates included. Free for your first 5 usability tests, then{" "}
                {STARTUP_PRICE.label} a month.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/#start" className={buttonVariants({ size: "lg", className: "gap-2" })}>
                Get started <ArrowRightIcon className="size-4" />
              </Link>
              <GuideButton variant="outline" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
