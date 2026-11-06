import Link from "next/link";
import {
  CheckIcon, FileSearchIcon, GlobeIcon, LayoutListIcon, MousePointerClickIcon, NetworkIcon,
  ScanTextIcon, BotIcon, CodeXmlIcon, CompassIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { AntMarch } from "./ants/ant-march";
import { HeroFlower } from "./flower/hero-flower";
import { SeverityBadge } from "@/components/findings/severity-badge";
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
          <p className="mb-6 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">AI persona testing</p>
          <h1 className="text-[2.6rem] leading-[1.02] font-medium tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.5rem]">
            See your website through every perspective.
          </h1>
          <p className="mt-6 max-w-[440px] text-pretty text-muted-foreground sm:text-lg">
            Send autonomous AI personas to explore your website, discover friction, and reveal what humans and AI agents might miss.
          </p>
          <ExploreForm className="mt-9 max-w-lg" id="hero-url" />
          <p className="mt-3 text-xs text-muted-foreground">Free plan includes 5 test runs. Nothing runs until you confirm.</p>
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
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 py-24">
      <div className="container-marketing">
        <SectionHeading eyebrow="How it works" title="One website. Many perspectives.">
          Phanera explores your website through different personas, then brings their experiences together into one clear report.
        </SectionHeading>
        <div className="grid gap-4 md:grid-cols-3">
          <StepCard n={1} title="Discover your website" body="Phanera maps your pages, understands your product, and identifies what visitors are likely trying to accomplish.">
            <div className="grid gap-1.5 font-mono text-xs">
              {[["/", "home"], ["/pricing", "pricing"], ["/features", "product"], ["/docs", "docs"], ["/about", "about"]].map(([p, t], i) => (
                <div key={p} className="flex items-center justify-between rounded-md border border-border bg-background px-2.5 py-1.5" style={{ opacity: 1 - i * 0.12 }}>
                  <span>{p}</span>
                  <span className="text-muted-foreground">{t}</span>
                </div>
              ))}
            </div>
          </StepCard>
          <StepCard n={2} title="Release the colony" body="AI personas independently navigate your website, attempt tasks, and record what happens.">
            <div className="grid gap-2">
              {[["Alex", 100, "done"], ["Sam", 62, "active"], ["Morgan", 35, "active"]].map(([name, v, s]) => (
                <div key={name as string} className="flex items-center gap-3 rounded-md border border-border bg-background px-2.5 py-2">
                  <AntAvatar seed={name as string} size={24} state={s as "done" | "active"} />
                  <div className="grid flex-1 gap-1.5">
                    <div className="flex justify-between text-xs"><span>{name}</span><span className="text-muted-foreground">{s === "done" ? "Completed" : "Exploring"}</span></div>
                    <Progress value={v as number} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </StepCard>
          <StepCard n={3} title="Reveal the findings" body="See where agents succeeded, what blocked them, and which issues deserve attention.">
            <div className="grid gap-1.5">
              {([["high", "Pricing is two clicks deep"], ["medium", "Mixed feature names"], ["low", "Low-contrast CTA on mobile"]] as const).map(([s, t]) => (
                <div key={t} className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs">
                  <SeverityBadge severity={s} />
                  <span className="truncate">{t}</span>
                  <span className="ml-auto font-mono text-muted-foreground">step 3</span>
                </div>
              ))}
            </div>
          </StepCard>
        </div>
      </div>
    </section>
  );
}

function StepCard({ n, title, body, children }: { n: number; title: string; body: string; children: React.ReactNode }) {
  return (
    <Card className="gap-5">
      <CardHeader>
        <p className="font-mono text-xs text-muted-foreground">0{n}</p>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------- Personas */
const EXAMPLE_PERSONAS = [
  { name: "Alex", role: "First-time visitor", goal: "Understand what the product does.", behaviour: "Skims content and expects simple explanations.", icon: CompassIcon },
  { name: "Sam", role: "Potential customer", goal: "Compare plans and find pricing.", behaviour: "Detail-oriented and price-conscious.", icon: LayoutListIcon },
  { name: "Taylor", role: "Technical evaluator", goal: "Identify integrations and technical requirements.", behaviour: "Searches for documentation and precise information.", icon: CodeXmlIcon },
  { name: "Morgan", role: "AI assistant", goal: "Extract reliable product information.", behaviour: "Prioritises structured, accessible and consistent content.", icon: BotIcon },
];

export function Personas() {
  return (
    <section id="product" className="scroll-mt-16 py-24">
      <div className="container-marketing">
        <SectionHeading eyebrow="AI personas" title="Different visitors. Different experiences.">
          Not everyone explores a website the same way. Phanera generates personas with different goals, behaviours, and levels of familiarity.
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
                <div><p className="text-xs text-muted-foreground">Goal</p><p>{p.goal}</p></div>
                <div><p className="text-xs text-muted-foreground">Behaviour</p><p>{p.behaviour}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Example personas. Personas are simulated by AI agents, not real people.</p>
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
        <SectionHeading eyebrow="Session evidence" title="See where they get stuck.">
          Follow each persona&apos;s journey through your website, including the pages they visited, actions they took, and problems they encountered.
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
export function Findings() {
  const items = [
    { s: "high" as const, t: "Pricing page is difficult to discover.", p: ["Sam", "Morgan"], fix: "Add “Pricing” to the primary navigation." },
    { s: "medium" as const, t: "Product features use inconsistent terminology.", p: ["Alex", "Taylor"], fix: "Use one name per feature across pages." },
    { s: "low" as const, t: "Primary action is less prominent on mobile.", p: ["Alex"], fix: "Increase contrast and size of the mobile CTA." },
  ];
  return (
    <section className="py-24">
      <div className="container-marketing">
        <SectionHeading eyebrow="Findings" title="Findings you can actually fix.">
          Turn agent sessions into clear, prioritised recommendations backed by evidence.
        </SectionHeading>
        <div className="mx-auto grid max-w-3xl gap-3">
          {items.map((f) => (
            <Card key={f.t} size="sm">
              <CardContent className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2"><SeverityBadge severity={f.s} /><span className="font-medium">{f.t}</span></div>
                  <p className="text-sm text-muted-foreground"><span className="text-foreground/80">Suggested: </span>{f.fix}</p>
                </div>
                <div className="flex items-center gap-1.5 sm:justify-end">
                  {f.p.map((n) => (
                    <span key={n} className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
                      <AntAvatar seed={n} size={14} />{n}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Agent readiness */
export function AgentReadiness() {
  const items = [
    { icon: FileSearchIcon, t: "Content discovery", d: "Robots, sitemaps and llms.txt — can agents find your important pages?" },
    { icon: CodeXmlIcon, t: "Semantic HTML", d: "Landmarks, headings and labels that give machines a reliable structure." },
    { icon: NetworkIcon, t: "Navigation accessibility", d: "Links and controls an agent can identify and operate without guessing." },
    { icon: ScanTextIcon, t: "Product comprehension", d: "Whether an agent comes away with an accurate picture of what you offer." },
    { icon: MousePointerClickIcon, t: "Agent interaction", d: "Real attempts to complete tasks, recorded step by step." },
  ];
  return (
    <section className="py-24">
      <div className="container-marketing grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">Agent readiness</p>
          <h2 className="text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl">Built for people. Ready for agents.</h2>
          <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
            Your website is increasingly explored by autonomous AI systems. Phanera checks whether agents can discover your pages, interpret your content, and navigate important interactions.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Measured signals are reported separately from AI interpretation, so you always know what was observed.</p>
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
  ["What is Phanera?", "Phanera sends AI personas to explore your public website in real browsers. Each persona attempts a realistic task, and Phanera turns what happened into evidence-backed findings."],
  ["How does Phanera test my website?", "First it discovers your website: it reads permitted pages, your sitemap and navigation, and builds an understanding of your product. Then each persona browses in its own isolated browser sandbox, taking real actions and screenshots. A separate AI evaluator reviews every session before findings are written."],
  ["Are the personas real people?", "No. Personas are simulated by AI agents. They are designed to represent different goals and behaviours, but they are not real users and the results are not user research."],
  ["Does Phanera test whether AI can understand my website?", "Yes. Every test includes an AI assistant persona and an agent-readiness report covering content discovery, semantic structure, navigation and comprehension. Measured signals are shown separately from interpretation."],
  ["Can I test any website?", "Any publicly reachable website. Phanera doesn't test pages behind a login, localhost or private networks, and agents never make purchases or submit forms that change data."],
  ["How long does a test take?", "Discovery usually takes under a minute. A test with three personas typically finishes in a few minutes; you can watch progress live."],
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
        <h2 className="text-4xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl">What would agents discover on your website?</h2>
        <p className="mt-5 text-muted-foreground sm:text-lg">Enter your URL and see your website through a different perspective.</p>
        <ExploreForm className="mt-9 max-w-xl" id="cta-url" />
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><GlobeIcon className="size-3" /> Public websites only</p>
      </div>
    </section>
  );
}
