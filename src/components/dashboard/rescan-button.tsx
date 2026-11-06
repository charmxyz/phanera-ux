"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startDiscovery } from "@/app/actions/dashboard";

export function RescanButton({ url, disabled }: { url: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={disabled || pending}
      onClick={() =>
        start(async () => {
          const res = await startDiscovery(url);
          if (res.ok) router.refresh();
          else toast.error(res.error);
        })
      }
    >
      {pending ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />} Re-analyse
    </Button>
  );
}
