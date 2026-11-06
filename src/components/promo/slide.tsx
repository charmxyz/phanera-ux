import { HistoryIcon, LayoutDashboardIcon, GlobeIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { PixelAnt } from "@/components/ants/pixel-ant";
import { cn } from "@/lib/utils";

/** A 1920×1080 promo slide: one sentence on top, the product in a browser window below. */
export function Slide({ n, title, url, children }: { n: number; title: string; url: string; children: React.ReactNode }) {
  return (
    <div className="relative flex h-[1080px] w-[1920px] flex-col items-center overflow-hidden bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,#ffffff_0%,#f4f4f6_55%,#ececef_100%)]">
      <div className="flex w-full items-center justify-between px-16 pt-12">
        <div className="flex items-center gap-3 text-[26px] font-medium tracking-tight">
          <PixelAnt className="h-9 w-auto" />Phanera
        </div>
        <span className="font-mono text-[18px] tracking-[0.2em] text-[#71717a]">{String(n).padStart(2, "0")} / 05</span>
      </div>
      <h1 className="mt-10 max-w-[1500px] text-center text-[58px] leading-[1.08] font-medium tracking-[-0.03em] text-balance text-[#111114]">{title}</h1>
      <div className="mt-14 w-[1600px] flex-1 overflow-hidden rounded-t-[22px] border border-b-0 border-[#dadadd] bg-white shadow-[0_50px_140px_-40px_rgba(17,17,20,0.35)]">
        <div className="flex h-12 items-center gap-3 border-b border-[#ececee] bg-[#fafafa] px-5">
          <div className="flex gap-2">{["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="size-3 rounded-full" style={{ background: c }} />)}</div>
          <div className="mx-auto w-[520px] rounded-md border border-[#ececee] bg-white px-4 py-1 text-center font-mono text-[13px] text-[#71717a]">{url}</div>
          <div className="w-14" />
        </div>
        <div className="relative h-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

const NAV = [
  { label: "Dashboard", icon: LayoutDashboardIcon },
  { label: "New usability test", icon: PlusIcon },
  { label: "Websites", icon: GlobeIcon },
  { label: "Usability tests", icon: HistoryIcon },
  { label: "Settings", icon: SettingsIcon },
];

/** Static copy of the dashboard shell, so slides look like the real app. */
export function DashboardShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <aside className="flex w-[250px] shrink-0 flex-col border-r border-[#ececee] bg-[#fafafa] p-3">
        <div className="flex h-12 items-center gap-2 px-2 font-medium"><PixelAnt className="h-6 w-auto" />Phanera</div>
        <nav className="mt-2 grid gap-0.5 text-[14px]">
          {NAV.map(({ label, icon: Icon }) => (
            <span key={label} className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-2", label === active ? "bg-[#efeff1] font-medium" : "text-[#3f3f46]")}>
              <Icon className="size-4" />{label}
            </span>
          ))}
        </nav>
        <div className="mt-auto grid gap-2 rounded-lg border border-[#ececee] bg-white p-3 text-xs">
          <div className="flex justify-between"><span className="font-medium">Startup plan</span><span className="text-[#71717a]">7 of 10 left</span></div>
          <div className="h-1 rounded-full bg-[#ececee]"><div className="h-1 w-[30%] rounded-full bg-[#111114]" /></div>
          <span className="text-[#71717a]">Usability tests this month</span>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden bg-white px-10 py-8">{children}</main>
    </div>
  );
}
