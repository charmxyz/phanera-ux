import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { GithubMark } from "@/components/brand/github-mark";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT_EMAIL, GITHUB_URL } from "@/lib/contact";
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
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <Link href="/self-host" className="hover:text-foreground">Self-hosting</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
          <Link href="/login" className="hover:text-foreground">Login</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">Contact</a>
        </nav>
      </div>
      <div className="container-marketing pt-10">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="max-w-[560px]">
            <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">Open source, MIT</p>
            <p className="mt-2 font-medium">Self-host Phanera</p>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">
              The code is on GitHub. Run it on your own servers with your own Claude API key, and pay nothing for the app.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/self-host" className={buttonVariants({ className: "gap-1.5" })}>
              Self-hosting <ArrowRightIcon className="size-4" />
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", className: "gap-1.5" })}>
              <GithubMark className="size-4" /> GitHub
            </a>
          </div>
        </div>
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
