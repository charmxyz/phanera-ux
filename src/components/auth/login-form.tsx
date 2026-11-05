"use client";

import { useEffect, useState, useTransition } from "react";
import { MailIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink } from "@/app/actions/auth";

function mask(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 2)}${"•".repeat(Math.max(1, Math.min(6, user.length - 2)))}@${domain}`;
}

const COOLDOWN = 45;

/** Magic-link form + "check your inbox" state (PRD §7.3–7.4). */
export function LoginForm({ intent, next, onSentChange }: { intent?: string; next?: string; onSentChange?: (sent: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const submit = (address: string) =>
    startTransition(async () => {
      setError(null);
      const res = await sendMagicLink({ email: address, intent, next });
      if (res.ok) {
        setSentTo(address);
        setCooldown(COOLDOWN);
        onSentChange?.(true);
      } else {
        setError(res.error);
        if (res.retryAfter) setCooldown(res.retryAfter);
      }
    });

  if (sentTo) {
    return (
      <div className="grid gap-4">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
          <MailIcon className="mt-0.5 size-4 text-muted-foreground" />
          <div className="grid gap-0.5 text-sm">
            <p>
              Sign-in link sent to <span className="font-mono">{mask(sentTo)}</span>
            </p>
            <p className="text-muted-foreground">It expires in one hour and can be used once.</p>
          </div>
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={pending || cooldown > 0} onClick={() => submit(sentTo)}>
            {pending && <Loader2Icon className="animate-spin" />}
            {cooldown > 0 ? `Resend link in ${cooldown}s` : "Resend link"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSentTo(null);
              setError(null);
              onSentChange?.(false);
            }}
          >
            Change email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit(email);
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10"
          aria-invalid={Boolean(error) || undefined}
        />
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <Button type="submit" size="lg" className="h-10" disabled={pending || cooldown > 0}>
        {pending && <Loader2Icon className="animate-spin" />}
        {cooldown > 0 ? `Try again in ${cooldown}s` : "Send magic link"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">No password needed.</p>
    </form>
  );
}
