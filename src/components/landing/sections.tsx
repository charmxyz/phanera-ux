import Link from "next/link";
import { CheckIcon, FileSearchIcon, GlobeIcon, MonitorIcon, NetworkIcon, ScanTextIcon, SmartphoneIcon, CodeXmlIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { AntMarch } from "./ants/ant-march";
import { EnvironmentIso, HowItWorksIso } from "./iso/scenes";
import { HeroFlower } from "./flower/hero-flower";
import { ExploreForm } from "./explore-form";
import { cn } from "@/lib/utils";

function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto mb-12 max-w-[720px] text-center">
      {eyebrow && <p className="mb-4 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{eyebrow}</p>}
      <h2 className="text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl">{title}</h2>
      {children && <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">{children}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------- Hero */
export function Hero() {
  return (
    <section id="start" className="grain relative isolate flex min-h-[90vh] flex-col overflow-hidden bg-background text-foreground lg:justify-center">
      {/* Soft studio backdrop: a pale key behind the flower falling off to grey at the edges. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_55%_75%_at_70%_40%,#fdfdfd_0%,#f5f5f6_40%,var(--background)_100%)] max-lg:bg-[radial-gradient(ellipse_90%_55%_at_50%_75%,#fdfdfd_0%,#f5f5f6_45%,var(--background)_100%)]"
      />
      <div className="container-marketing relative z-10 pt-12 pb-0 sm:pt-24 lg:py-28">
        <div className="max-w-[540px]">
          <h1 className="text-[2.6rem] leading-[1.02] font-medium tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.5rem]">
            Find where visitors get stuck.
          </h1>
          <p className="mt-6 max-w-[440px] text-pretty text-muted-foreground sm:text-lg">
            Phanera sends simulated visitors through your website, then shows you what confused them and how to fix it.
          </p>
          <ExploreForm className="mt-9 max-w-lg" id="hero-url" />
          <p className="mt-3 text-xs text-muted-foreground">Free for your first 5 tests. No card needed.</p>
        </div>
      </div>
      <div className="relative -mt-8 h-[52vh] min-h-[340px] w-full lg:absolute lg:mt-0 lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[64%]">
        <HeroFlower />
      </div>
      {/* Let the stem and leaves dissolve into the next section instead of being cut off. */}
      <div aria-hidden className="fade-edge-b pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40" />
    </section>
  );
}

/* --------------------------------------------------------- How it works */
const STEPS = [
  { n: "1", t: "Ask a question", d: "“Can a new visitor find pricing?” Paste your URL and pick the question." },
  { n: "2", t: "Visitors try it", d: "Each persona browses your live site in a real browser, its own way." },
  { n: "3", t: "See what to fix", d: "Issues ranked by urgency, each with screenshots and a suggested fix." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 py-24">
      <div className="container-marketing">
        <SectionHeading eyebrow="How it works" title="Paste a link. Get answers in minutes.">
          No recruiting, no scheduling, no waiting on a research report.
        </SectionHeading>
        <div className="-mx-4 overflow-hidden sm:mx-0">
          <HowItWorksIso className="mx-auto block w-[150%] max-w-none -translate-x-[16%] sm:w-full sm:max-w-5xl sm:translate-x-0" />
        </div>
        <ol className="mx-auto mt-6 grid max-w-5xl gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="grid gap-1.5">
              <span className="flex size-6 items-center justify-center rounded-full border border-border font-mono text-xs">{step.n}</span>
              <p className="font-medium">{step.t}</p>
              <p className="text-sm text-pretty text-muted-foreground">{step.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Environments */
const ENVS = [
  { kind: "desktop" as const, pills: [["Real browser", GlobeIcon], ["Desktop", MonitorIcon], ["1366 × 860", null]] as const },
  { kind: "mobile" as const, pills: [["Real browser", GlobeIcon], ["Phone", SmartphoneIcon], ["390 × 844 · touch", null]] as const },
];

export function Environments() {
  return (
    <section className="py-24">
      <div className="container-marketing">
        <SectionHeading eyebrow="Environments" title="Tested the way visitors browse.">
          Every persona gets a fresh, isolated browser on a desktop or phone-sized screen, and uses your live site with real clicks, scrolls and typing.
        </SectionHeading>
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          {ENVS.map((env) => (
            <div key={env.kind} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-border px-4 py-3 text-sm">
                {env.pills.map(([label, Icon], i) => (
                  <span key={label} className="flex items-center gap-1.5">
                    {i === 1 && <span className="px-0.5 text-muted-foreground">on</span>}
                    <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
                      {Icon && <Icon className="size-3.5" />}
                      {label}
                    </span>
                  </span>
                ))}
              </div>
              <EnvironmentIso kind={env.kind} className="block w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Personas */
const EXAMPLE_PERSONAS = [
  { name: "Alex", role: "First-time visitor", goal: "Heard about you once. Wants to know what you do, fast.", behaviour: "Skims headings", trait: "Impatient" },
  { name: "Sam", role: "Budget owner", goal: "Needs a price to take to the boss.", behaviour: "Reads the fine print", trait: "Skeptical" },
  { name: "Taylor", role: "Technical evaluator", goal: "Checking it works with their stack.", behaviour: "Goes straight to docs", trait: "Thorough" },
  { name: "Morgan", role: "AI assistant", goal: "Answering a user's question about you.", behaviour: "Reads structure, not visuals", trait: "Literal" },
];

export function Personas() {
  return (
    <section id="product" className="scroll-mt-16 py-24">
      <div className="container-marketing">
        <SectionHeading eyebrow="Personas" title="Visitors who behave like people.">
          Each one has a reason to visit and a way of browsing. Some skim. Some read everything. Some give up after two wrong clicks.
        </SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXAMPLE_PERSONAS.map((p) => (
            <Card key={p.name} size="sm" className="gap-4">
              <CardHeader className="flex flex-row items-center gap-3">
                <AntAvatar seed={p.name} size={36} />
                <div>
                  <CardTitle className="text-sm">{p.name}</CardTitle>
                  <CardDescription className="text-xs">{p.role}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <p className="text-pretty">{p.goal}</p>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <span className="rounded-md border border-border px-2 py-0.5">{p.behaviour}</span>
                  <span className="rounded-md border border-border px-2 py-0.5">{p.trait}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Phanera suggests personas for your site. Edit them or write your own. They&apos;re simulated, not real people.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Session evidence */
export function SessionEvidence() {
  const timeline = [
    { t: "00:00", a: "Opened", d: "/", ok: true },
    { t: "00:06", a: "Scrolled", d: "Hero → features", ok: true },
    { t: "00:14", a: "Clicked", d: "“Product” menu", ok: true },
    { t: "00:21", a: "Searched", d: "Looked for “pricing” in nav", ok: false },
    { t: "00:33", a: "Clicked", d: "Footer → “Plans”", ok: true },
    { t: "00:40", a: "Finished", d: "Found Startup plan price", ok: true },
  ];
  return (
    <section className="py-24">
      <div className="container-marketing">
        <SectionHeading eyebrow="Replays" title="Watch every visit.">
          Step through each persona&apos;s visit with screenshots and what they were thinking at every click.
        </SectionHeading>
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <div className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="size-2.5 rounded-full bg-border" />)}</div>
            <div className="mx-auto truncate rounded-md bg-background px-3 py-1 font-mono text-xs text-muted-foreground">https://example.com/plans</div>
            <Badge variant="outline" className="font-normal text-muted-foreground">Illustrative demo</Badge>
          </div>
          <div className="grid md:grid-cols-[1.4fr_1fr]">
            <div className="border-b border-border p-4 md:border-r md:border-b-0">
              <div className="mb-3 flex items-center gap-3">
                <AntAvatar seed="Sam" size={32} state="done" />
                <div className="grid">
                  <span className="text-sm font-medium">Sam · Potential customer</span>
                  <span className="text-xs text-muted-foreground">Task: Compare plans and find pricing</span>
                </div>
                <span className="ml-auto text-sm text-success">Partial success</span>
              </div>
              {/* Wireframe "screenshot" */}
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="mb-4 flex items-center justify-between"><div className="h-2 w-16 rounded bg-border" /><div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-2 w-10 rounded bg-border" />)}</div></div>
                <div className="mx-auto mb-4 h-3 w-1/2 rounded bg-muted-foreground/30" />
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={cn("grid gap-2 rounded-md border p-3", i === 1 ? "border-primary/60" : "border-border")}>
                      <div className="h-2 w-10 rounded bg-muted-foreground/40" />
                      <div className="h-4 w-14 rounded bg-foreground/70" />
                      {[0, 1, 2].map((j) => <div key={j} className="h-1.5 w-full rounded bg-border" />)}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-1.5">
                  <div className="h-2 w-1/3 rounded bg-muted-foreground/30" />
                  {[0, 1, 2].map((i) => <div key={i} className="h-1.5 rounded bg-border" style={{ width: `${90 - i * 18}%` }} />)}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground"><Progress value={75} className="h-1 flex-1" /> <span className="font-mono">6 / 8 actions</span></div>
            </div>
            <ol className="grid content-start gap-0 p-4">
              {timeline.map((s, i) => (
                <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", s.ok ? "bg-foreground/70" : "bg-warning")} />
                  <div className="grid gap-0.5 text-sm">
                    <span><span className="font-mono text-xs text-muted-foreground">{s.t}</span> · {s.a}</span>
                    <span className="text-xs text-muted-foreground">{s.d}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Findings */
const BOARD = [
  { label: "Low", dot: "bg-muted-foreground/50", items: [{ t: "Feature names change between pages", p: ["Alex"] }] },
  { label: "Medium", dot: "bg-warning", items: [{ t: "Main button is hard to spot on mobile", p: ["Alex", "Sam"] }, { t: "No proof or customer logos near pricing", p: ["Sam"] }] },
  { label: "High", dot: "bg-destructive", items: [{ t: "Pricing is two clicks deep", p: ["Sam", "Morgan"] }] },
];

export function Findings() {
  return (
    <section className="py-24">
      <div className="container-marketing">
        <SectionHeading eyebrow="Findings" title="Clear fixes, not hours of recordings.">
          Every issue is ranked by urgency, backed by screenshots, and comes with a suggested fix.
        </SectionHeading>
        <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-3">
          {BOARD.map((col) => (
            <div key={col.label} className="flex flex-col gap-2.5 rounded-2xl bg-card/70 p-3 ring-1 ring-foreground/5">
              <div className="flex items-center gap-2 px-1 text-sm">
                <span className={cn("size-2 rounded-full", col.dot)} />
                <span className="font-medium">{col.label}</span>
                <span className="text-xs text-muted-foreground">{col.items.length}</span>
              </div>
              {col.items.map((f) => (
                <div key={f.t} className="grid gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-xs">
                  <p className="text-sm leading-snug font-medium">{f.t}</p>
                  <div className="flex items-center gap-1.5">
                    {f.p.map((n) => <AntAvatar key={n} seed={n} size={18} />)}
                    <span className="text-xs text-muted-foreground">{f.p.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Agent readiness */
export function AgentReadiness() {
  const items = [
    { icon: FileSearchIcon, t: "Can they find your pages?", d: "Sitemaps, robots rules and llms.txt." },
    { icon: CodeXmlIcon, t: "Can they read them?", d: "Headings, landmarks and labels." },
    { icon: NetworkIcon, t: "Can they get around?", d: "Links and buttons they can use without guessing." },
    { icon: ScanTextIcon, t: "Do they get you right?", d: "Whether they describe your product accurately." },
  ];
  return (
    <section className="py-24">
      <div className="container-marketing grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">Agent readiness</p>
          <h2 className="text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl">Ready for AI assistants too.</h2>
          <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
            More buyers now ask ChatGPT and other assistants about products. Phanera checks whether those assistants can find, read and use your pages.
          </p>
        </div>
        <div className="grid gap-2">
          {items.map((i) => (
            <div key={i.t} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <i.icon className="mt-0.5 size-4 text-primary" />
              <div><p className="text-sm font-medium">{i.t}</p><p className="text-sm text-muted-foreground">{i.d}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Pricing */
const TIERS = [
  {
    name: "Free", price: "£0", period: "/month", cta: "Start for free", href: "/#start", available: true,
    features: ["5 lifetime test runs", "Up to 3 personas per run", "10 pages per website scan", "Basic findings", "Shareable report"],
  },
  {
    name: "Startup", price: "£99", period: "/month", cta: "Upgrade", href: "/dashboard/settings#billing", available: true, highlight: true,
    features: ["10 test runs every month", "Up to 10 personas per test", "50 pages per website scan", "Longer sessions: 20 actions, 8 minutes per persona", "Screenshots of every step", "Pay by card or PayPal"],
  },
  {
    name: "Enterprise", price: "Custom", period: "", cta: "Contact us", href: "mailto:hello@phanera.app", available: true,
    features: ["Higher usage limits", "Custom deployment requirements", "Advanced integrations", "Team features"],
  },
];

export function Pricing({ heading = true }: { heading?: boolean }) {
  return (
    <section id="pricing" className="scroll-mt-16 py-24">
      <div className="container-marketing">
        {heading && <SectionHeading eyebrow="Pricing" title="Start free. Scale when you're ready." />}
        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map((t) => (
            <Card key={t.name} className={cn("gap-6", t.highlight && "ring-primary/50")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t.name}</CardTitle>
                  {!t.available && <Badge variant="secondary">Coming soon</Badge>}
                </div>
                <p className="mt-2"><span className="text-3xl font-semibold tracking-tight">{t.price}</span><span className="text-muted-foreground">{t.period}</span></p>
              </CardHeader>
              <CardContent className="grid gap-6">
                <ul className="grid gap-2 text-sm">
                  {t.features.map((f) => <li key={f} className="flex gap-2"><CheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />{f}</li>)}
                </ul>
                {t.href ? (
                  <Link href={t.href} className={buttonVariants({ variant: t.name === "Free" ? "default" : "outline", size: "lg" })}>{t.cta}</Link>
                ) : (
                  <span className={buttonVariants({ variant: "outline", size: "lg", className: "pointer-events-none opacity-60" })} aria-disabled>{t.cta}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- FAQ */
const FAQS = [
  ["What is Phanera?", "A quick way to see your website the way visitors do. Simulated visitors try a task on your live site in real browsers, and Phanera shows you what got in their way and how to fix it."],
  ["How does it work?", "Paste your URL and pick a question, like \u201ccan a new visitor find pricing?\u201d. Phanera reads your site, suggests personas, and sends each one through it. A separate reviewer checks every visit before writing the findings."],
  ["Are the personas real people?", "No. They're simulated visitors with different reasons and habits. They're great for catching friction early, but they don't replace talking to customers."],
  ["Does it check AI assistants too?", "Yes. Every test includes an AI assistant persona, plus a report on whether assistants can find, read and use your pages."],
  ["Can I test any website?", "Any public website. Logged-in pages, localhost and private networks aren't supported, and personas never buy anything or submit forms that change data."],
  ["How long does a test take?", "Usually a few minutes. You can watch the personas live while they work."],
  ["How much does Phanera cost?", "The Free plan includes 5 test runs with up to 3 personas each. The Startup plan is £99/month for 10 test runs a month with up to 10 personas each, paid by card or PayPal and cancellable anytime."],
];

export function FAQ() {
  return (
    <section className="py-24">
      <div className="container-reading">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." />
        <Accordion className="w-full">
          {FAQS.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left text-base">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Final CTA */
export function FinalCTA() {
  return (
    <section className="bg-studio grain relative isolate flex min-h-[640px] items-center overflow-hidden py-28">
      <AntMarch className="-z-10 [mask-image:radial-gradient(ellipse_36%_42%_at_50%_52%,transparent_45%,black_100%)]" />
      {/* Ants walk in and out of soft fog at the section edges rather than being clipped. */}
      <div aria-hidden className="fade-edge-t pointer-events-none absolute inset-x-0 top-0 -z-10 h-28" />
      <div aria-hidden className="fade-edge-b pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28" />
      <div className="container-reading flex flex-col items-center text-center">
        <p className="mb-5 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">Release the colony</p>
        <h2 className="text-4xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl">What are your visitors running into?</h2>
        <p className="mt-5 text-muted-foreground sm:text-lg">Paste your URL and find out in minutes.</p>
        <ExploreForm className="mt-9 max-w-xl" id="cta-url" />
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><GlobeIcon className="size-3" /> Public websites only</p>
      </div>
    </section>
  );
}
