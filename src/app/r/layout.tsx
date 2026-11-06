import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { SiteFooter } from "@/components/landing/site-footer";
import { ShareCTA } from "@/components/report/share-cta";

// Shared reports are private-by-link: keep them out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function SharedReportLayout({ children }: LayoutProps<"/r">) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container-marketing flex h-14 items-center justify-between">
          <Logo />
          <Link href="#try" className={buttonVariants()}>Try Phanera free</Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <ShareCTA />
      <SiteFooter />
    </>
  );
}
