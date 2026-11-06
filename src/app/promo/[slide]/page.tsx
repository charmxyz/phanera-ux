import { notFound } from "next/navigation";
import { Slide, DashboardShell } from "@/components/promo/slide";
import { DOMAIN, EVENTS_BY_SESSION, FINDINGS, PERSONA_ROWS, PERSONAS, SESSIONS, SHOT_URLS, TASK, TEST } from "@/components/promo/data";
import { TestWizard } from "@/components/dashboard/test-wizard";
import { ReportBody } from "@/components/report/report-body";
import { SessionDetail } from "@/components/report/session-detail";
import { AntMarch } from "@/components/landing/ants/ant-march";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { StatusLabel } from "@/components/sessions/status";
import { PageHeader } from "@/components/dashboard/page-header";
import { SidebarProvider } from "@/components/ui/sidebar";

/** Five 16:9 promo slides for the hackathon (see scripts/promo-shots.mjs). */
export default async function PromoSlide({ params }: { params: Promise<{ slide: string }> }) {
  const n = Number((await params).slide);
  switch (n) {
    case 1:
      return (
        <Slide n={1} title="See your product through your users' eyes." url="phanera.com">
          <iframe src="/" title="Phanera homepage" className="h-[1000px] w-full border-0" />
        </Slide>
      );
    case 2:
      return (
        <Slide n={2} title="Generate AI personas with different goals, motivations and behaviours." url="phanera.com/dashboard/new">
          <SidebarProvider className="min-h-0">
            <DashboardShell active="New usability test">
              <div className="-mt-[470px]">
                <TestWizard
                  website={{ id: "w", url: `https://${DOMAIN}`, domain: DOMAIN, name: "Acme", description: "Product analytics for growing teams.", type: "B2B SaaS", pageCount: 12 }}
                  suggestedGoals={[TASK]}
                  suggestedPersonas={PERSONAS}
                  limits={{ personasPerTest: 10, pagesPerScan: 50, maxActionsPerPersona: 20, maxDurationMin: 8, planLabel: "Startup" }}
                  usage={{ remaining: 7, allowance: 10, period: "month" }}
                />
              </div>
            </DashboardShell>
          </SidebarProvider>
        </Slide>
      );
    case 3: {
      const live = [
        { p: PERSONAS[0], status: "completed", activity: "Found the Growth plan price", actions: 3 },
        { p: PERSONAS[1], status: "running", activity: "Clicking “Start free trial”", actions: 3 },
        { p: PERSONAS[2], status: "running", activity: "Reading the pricing table", actions: 1 },
        { p: PERSONAS[3], status: "queued", activity: "Waiting for a browser", actions: 0 },
      ];
      return (
        <Slide n={3} title="Watch AI personas attempt real tasks on your live website." url={`phanera.com/dashboard/tests/${DOMAIN}`}>
          <SidebarProvider className="min-h-0">
            <DashboardShell active="Usability tests">
              <div className="grid gap-6">
                <div className="border-b border-border pb-6">
                  <p className="font-mono text-xs text-muted-foreground">Usability test · 6 Nov 2026</p>
                  <h2 className="mt-1 text-2xl font-semibold">{DOMAIN}</h2>
                  <p className="mt-1 text-[15px] text-muted-foreground">{TASK}</p>
                </div>
                <div className="grid gap-4 rounded-xl p-5 ring-1 ring-foreground/10">
                  <div>
                    <p className="text-base font-medium">1 of 4 personas completed</p>
                    <p className="text-sm text-muted-foreground">AI personas are exploring the website in isolated browsers. Statuses update live.</p>
                  </div>
                  <div className="bg-studio relative isolate h-56 overflow-hidden rounded-lg border border-border">
                    <AntMarch className="[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" />
                  </div>
                  <div className="h-1.5 rounded-full bg-muted"><div className="h-1.5 w-1/4 rounded-full bg-primary" /></div>
                  <ul className="grid gap-2">
                    {live.map((l) => (
                      <li key={l.p.name} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                        <AntAvatar seed={l.p.name + l.p.role} size={28} state={l.status === "running" ? "active" : l.status === "completed" ? "done" : "idle"} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{l.p.name} <span className="font-normal text-muted-foreground">· {l.p.role}</span></p>
                          <p className="truncate text-xs text-muted-foreground">{l.activity}</p>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{l.actions}/20</span>
                        <StatusLabel status={l.status} className="text-xs" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </DashboardShell>
          </SidebarProvider>
        </Slide>
      );
    }
    case 4:
      return (
        <Slide n={4} title="Replay every session: the user journey, screenshots and reasoning at each step." url={`phanera.com/dashboard/tests/${DOMAIN}/sessions/priya`}>
          <SidebarProvider className="min-h-0">
            <DashboardShell active="Usability tests">
              <div className="grid gap-5">
                <PageHeader
                  eyebrow={<span>{TASK}</span>}
                  title={<span className="flex items-center gap-3"><AntAvatar seed={PERSONAS[0].name + PERSONAS[0].role} size={32} state="done" />Priya · <span className="font-normal text-muted-foreground">Head of Operations</span></span>}
                  description={<span className="font-mono text-xs">1m 14s · 3 actions · desktop</span>}
                />
                <div className="-mt-1 grid gap-4 [&>div:nth-child(2)]:hidden">
                  <SessionDetail session={SESSIONS[0]} persona={PERSONA_ROWS[0]} events={EVENTS_BY_SESSION.get("s0") ?? []} urls={SHOT_URLS} testGoal={TASK} />
                </div>
              </div>
            </DashboardShell>
          </SidebarProvider>
        </Slide>
      );
    case 5:
      return (
        <Slide n={5} title="Turn observations into prioritised usability findings with suggested fixes." url={`phanera.com/r/${DOMAIN}`}>
          <div className="px-14 pt-10">
            <ReportBody test={TEST} personas={PERSONA_ROWS} sessions={SESSIONS} findings={FINDINGS} eventsBySession={EVENTS_BY_SESSION} urls={SHOT_URLS} />
          </div>
        </Slide>
      );
    default:
      notFound();
  }
}
