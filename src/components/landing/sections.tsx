import Link from "next/link";
import { CheckIcon, ClipboardCheckIcon, FileSearchIcon, GlobeIcon, MousePointerClickIcon, NetworkIcon, ScanEyeIcon, ScanTextIcon, CodeXmlIcon, UsersIcon, TargetIcon, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { AntMarch } from "./ants/ant-march";
import { VoxelBrowserView } from "./browser/voxel-browser-view";
import { HeroFlower } from "./flower/hero-flower";
import { ExploreForm } from "./explore-form";
import { cn } from "@/lib/utils";

function SectionHeading({ eyebrow, icon: Icon, title, children }: { eyebrow?: string; icon?: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto mb-12 max-w-[720px] text-center">
      {eyebrow && (
        <p className="mb-4 flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
          {Icon && <Icon className="size-3.5" />}
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl">{title}</h2>
      {children && <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">{children}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------- Hero */
export function Hero() {
  return (
    <section id="start" className="relative isolate flex min-h-[90vh] flex-col overflow-hidden bg-background text-foreground lg:justify-center">
      <div className="container-marketing relative z-10 pt-12 pb-0 sm:pt-24 lg:py-28">
        <div className="max-w-[540px]">
          <p className="mb-6 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">AI user research</p>
          <h1 className="text-[2.6rem] leading-[1.02] font-medium tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.5rem]">
            See your product through your users&apos; eyes.
          </h1>
          <p className="mt-6 max-w-[460px] text-pretty text-muted-foreground sm:text-lg">
            AI personas explore your website and attempt real tasks, so you can see what works, what doesn&apos;t, and what to improve, in minutes.
          </p>
          <ExploreForm className="mt-9 max-w-lg" id="hero-url" />
          <p className="mt-3 text-xs text-muted-foreground">Free for your first 5 usability tests. No card needed.</p>
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
  { icon: TargetIcon, t: "Set a user task", d: "For example “Can a new visitor find pricing?” Add your URL and Phanera analyses your website." },
  { icon: UsersIcon, t: "AI personas explore", d: "Each persona works through the task in its own way, clicking, scrolling and reading like a real user." },
  { icon: ClipboardCheckIcon, t: "Get research insights", d: "Task outcomes, session replays and prioritised usability findings, ready to share." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 py-24">
      <div className="container-marketing">
        <SectionHeading eyebrow="How it works" icon={MousePointerClickIcon} title="Watch how they experience your product.">
          Each persona navigates your website in a real browser, interacting with pages and attempting to complete tasks.
        </SectionHeading>
        <VoxelBrowserView className="mx-auto aspect-[16/9] w-full max-w-5xl max-sm:aspect-[4/3]" />
        <ol className="mx-auto mt-6 grid max-w-5xl gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.t} className="grid gap-1.5">
              <span className="flex size-8 items-center justify-center rounded-lg border border-border"><step.icon className="size-4" /></span>
              <p className="font-medium">{step.t}</p>
              <p className="text-sm text-pretty text-muted-foreground">{step.d}</p>
            </li>
          ))}
        </ol>
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
        <SectionHeading eyebrow="AI personas" icon={UsersIcon} title="Different users. Different perspectives.">
          Generate AI personas with different goals, motivations and behaviours to explore your website.
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
        <p className="mt-6 text-center text-xs text-muted-foreground">Phanera suggests AI personas for your website. Edit them or describe your own.</p>
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
        <SectionHeading eyebrow="Session replays" icon={ScanEyeIcon} title="Understand what works and what doesn&apos;t.">
          Review user journeys, screenshots, task outcomes and the issues that affected each experience.
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
                  <span className="text-xs text-muted-foreground">User task: Compare plans and find pricing</span>
                </div>
                <span className="ml-auto text-sm text-warning">Partially completed</span>
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
        <SectionHeading eyebrow="Usability findings" icon={ClipboardCheckIcon} title="Turn observations into improvements.">
          Get prioritised usability findings, supporting evidence and suggested fixes in one shareable report.
        </SectionHeading>
        <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-3">
          {BOARD.map((col) => (
            <div key={col.label} className="flex flex-col gap-2.5 rounded-2xl bg-[#f6f6f7] p-3">
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
          <p className="mb-4 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">AI accessibility</p>
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
    features: ["5 usability tests", "Up to 3 AI personas per test", "10 pages per website analysis", "Usability findings", "Shareable report"],
  },
  {
    name: "Startup", price: "£99", period: "/month", cta: "Upgrade", href: "/dashboard/settings#billing", available: true, highlight: true,
    features: ["10 usability tests every month", "Up to 10 AI personas per test", "50 pages per website analysis", "Longer sessions: 20 actions, 8 minutes per persona", "Screenshots of every step", "Pay by card or PayPal"],
  },
  {
    name: "Enterprise", price: "Custom", period: "", cta: "Contact us", href: "mailto:firdaussaffan@gmail.com", available: true,
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
  ["What is Phanera?", "An AI user research platform. AI personas attempt real tasks on your website in real browsers, and Phanera turns their sessions into research insights: task outcomes, session replays and prioritised usability findings."],
  ["How does it work?", "Add your URL and a user task, like \u201ccan a new visitor find pricing?\u201d. Phanera analyses your website, suggests AI personas and sends each one through the task. An independent review of every session produces the research insights."],
  ["Are the personas real people?", "No. AI personas are simulated users with distinct goals and behaviours. They surface usability issues early and cheaply, and complement rather than replace research with real customers."],
  ["Does it cover AI assistants too?", "Yes. Every usability test includes an AI assistant persona, plus an AI accessibility report on whether assistants can find, read and use your pages."],
  ["Can I test any website?", "Any public website. Logged-in pages, localhost and private networks aren't supported, and AI personas never buy anything or submit forms that change data."],
  ["How long does a usability test take?", "Usually a few minutes. You can follow each AI persona live while it works."],
  ["How much does Phanera cost?", "The Free plan includes 5 usability tests with up to 3 AI personas each. The Startup plan is £99/month for 10 usability tests a month with up to 10 AI personas each, paid by card or PayPal and cancellable anytime."],
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
    <section className="relative isolate flex min-h-[640px] items-center overflow-hidden py-28">
      <AntMarch className="-z-10 [mask-image:radial-gradient(ellipse_36%_42%_at_50%_52%,transparent_45%,black_100%)]" />
      {/* Ants walk in and out of soft fog at the section edges rather than being clipped. */}
      <div aria-hidden className="fade-edge-t pointer-events-none absolute inset-x-0 top-0 -z-10 h-28" />
      <div aria-hidden className="fade-edge-b pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28" />
      <div className="container-reading flex flex-col items-center text-center">
        <p className="mb-5 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">Get started</p>
        <h2 className="text-4xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl">Start your first usability test.</h2>
        <p className="mt-5 text-muted-foreground sm:text-lg">Enter your URL and get research insights in minutes.</p>
        <ExploreForm className="mt-9 max-w-xl" id="cta-url" />
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><GlobeIcon className="size-3" /> Public websites only</p>
      </div>
    </section>
  );
}
