"use client";

import { useState, useTransition } from "react";
import { CheckIcon, CopyIcon, ExternalLinkIcon, Link2Icon, Loader2Icon, Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { setTestSharing } from "@/app/actions/share";

/** Owner-only control for the test's public, view-only report link. */
export function ShareButton({ testId, initialUrl, finished }: { testId: string; initialUrl: string | null; finished: boolean }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const toggle = (enabled: boolean) =>
    start(async () => {
      const res = await setTestSharing(testId, enabled);
      if (!res.ok) return void toast.error(res.error);
      setUrl(res.url);
      if (!enabled) toast.success("Link turned off. Anyone who had it can no longer view the report.");
    });

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={!finished} title={finished ? undefined : "Available when the test finishes"}>
        <Share2Icon /> {url ? "Shared" : "Share"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this report</DialogTitle>
            <DialogDescription>
              Anyone with the link can view the findings, sessions and screenshots. No login needed. They can&apos;t change anything or see the rest of your account.
            </DialogDescription>
          </DialogHeader>
          {url ? (
            <div className="grid gap-3">
              <div className="flex gap-2">
                <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" aria-label="Share link" />
                <Button onClick={copy} className="shrink-0">{copied ? <CheckIcon /> : <CopyIcon />}{copied ? "Copied" : "Copy"}</Button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  Open public page <ExternalLinkIcon className="size-3" />
                </a>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={pending} onClick={() => toggle(false)}>
                  {pending && <Loader2Icon className="animate-spin" />} Stop sharing
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => toggle(true)} disabled={pending} className="h-10">
              {pending ? <Loader2Icon className="animate-spin" /> : <Link2Icon />} Create public link
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
