import type { Metadata } from "next";
import { Pricing, FAQ } from "@/components/landing/sections";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <div className="container-reading pt-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mt-4 text-muted-foreground sm:text-lg">Start free with real browser tests. Paid plans with higher limits are coming soon.</p>
      </div>
      <Pricing heading={false} />
      <FAQ />
    </>
  );
}
