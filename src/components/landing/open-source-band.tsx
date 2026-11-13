import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { GithubMark } from "@/components/brand/github-mark";
import { buttonVariants } from "@/components/ui/button";
import { GITHUB_URL } from "@/lib/contact";

/**
 * The footer's pointer to self-hosting. Hidden with CSS on /self-host (its hero carries
 * data-page="self-host"), so the footer stays a server component with no pathname hook.
 */
export function OpenSourceBand() {
  return (
    <div className="container-marketing pt-10 [body:has([data-page=self-host])_&]:hidden">
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
  );
}
