import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CurrentYear } from "./current-year";
import { DotWordmark } from "./dot-wordmark";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      <div className="container-marketing flex flex-col gap-6 pt-14 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-2">
          <Logo />
          <p className="text-sm text-muted-foreground">See your product through your users&apos; eyes.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Footer">
          <Link href="/#product" className="hover:text-foreground">Product</Link>
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/login" className="hover:text-foreground">Login</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
        </nav>
      </div>
      <div className="container-marketing pt-14 sm:pt-20">
        <DotWordmark word="Phanera" />
      </div>
      <div className="container-marketing flex flex-wrap justify-between gap-2 pt-8 pb-8 text-xs text-muted-foreground">
        <span>© <CurrentYear /> Phanera. All rights reserved.</span>
        <span className="font-mono">Made of tiny cubes.</span>
      </div>
    </footer>
  );
}
