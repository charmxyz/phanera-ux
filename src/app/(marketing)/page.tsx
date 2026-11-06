import { Hero, HowItWorks, Personas, SessionEvidence, Findings, AgentReadiness, Pricing, FAQ, FinalCTA } from "@/components/landing/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Personas />
      <HowItWorks />
      <SessionEvidence />
      <Findings />
      <AgentReadiness />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  );
}
