"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, ArrowRightIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startDiscovery } from "@/app/actions/dashboard";
import { normalizeUrl } from "@/lib/validation/url";

/** Confirms a URL and starts discovery. Discovery never consumes test-run allowance. */
export function DiscoveryUrlForm({ defaultUrl = "", cta = "Explore website", autoFocus }: { defaultUrl?: string; cta?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      noValidate
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const n = normalizeUrl(value);
        if (!n.ok) return setError(n.error);
        setError(null);
        startTransition(async () => {
          const res = await startDiscovery(n.url);
          if (res.ok) router.push(`/dashboard/new?website=${res.websiteId}`);
          else toast.error(res.error);
        });
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="discovery-url" className="sr-only">Website URL</label>
        <Input
          id="discovery-url"
          autoFocus={autoFocus}
          inputMode="url"
          spellCheck={false}
          placeholder="https://acme.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-10 font-mono"
          aria-invalid={Boolean(error) || undefined}
        />
        <Button type="submit" size="lg" className="h-10" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : null}
          {cta}
          {!pending && <ArrowRightIcon data-icon="inline-end" />}
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
