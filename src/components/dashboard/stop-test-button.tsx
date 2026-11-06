"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, SquareIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { stopTest } from "@/app/actions/dashboard";

/** Stop a running test. After a grace period without the worker responding, offers a force stop. */
export function StopTestButton({ testId, requestedAt, graceMs }: { testId: string; requestedAt: string | null; graceMs: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [canForce, setCanForce] = useState(false);

  useEffect(() => {
    if (!requestedAt) return;
    const wait = new Date(requestedAt).getTime() + graceMs - Date.now();
    const t = setTimeout(() => setCanForce(true), Math.max(0, wait));
    return () => clearTimeout(t);
  }, [requestedAt, graceMs]);

  const run = (confirmText: string) => {
    if (!window.confirm(confirmText)) return;
    start(async () => {
      const res = await stopTest(testId);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.state === "stopped" ? "Test stopped." : "Stopping… personas that already finished still get a report.");
      router.refresh();
    });
  };

  if (requestedAt && !canForce) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2Icon className="animate-spin" /> Stopping…
      </Button>
    );
  }
  if (requestedAt && canForce) {
    return (
      <Button variant="outline" size="sm" disabled={pending} className="text-destructive hover:text-destructive"
        onClick={() => run("The worker hasn't responded. Force stop this test now? Finished sessions are kept; if none finished, the run is refunded.")}>
        {pending ? <Loader2Icon className="animate-spin" /> : <SquareIcon />} Force stop
      </Button>
    );
  }
  return (
    <Button variant="outline" size="sm" disabled={pending}
      onClick={() => run("Stop this test? Personas that already finished still get a report. If none finished, the run won't count against your usage.")}>
      {pending ? <Loader2Icon className="animate-spin" /> : <SquareIcon />} Stop test
    </Button>
  );
}
