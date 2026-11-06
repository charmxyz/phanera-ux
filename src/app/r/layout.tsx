import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteFooter } from "@/components/landing/site-footer";
import { ShareCTA } from "@/components/report/share-cta";

// Shared reports are private-by-link: keep them out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function SharedReportLayout({ children }: LayoutProps<"/r">) {
  return (
    // Shared reports use a plain white page (the dashboard keeps its grey studio theme).
    <div data-surface="white" className="flex flex-1 flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container-marketing flex h-14 items-center justify-between">
          <Logo />
          <Link href="#try" className={buttonVariants()}>Try Phanera free</Link>
        </div>
      </header>
      <main className="flex-1">
        {/* Reports are loaded per request (by share token), so they stream in behind a skeleton. */}
        <Suspense fallback={<ReportSkeleton />}>{children}</Suspense>
      </main>
      <ShareCTA />
      <SiteFooter />
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="container-marketing grid gap-8 py-10 sm:py-14" aria-busy>
      <div className="grid gap-4">
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-6 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
