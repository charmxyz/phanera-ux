import { AntMarch } from "@/components/landing/ants/ant-march";
import { ExploreForm } from "@/components/landing/explore-form";

/** Closing call to action on shared reports: run the same test on your own site. */
export function ShareCTA() {
  return (
    <section id="try" className="bg-studio grain relative isolate flex min-h-[520px] scroll-mt-14 items-center overflow-hidden py-24">
      <AntMarch className="-z-10 [mask-image:radial-gradient(ellipse_36%_42%_at_50%_52%,transparent_45%,black_100%)]" />
      <div aria-hidden className="fade-edge-t pointer-events-none absolute inset-x-0 top-0 -z-10 h-28" />
      <div aria-hidden className="fade-edge-b pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28" />
      <div className="container-reading flex flex-col items-center text-center">
        <p className="mb-5 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">Like what you&apos;re seeing?</p>
        <h2 className="text-4xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl">Send the colony to your own website.</h2>
        <p className="mt-5 text-muted-foreground sm:text-lg">AI personas explore your site in real browsers and report exactly where they got stuck.</p>
        <ExploreForm className="mt-9 max-w-xl" id="share-cta-url" />
        <p className="mt-3 text-xs text-muted-foreground">Free plan includes 5 test runs. No card needed.</p>
      </div>
    </section>
  );
}
