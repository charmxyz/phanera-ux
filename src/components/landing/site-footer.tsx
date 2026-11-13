import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CONTACT_EMAIL, GITHUB_URL } from "@/lib/contact";
import { CurrentYear } from "./current-year";
import { DotWordmark } from "./dot-wordmark";
import { OpenSourceBand } from "./open-source-band";

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
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <Link href="/self-host" className="hover:text-foreground">Self-hosting</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
          <Link href="/login" className="hover:text-foreground">Login</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">Contact</a>
        </nav>
      </div>
      <OpenSourceBand />
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
