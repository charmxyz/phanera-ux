"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";
import { startExplore } from "@/app/actions/auth";
import { normalizeUrl } from "@/lib/validation/url";
import { cn } from "@/lib/utils";

/** Hero / final-CTA URL input. Validates locally, then routes via auth (PRD §6.3, §7.2). */
export function ExploreForm({ className, id = "explore-url" }: { className?: string; id?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<{ token: string; url: string } | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = normalizeUrl(value);
    if (!n.ok) {
      setError(n.error);
      return;
    }
    setError(null);
    setValue(n.url);
    startTransition(async () => {
      const res = await startExplore(n.url);
      if (res.status === "authenticated") router.push(res.redirectTo);
      else if (res.status === "needs_auth") {
        setSent(false);
        setIntent({ token: res.intent, url: res.url });
      } else toast.error(res.error);
    });
  };

  return (
    <>
      <form onSubmit={onSubmit} className={cn("w-full", className)} noValidate>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/80 p-1.5 backdrop-blur-sm sm:flex-row">
          <label htmlFor={id} className="sr-only">Website URL</label>
          <Input
            id={id}
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            placeholder="https://yourwebsite.com"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-11 flex-1 border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Button type="submit" size="lg" className="h-11 px-4" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" /> : null}
            Explore my website
            {!pending && <ArrowRightIcon data-icon="inline-end" />}
          </Button>
        </div>
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-2 text-left text-sm text-destructive">
            {error}
          </p>
        )}
      </form>

      <Dialog open={intent !== null} onOpenChange={(open) => !open && setIntent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{sent ? "Check your inbox" : "Continue with email"}</DialogTitle>
            <DialogDescription>
              {sent
                ? "We sent a sign-in link to your email. Open it to continue to Phanera."
                : "Enter your email and we'll send you a secure sign-in link."}
            </DialogDescription>
          </DialogHeader>
          {intent && (
            <p className="truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
              {intent.url}
            </p>
          )}
          {intent && <LoginForm intent={intent.token} onSentChange={setSent} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
