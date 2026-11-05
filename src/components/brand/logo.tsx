import Link from "next/link";
import { cn } from "@/lib/utils";
import { PixelAnt } from "@/components/ants/pixel-ant";

/** Wordmark with the Phanera pixel ant. */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2 font-medium tracking-tight", className)} aria-label="Phanera home">
      <PixelAnt className="h-6 w-auto" />
      <span>Phanera</span>
    </Link>
  );
}
