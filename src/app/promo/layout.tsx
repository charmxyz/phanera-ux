import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Promo", robots: { index: false, follow: false } };

/**
 * Hackathon promo slides and the fictional demo site they show. Available in development,
 * or in a local production build started with ENABLE_PROMO=1. Never set that on Vercel.
 */
export default function PromoLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_PROMO !== "1") notFound();
  return (
    <div data-surface="white" className="flex-1 bg-background">
      <Suspense>{children}</Suspense>
    </div>
  );
}
