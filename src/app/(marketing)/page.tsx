import { Hero, HowItWorks, Personas, SessionEvidence, SessionReplaySection, Findings, AgentReadiness, Pricing, FAQ, FinalCTA } from "@/components/landing/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Personas />
      <HowItWorks />
      <SessionEvidence />
      <SessionReplaySection />
      <Findings />
      <AgentReadiness />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  );
}
