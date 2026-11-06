"use client";

import { useFormStatus } from "react-dom";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Form submit button that shows a spinner while the server action redirects to checkout. */
export function SubmitButton({ children, className, confirm: confirmText }: { children: React.ReactNode; className?: string; confirm?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-70",
        className,
      )}
    >
      {pending && <Loader2Icon className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
