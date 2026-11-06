/**
 * "Acme", a fictional analytics product used as the website under test in the promo
 * slides. Screenshots of these pages become the session replay evidence.
 */
const NAV = ["Product", "Solutions", "Pricing", "Docs", "Customers"];

function AcmeNav() {
  return (
    <header className="flex items-center justify-between border-b border-[#e8e8f0] px-12 py-5">
      <div className="flex items-center gap-2.5 text-[17px] font-semibold text-[#1b1740]">
        <span className="grid size-7 place-items-center rounded-lg bg-[#5b4cf0] text-sm text-white">A</span>Acme
      </div>
      <nav className="flex gap-8 text-[14px] text-[#4a4766]">{NAV.map((n) => <span key={n}>{n}</span>)}</nav>
      <div className="flex items-center gap-3 text-[14px]">
        <span className="text-[#4a4766]">Sign in</span>
        <span className="rounded-lg bg-[#1b1740] px-4 py-2 font-medium text-white">Start free trial</span>
      </div>
    </header>
  );
}

export function AcmeHome() {
  return (
    <div className="min-h-[860px] w-[1366px] bg-white font-sans text-[#1b1740]">
      <AcmeNav />
      <section className="grid grid-cols-[1.05fr_1fr] items-center gap-12 px-12 pt-20 pb-16">
        <div>
          <span className="rounded-full bg-[#efedff] px-3 py-1 text-[13px] font-medium text-[#5b4cf0]">New: AI dashboards</span>
          <h1 className="mt-6 text-[56px] leading-[1.04] font-semibold tracking-tight">Product analytics your whole team understands.</h1>
          <p className="mt-6 max-w-[480px] text-[18px] leading-relaxed text-[#5d5a78]">Track every journey, find drop-offs and ship better releases, without writing a single query.</p>
          <div className="mt-9 flex gap-3">
            <span className="rounded-xl bg-[#5b4cf0] px-6 py-3.5 text-[15px] font-medium text-white">Start free trial</span>
            <span className="rounded-xl border border-[#dcdaf0] px-6 py-3.5 text-[15px] font-medium">Book a demo</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#e8e8f0] bg-[#f8f7ff] p-6 shadow-[0_30px_80px_-40px_rgba(40,30,120,.45)]">
          <div className="mb-4 flex gap-2">{["Activation", "Retention", "Revenue"].map((t, i) => <span key={t} className={`rounded-md px-3 py-1 text-[12px] ${i ? "text-[#77749a]" : "bg-white font-medium shadow-sm"}`}>{t}</span>)}</div>
          <div className="flex h-[220px] items-end gap-2.5 rounded-xl bg-white p-5">
            {[38, 52, 46, 63, 58, 72, 69, 84, 78, 92, 88, 97].map((h, i) => <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[#5b4cf0] to-[#9a8dff]" style={{ height: `${h}%` }} />)}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">{[["Weekly users", "48.2k"], ["Activation", "61%"], ["Churn", "2.4%"]].map(([k, v]) => <div key={k} className="rounded-lg bg-white p-3"><p className="text-[11px] text-[#77749a]">{k}</p><p className="text-[20px] font-semibold">{v}</p></div>)}</div>
        </div>
      </section>
      <section className="grid grid-cols-3 gap-6 px-12 pb-16">
        {[["Journeys", "See how users move through your product."], ["Funnels", "Spot exactly where conversions drop."], ["Alerts", "Hear about regressions before customers do."]].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-[#e8e8f0] p-6"><p className="text-[17px] font-semibold">{t}</p><p className="mt-2 text-[14px] text-[#5d5a78]">{d}</p></div>
        ))}
      </section>
    </div>
  );
}

export function AcmePricing() {
  const plans = [
    { n: "Starter", p: "$0", d: "For side projects", f: ["1 project", "10k events / month", "Community support"] },
    { n: "Growth", p: "$49", d: "For growing teams", f: ["5 projects", "1M events / month", "Funnels & journeys"], hi: true },
    { n: "Enterprise", p: "Contact sales", d: "For larger organisations", f: ["Unlimited projects", "SSO & audit logs", "Dedicated support"] },
  ];
  return (
    <div className="min-h-[860px] w-[1366px] bg-white font-sans text-[#1b1740]">
      <AcmeNav />
      <section className="px-12 pt-16 text-center">
        <h1 className="text-[46px] font-semibold tracking-tight">Simple, transparent pricing</h1>
        <p className="mt-3 text-[17px] text-[#5d5a78]">Start free. Upgrade when your team grows.</p>
      </section>
      <section className="mx-auto grid max-w-[1100px] grid-cols-3 gap-6 px-12 pt-12">
        {plans.map((pl) => (
          <div key={pl.n} className={`rounded-2xl border p-7 ${pl.hi ? "border-[#5b4cf0] shadow-[0_30px_80px_-40px_rgba(40,30,120,.5)]" : "border-[#e8e8f0]"}`}>
            <p className="text-[15px] font-semibold">{pl.n}</p>
            <p className="mt-1 text-[13px] text-[#77749a]">{pl.d}</p>
            <p className="mt-5 text-[38px] font-semibold tracking-tight">{pl.p}<span className="text-[15px] font-normal text-[#77749a]">{pl.p.startsWith("$") ? " / month" : ""}</span></p>
            <ul className="mt-5 grid gap-2.5 text-[14px] text-[#4a4766]">{pl.f.map((x) => <li key={x}>✓ {x}</li>)}</ul>
            <span className={`mt-7 block rounded-xl py-3 text-center text-[14px] font-medium ${pl.hi ? "bg-[#5b4cf0] text-white" : "border border-[#dcdaf0]"}`}>{pl.hi ? "Start free trial" : pl.n === "Enterprise" ? "Contact sales" : "Get started"}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
